/**
 * send-welcome — Sends a branded welcome email after profile completion.
 *
 * POST /send-welcome
 * Body: {} (uses authenticated user's info)
 *
 * Called from the frontend after completeProfile succeeds.
 */

import { getCorsHeaders } from '../_shared/cors.ts'
import { authenticateRequest, errorResponse, jsonResponse } from '../_shared/auth.ts'
import { sendEmail, welcomeEmail } from '../_shared/email.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    const { user } = await authenticateRequest(req)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user: authUser }, error } = await adminClient.auth.admin.getUserById(user.id)
    if (error || !authUser?.email) {
      return jsonResponse({ sent: false, reason: 'User not found' })
    }

    const userName = authUser.user_metadata?.full_name ?? 'there'
    const template = welcomeEmail(userName)

    await sendEmail({
      to: authUser.email,
      subject: template.subject,
      html: template.html,
    })

    return jsonResponse({ sent: true })
  } catch (err) {
    return errorResponse(err)
  }
})
