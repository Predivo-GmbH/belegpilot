import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const ALLOWED_REDIRECT_ORIGINS = [
  'https://belegpilot.predivo.ch',
  'http://localhost:5173',
]

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not configured')
const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' })

/**
 * create-checkout: Create a Stripe Checkout session for plan upgrade
 *
 * POST body: { plan: 'starter' | 'professional' | 'enterprise' }
 * Returns: { url: string } — Stripe Checkout URL to redirect to
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user's org
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan } = await req.json()

    // Map plan to Stripe Price ID (configured in env vars)
    const priceId = Deno.env.get(`STRIPE_PRICE_${plan.toUpperCase()}`)
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if org already has a Stripe customer
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', profile.organization_id)
      .single()

    let customerId = org?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { org_id: profile.organization_id, supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    // Validate redirect origin to prevent open redirect
    const requestOrigin = req.headers.get('origin') ?? ''
    const redirectOrigin = ALLOWED_REDIRECT_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_REDIRECT_ORIGINS[0]

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${redirectOrigin}/dashboard?checkout=success`,
      cancel_url: `${redirectOrigin}/pricing`,
      metadata: {
        org_id: profile.organization_id,
        plan,
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
