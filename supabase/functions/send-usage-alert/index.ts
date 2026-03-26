import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail, usageAlertEmail } from '../_shared/email.ts'

/**
 * send-usage-alert: Check document usage quotas and send alerts at 80% and 100%.
 *
 * Designed to be called by a Supabase cron job or after each document upload.
 * Can be called with a specific org_id or will check all organizations.
 *
 * POST /send-usage-alert
 * Body (optional): { "org_id": "uuid" }
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (admin access).
 */

const PLAN_QUOTAS: Record<string, number> = {
  starter: 200,
  professional: 1000,
  enterprise: 5000,
}

const ALERT_THRESHOLDS = [80, 100]

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse optional org_id from body
    let targetOrgId: string | null = null
    try {
      const body = await req.json()
      targetOrgId = body?.org_id ?? null
    } catch {
      // No body or invalid JSON — check all orgs
    }

    // Build query
    let query = supabase
      .from('organizations')
      .select('id, name, plan, documents_this_month')

    if (targetOrgId) {
      query = query.eq('id', targetOrgId)
    }

    const { data: orgs, error: orgsError } = await query
    if (orgsError) throw orgsError

    let alertsSent = 0

    for (const org of orgs ?? []) {
      const limit = PLAN_QUOTAS[org.plan] ?? PLAN_QUOTAS.starter
      const usage = org.documents_this_month ?? 0
      const percentage = Math.round((usage / limit) * 100)

      // Check if any threshold is crossed
      const crossedThreshold = ALERT_THRESHOLDS.find(t => percentage >= t)
      if (!crossedThreshold) continue

      // Find org owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', org.id)
        .eq('role', 'owner')
        .single()

      if (!profile) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      if (!user?.email) continue

      const userName = user.user_metadata?.full_name ?? user.email
      const { subject, html } = usageAlertEmail(userName, org.name, usage, limit, percentage)

      await sendEmail({ to: user.email, subject, html }).catch(console.error)
      alertsSent++
    }

    return new Response(
      JSON.stringify({ success: true, alerts_sent: alertsSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Usage alert error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
