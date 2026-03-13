import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * process-document: Main document processing pipeline
 *
 * 1. Download file from Supabase Storage
 * 2. Attempt QR code extraction (free, instant)
 * 3. Check for ZUGFeRD/Factur-X XML (free, instant)
 * 4. Fall back to Claude Sonnet vision API for remaining fields
 * 5. Cross-reference QR data against AI extraction for anomaly detection
 * 6. Store extraction results + confidence scores
 * 7. Auto-categorize to Kontenrahmen KMU account
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()

    // TODO: Sprint 2 — implement full extraction pipeline
    return new Response(
      JSON.stringify({ status: 'stub', documentId, message: 'process-document not yet implemented' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
