import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { authenticateRequest, errorResponse, jsonResponse, AuthError } from '../_shared/auth.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { sendEmail, accountDeletedEmail } from '../_shared/email.ts'
import { logError } from '../_shared/error-log.ts'

/**
 * delete-account: Permanently delete the authenticated user's account and all data.
 *
 * Deletes in FK order: exports → documents → clients → vendor_patterns → profiles → organizations → auth user
 * Sends a confirmation email (best-effort) before deleting the auth user.
 *
 * POST /delete-account (requires Authorization header)
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    const { user, adminClient } = await authenticateRequest(req)

    // Get user info for email before we delete everything
    const { data: { user: fullUser } } = await adminClient.auth.admin.getUserById(user.id)
    const userName = fullUser?.user_metadata?.full_name ?? fullUser?.email ?? ''
    const userEmail = fullUser?.email

    // Get user's organization
    const { data: profile } = await adminClient
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new AuthError('Profile not found', 404)
    }

    if (profile.role !== 'owner') {
      throw new AuthError('Only account owners can delete accounts', 403)
    }

    const orgId = profile.organization_id

    // Delete all data in FK order
    // 1. Exports (references documents)
    await adminClient
      .from('exports')
      .delete()
      .eq('organization_id', orgId)

    // 2. Documents (references clients + organizations)
    await adminClient
      .from('documents')
      .delete()
      .eq('organization_id', orgId)

    // 3. Clients
    await adminClient
      .from('clients')
      .delete()
      .eq('organization_id', orgId)

    // 4. Vendor patterns
    await adminClient
      .from('vendor_patterns')
      .delete()
      .eq('organization_id', orgId)

    // 5. All profiles in this org (could be multiple members)
    await adminClient
      .from('profiles')
      .delete()
      .eq('organization_id', orgId)

    // 6. Organization
    await adminClient
      .from('organizations')
      .delete()
      .eq('id', orgId)

    // 7. Send deletion confirmation email (best-effort, before auth delete)
    if (userEmail) {
      const { subject, html } = accountDeletedEmail(userName)
      await sendEmail({ to: userEmail, subject, html }).catch(err => logError('delete-account', 'deletion_confirmation_email', err, { userId: user.id }))
    }

    // 8. Delete auth user (must be last — loses the JWT)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw new AuthError(`Failed to delete auth user: ${deleteError.message}`, 500)
    }

    return jsonResponse({ success: true })
  } catch (err) {
    return errorResponse(err)
  }
})
