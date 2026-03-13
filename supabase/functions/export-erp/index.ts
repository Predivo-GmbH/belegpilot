import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * export-erp: Generate ERP-specific export files
 *
 * Supported formats:
 * - CSV (universal)
 * - Bexio CSV
 * - Abacus AbaConnect XML
 * - Sage 50 CSV
 * - Banana Accounting CSV
 *
 * Input: { documentIds: string[], erpTarget: string, clientId: string }
 * Output: File download URL
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentIds, erpTarget, clientId } = await req.json()

    // TODO: Sprint 2 — implement ERP export generation
    return new Response(
      JSON.stringify({ status: 'stub', documentIds, erpTarget, clientId, message: 'export-erp not yet implemented' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
