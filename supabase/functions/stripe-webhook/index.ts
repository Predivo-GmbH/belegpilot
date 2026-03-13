import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

/**
 * stripe-webhook: Handle Stripe subscription events
 *
 * Events handled:
 * - checkout.session.completed → activate subscription
 * - customer.subscription.updated → update plan tier
 * - customer.subscription.deleted → downgrade to free
 * - invoice.payment_failed → notify user
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

        // Map Stripe price ID to plan tier via metadata
        const plan = subscription.metadata?.plan

        if (plan) {
          await supabase
            .from('organizations')
            .update({ plan })
            .eq('stripe_customer_id', customerId)
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

      case 'invoice.payment_failed': {
        // TODO: Send notification to org admin via email or in-app alert
        console.warn('Payment failed for invoice:', (event.data.object as Stripe.Invoice).id)
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
