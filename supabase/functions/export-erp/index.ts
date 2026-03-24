import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { authenticateRequest, errorResponse, jsonResponse } from '../_shared/auth.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { formatters, SUPPORTED_FORMATS, type ExportDocument } from '../_shared/formatters/index.ts'

/**
 * export-erp: Generate ERP-specific export files from verified documents.
 *
 * POST /export-erp
 * Body: {
 *   documentIds?: string[],    — specific doc IDs to export
 *   erpTarget: string,         — 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
 *   clientId?: string,         — optional: filter by client
 *   dateFrom?: string,         — optional: YYYY-MM-DD filter
 *   dateTo?: string,           — optional: YYYY-MM-DD filter
 * }
 *
 * Returns: { downloadUrl: string, documentCount: number, exportId: string }
 */
serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user, adminClient } = await authenticateRequest(req)
    const body = await req.json()
    const { documentIds, erpTarget, clientId, dateFrom, dateTo } = body

    // Validate format
    if (!erpTarget || !SUPPORTED_FORMATS.includes(erpTarget)) {
      return jsonResponse(
        { error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}` },
        400,
      )
    }

    // Get user's org
    const { data: profile } = await adminClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, 404)
    }

    const orgId = profile.organization_id

    // Get org name for export headers
    const { data: org } = await adminClient
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    // Build query for documents — only verified ones
    let query = adminClient
      .from('documents')
      .select('id, file_name, document_date, supplier_name, supplier_iban, supplier_vat_number, amount, currency, vat_rate, account_number, contra_account, extracted_data')
      .eq('organization_id', orgId)
      .eq('status', 'verified')

    if (documentIds?.length > 0) {
      query = query.in('id', documentIds)
    }
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (dateFrom) {
      query = query.gte('document_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('document_date', dateTo)
    }

    query = query.order('document_date', { ascending: true })

    const { data: documents, error: queryError } = await query
    if (queryError) throw queryError

    if (!documents || documents.length === 0) {
      return jsonResponse({ error: 'No verified documents found matching the criteria' }, 404)
    }

    // Format documents
    const formatter = formatters[erpTarget]
    const result = formatter(documents as ExportDocument[], org?.name ?? 'BelegPilot')

    // Upload to Storage
    const exportPath = `${orgId}/exports/${result.filename}`
    const { error: uploadError } = await adminClient.storage
      .from('exports')
      .upload(exportPath, new TextEncoder().encode(result.content), {
        contentType: result.contentType,
        upsert: true,
      })

    if (uploadError) {
      // Try creating the bucket if it doesn't exist
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        await adminClient.storage.createBucket('exports', { public: false })
        const { error: retryError } = await adminClient.storage
          .from('exports')
          .upload(exportPath, new TextEncoder().encode(result.content), {
            contentType: result.contentType,
            upsert: true,
          })
        if (retryError) throw retryError
      } else {
        throw uploadError
      }
    }

    // Create signed URL (1 hour)
    const { data: signedUrl, error: signError } = await adminClient.storage
      .from('exports')
      .createSignedUrl(exportPath, 3600)

    if (signError) throw signError

    // Record the export
    const documentIdList = documents.map((d) => d.id)
    const { data: exportRecord, error: exportError } = await adminClient
      .from('exports')
      .insert({
        organization_id: orgId,
        client_id: clientId ?? null,
        erp_target: erpTarget,
        document_ids: documentIdList,
        file_path: exportPath,
        status: 'completed',
      })
      .select('id')
      .single()

    if (exportError) throw exportError

    // Mark exported documents
    await adminClient
      .from('documents')
      .update({ status: 'exported' })
      .in('id', documentIdList)

    return jsonResponse({
      success: true,
      exportId: exportRecord.id,
      downloadUrl: signedUrl.signedUrl,
      documentCount: documents.length,
      format: erpTarget,
      filename: result.filename,
    })
  } catch (error) {
    return errorResponse(error)
  }
})
