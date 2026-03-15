import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import {
  sendEmail,
  paymentFailedEmail,
  planChangedEmail,
  trialEndingEmail,
} from '../_shared/email.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ─── Plan tiers (low → high) ─────────────────────────────────────────────────

const PLAN_TIERS: Record<string, number> = {
  starter: 0,
  professional: 1,
  enterprise: 2,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get org admin user info by stripe customer ID */
async function getOrgAdminByCustomerId(customerId: string) {
  // Find the org
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!org) return null

  // Find the owner profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', org.id)
    .eq('role', 'owner')
    .single()

  if (!profile) return null

  // Get user email + name from auth
  const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
  if (!user) return null

  return {
    email: user.email!,
    name: user.user_metadata?.full_name ?? user.email!,
    orgId: org.id,
    orgName: org.name,
  }
}

/**
 * stripe-webhook: Handle Stripe subscription events
 *
 * Events handled:
 * - checkout.session.completed → activate subscription
 * - customer.subscription.updated → update plan tier + send email
 * - customer.subscription.deleted → downgrade to free
 * - customer.subscription.trial_will_end → send trial ending email
 * - invoice.payment_failed → send payment failed email
 */
serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${(err as Error).message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        const plan = session.metadata?.plan ?? 'starter'

        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan,
            })
            .eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const newPlan = subscription.metadata?.plan

        if (newPlan) {
          // Get current plan to determine upgrade vs downgrade
          const { data: org } = await supabase
            .from('organizations')
            .select('plan')
            .eq('stripe_customer_id', customerId)
            .single()

          const oldPlan = org?.plan ?? 'starter'
          const isUpgrade = (PLAN_TIERS[newPlan] ?? 0) > (PLAN_TIERS[oldPlan] ?? 0)

          // Update plan in DB
          await supabase
            .from('organizations')
            .update({ plan: newPlan })
            .eq('stripe_customer_id', customerId)

          // Send plan changed email (best-effort)
          const admin = await getOrgAdminByCustomerId(customerId)
          if (admin) {
            const { subject, html } = planChangedEmail(admin.name, newPlan, isUpgrade)
            await sendEmail({ to: admin.email, subject, html }).catch(console.error)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('organizations')
          .update({
            plan: 'starter',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Stripe fires this 3 days before trial ends
        const trialEnd = subscription.trial_end
        const daysLeft = trialEnd
          ? Math.max(1, Math.ceil((trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
          : 3

        const admin = await getOrgAdminByCustomerId(customerId)
        if (admin) {
          const { subject, html } = trialEndingEmail(admin.name, daysLeft)
          await sendEmail({ to: admin.email, subject, html }).catch(console.error)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const admin = await getOrgAdminByCustomerId(customerId)
        if (admin) {
          const { subject, html } = paymentFailedEmail(admin.name)
          await sendEmail({ to: admin.email, subject, html }).catch(console.error)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
