import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { encode as encodeBase64 } from 'https://deno.land/std@0.208.0/encoding/base64.ts'
import { authenticateRequest, errorResponse, jsonResponse } from '../_shared/auth.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { logAnthropicUsage } from '../_shared/log-usage.ts'
import { extractZugferd, type ZugferdData } from '../_shared/zugferd.ts'
import { suggestAccount, SWISS_VAT_RATES, isValidSwissVatRate } from '../_shared/swiss-accounts.ts'

/**
 * process-document: Main document processing pipeline
 *
 * 1. Download file from Supabase Storage
 * 2. Attempt ZUGFeRD/Factur-X XML extraction (free, instant)
 * 3. Claude Sonnet vision API for remaining/all fields
 * 4. Cross-reference ZUGFeRD data against AI extraction
 * 5. Look up vendor patterns for account suggestions
 * 6. Store extraction results + confidence scores
 *
 * POST /process-document
 * Body: { documentId: string, filePath: string }
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const AI_MODEL = 'claude-haiku-4-5-20251001'

// Pricing per million tokens (Haiku 4.5)
const INPUT_COST_PER_MTOK = 0.80
const OUTPUT_COST_PER_MTOK = 4.0

interface ExtractedField<T = string> {
  value: T
  confidence: number
  source: 'qr' | 'zugferd' | 'ai' | 'manual'
}

interface ExtractionResult {
  supplierName: ExtractedField
  supplierAddress: ExtractedField | null
  supplierIban: ExtractedField | null
  supplierVatNumber: ExtractedField | null
  documentDate: ExtractedField
  dueDate: ExtractedField | null
  invoiceNumber: ExtractedField | null
  amount: ExtractedField<number>
  currency: ExtractedField
  vatRate: ExtractedField<number> | null
  vatAmount: ExtractedField<number> | null
  description: ExtractedField | null
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
    vatRate: number | null
  }>
  qrBillData: Record<string, unknown> | null
  suggestedAccount: string | null
  suggestedContraAccount: string | null
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  let capturedDocumentId: string | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let capturedAdminClient: any = null

  try {
    const { user, adminClient } = await authenticateRequest(req)
    capturedAdminClient = adminClient
    const { documentId, filePath } = await req.json()
    capturedDocumentId = documentId

    if (!documentId || !filePath) {
      return jsonResponse({ error: 'documentId and filePath are required' }, 400)
    }

    // Verify document belongs to user's org
    const { data: profile } = await adminClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, 404)
    }

    const { data: doc } = await adminClient
      .from('documents')
      .select('id, organization_id, file_type')
      .eq('id', documentId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (!doc) {
      return jsonResponse({ error: 'Document not found or access denied' }, 404)
    }

    // Set status to processing
    await adminClient
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // ── Step 1: Download file from Storage ──────────────────────
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('documents')
      .download(filePath)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message ?? 'no data'}`)
    }

    const fileBytes = new Uint8Array(await fileData.arrayBuffer())
    const isPdf = doc.file_type === 'application/pdf'

    // ── Step 2: Try ZUGFeRD extraction (PDF only) ───────────────
    let zugferdData: ZugferdData | null = null
    if (isPdf) {
      try {
        zugferdData = extractZugferd(fileBytes)
        if (zugferdData) {
          console.log('ZUGFeRD data extracted successfully')
        }
      } catch (e) {
        console.warn('ZUGFeRD extraction failed (non-fatal):', e)
      }
    }

    // ── Step 3: Claude Vision API ───────────────────────────────
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const base64Data = encodeBase64(fileBytes)
    const mediaType = isPdf ? 'application/pdf' : doc.file_type

    // Build the content block for Claude
    const documentContent = isPdf
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf', data: base64Data } }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64Data } }

    const systemPrompt = `You are a Swiss accounting document extraction specialist. Extract all financial data from the provided document with high accuracy.

Swiss-specific rules:
- VAT rates: ${SWISS_VAT_RATES.standard}% (standard), ${SWISS_VAT_RATES.reduced}% (reduced), ${SWISS_VAT_RATES.accommodation}% (accommodation), 0% (exempt)
- Currency is CHF unless explicitly stated otherwise
- IBAN format: CH + 2 check digits + 5 digit bank code + 12 digit account number
- Swiss VAT number format: CHE-XXX.XXX.XXX MWST
- If you see a Swiss QR bill (payment slip with QR code), extract the SPC data

Respond ONLY with a valid JSON object matching this exact structure:
{
  "supplierName": { "value": "string", "confidence": 0.0-1.0 },
  "supplierAddress": { "value": "string", "confidence": 0.0-1.0 } | null,
  "supplierIban": { "value": "string", "confidence": 0.0-1.0 } | null,
  "supplierVatNumber": { "value": "string", "confidence": 0.0-1.0 } | null,
  "documentDate": { "value": "YYYY-MM-DD", "confidence": 0.0-1.0 },
  "dueDate": { "value": "YYYY-MM-DD", "confidence": 0.0-1.0 } | null,
  "invoiceNumber": { "value": "string", "confidence": 0.0-1.0 } | null,
  "amount": { "value": number, "confidence": 0.0-1.0 },
  "currency": { "value": "string", "confidence": 0.0-1.0 },
  "vatRate": { "value": number, "confidence": 0.0-1.0 } | null,
  "vatAmount": { "value": number, "confidence": 0.0-1.0 } | null,
  "description": { "value": "string", "confidence": 0.0-1.0 } | null,
  "lineItems": [{ "description": "string", "quantity": number, "unitPrice": number, "total": number, "vatRate": number|null }],
  "qrBillData": { "paymentReference": "string", "iban": "string", "amount": number, ... } | null
}

Rules:
- confidence: 1.0 = certain, 0.8+ = very likely, 0.5-0.8 = possible, <0.5 = uncertain
- For amounts, always extract the total payable amount
- If a field is not found in the document, set it to null
- For dates, always use YYYY-MM-DD format
- Extract ALL line items if present`

    const apiResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              documentContent,
              { type: 'text', text: 'Extract all financial data from this document. Return ONLY the JSON object, no markdown formatting.' },
            ],
          },
        ],
      }),
    })

    if (!apiResponse.ok) {
      const errBody = await apiResponse.text()
      throw new Error(`Anthropic API error (${apiResponse.status}): ${errBody}`)
    }

    const apiResult = await apiResponse.json()
    await logAnthropicUsage('BelegPilot', 'process-document', apiResult)

    // Calculate cost
    const inputTokens = apiResult.usage?.input_tokens ?? 0
    const outputTokens = apiResult.usage?.output_tokens ?? 0
    const aiCost = (inputTokens * INPUT_COST_PER_MTOK + outputTokens * OUTPUT_COST_PER_MTOK) / 1_000_000

    // Parse AI response
    const aiText = apiResult.content?.[0]?.text ?? ''
    let aiExtraction: Record<string, unknown>
    try {
      // Strip markdown code fences if present
      const cleaned = aiText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      aiExtraction = JSON.parse(cleaned)
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${aiText.substring(0, 200)}`)
    }

    // ── Step 4: Cross-reference & merge ─────────────────────────
    const result = mergeExtractions(aiExtraction, zugferdData)

    // ── Step 5: Account suggestion ──────────────────────────────
    const supplierName = result.supplierName?.value ?? null
    const description = result.description?.value ?? null
    const accountSuggestion = suggestAccount(supplierName, description)

    // Check vendor patterns in DB
    if (supplierName) {
      const { data: vendorPattern } = await adminClient
        .from('vendor_patterns')
        .select('default_account, default_contra_account, default_vat_rate')
        .eq('organization_id', profile.organization_id)
        .ilike('vendor_name', supplierName)
        .single()

      if (vendorPattern) {
        result.suggestedAccount = vendorPattern.default_account
        result.suggestedContraAccount = vendorPattern.default_contra_account
        if (vendorPattern.default_vat_rate != null && result.vatRate) {
          result.vatRate = {
            value: vendorPattern.default_vat_rate,
            confidence: 0.95,
            source: 'manual' as const,
          }
        }
      } else if (accountSuggestion) {
        result.suggestedAccount = accountSuggestion.account
        result.suggestedContraAccount = accountSuggestion.contraAccount
      }
    } else if (accountSuggestion) {
      result.suggestedAccount = accountSuggestion.account
      result.suggestedContraAccount = accountSuggestion.contraAccount
    }

    // ── Step 6: Store results ───────────────────────────────────
    const processingDuration = Date.now() - startTime

    const confidenceScores: Record<string, number> = {}
    for (const [key, val] of Object.entries(result)) {
      if (val && typeof val === 'object' && 'confidence' in val) {
        confidenceScores[key] = (val as { confidence: number }).confidence
      }
    }

    await adminClient
      .from('documents')
      .update({
        status: 'review',
        extracted_data: result,
        confidence_scores: confidenceScores,
        qr_data: result.qrBillData,
        amount: result.amount?.value ?? null,
        currency: result.currency?.value ?? 'CHF',
        vat_rate: result.vatRate?.value ?? null,
        document_date: result.documentDate?.value ?? null,
        supplier_name: result.supplierName?.value ?? null,
        supplier_iban: result.supplierIban?.value ?? null,
        supplier_vat_number: result.supplierVatNumber?.value ?? null,
        account_number: result.suggestedAccount,
        contra_account: result.suggestedContraAccount,
        ai_model: AI_MODEL,
        ai_cost: aiCost,
        processing_duration_ms: processingDuration,
        error_message: null,
      })
      .eq('id', documentId)

    // Increment org monthly usage (atomic via RPC, fallback to read-increment-write)
    await adminClient.rpc('increment_org_usage', { org_id: profile.organization_id }).catch(async () => {
      const { data: org } = await adminClient
        .from('organizations')
        .select('documents_this_month')
        .eq('id', profile.organization_id)
        .single()
      if (org) {
        await adminClient
          .from('organizations')
          .update({ documents_this_month: (org.documents_this_month ?? 0) + 1 })
          .eq('id', profile.organization_id)
      }
    })

    // Trigger usage alert check (fire-and-forget)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for usage alert')
    } else {
      fetch(`${supabaseUrl}/functions/v1/send-usage-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ org_id: profile.organization_id }),
      }).catch(() => {}) // Best-effort
    }

    return jsonResponse({
      success: true,
      documentId,
      status: 'review',
      confidence: confidenceScores,
      aiCost: aiCost.toFixed(4),
      processingDurationMs: processingDuration,
      hasZugferd: !!zugferdData,
      hasQrBill: !!result.qrBillData,
    })
  } catch (error) {
    const processingDuration = Date.now() - startTime
    console.error('process-document error:', error)

    // Update document status to error using captured variables
    try {
      if (capturedDocumentId && capturedAdminClient) {
        await capturedAdminClient
          .from('documents')
          .update({
            status: 'error',
            error_message: (error as Error).message,
            processing_duration_ms: processingDuration,
          })
          .eq('id', capturedDocumentId)
      }
    } catch (updateErr) {
      console.error('Failed to update document error status:', updateErr)
    }

    return errorResponse(error)
  }
})

// ── Helpers ──────────────────────────────────────────────────────

function mergeExtractions(
  ai: Record<string, unknown>,
  zugferd: ZugferdData | null,
): ExtractionResult {
  // Start with AI extraction as base
  const result: ExtractionResult = {
    supplierName: toField(ai.supplierName, 'ai') ?? { value: '', confidence: 0, source: 'ai' },
    supplierAddress: toField(ai.supplierAddress, 'ai'),
    supplierIban: toField(ai.supplierIban, 'ai'),
    supplierVatNumber: toField(ai.supplierVatNumber, 'ai'),
    documentDate: toField(ai.documentDate, 'ai') ?? { value: '', confidence: 0, source: 'ai' },
    dueDate: toField(ai.dueDate, 'ai'),
    invoiceNumber: toField(ai.invoiceNumber, 'ai'),
    amount: toNumericField(ai.amount, 'ai') ?? { value: 0, confidence: 0, source: 'ai' },
    currency: toField(ai.currency, 'ai') ?? { value: 'CHF', confidence: 0.9, source: 'ai' },
    vatRate: toNumericField(ai.vatRate, 'ai'),
    vatAmount: toNumericField(ai.vatAmount, 'ai'),
    description: toField(ai.description, 'ai'),
    lineItems: Array.isArray(ai.lineItems) ? ai.lineItems as ExtractionResult['lineItems'] : [],
    qrBillData: ai.qrBillData as Record<string, unknown> | null ?? null,
    suggestedAccount: null,
    suggestedContraAccount: null,
  }

  // If ZUGFeRD data exists, override with higher-confidence structured data
  if (zugferd) {
    if (zugferd.supplierName) {
      result.supplierName = { value: zugferd.supplierName, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.supplierVatId) {
      result.supplierVatNumber = { value: zugferd.supplierVatId, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.supplierIban) {
      result.supplierIban = { value: zugferd.supplierIban, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.invoiceNumber) {
      result.invoiceNumber = { value: zugferd.invoiceNumber, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.issueDate) {
      result.documentDate = { value: zugferd.issueDate, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.dueDate) {
      result.dueDate = { value: zugferd.dueDate, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.totalAmount != null) {
      result.amount = { value: zugferd.totalAmount, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.currency) {
      result.currency = { value: zugferd.currency, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.vatRate != null) {
      result.vatRate = { value: zugferd.vatRate, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.vatAmount != null) {
      result.vatAmount = { value: zugferd.vatAmount, confidence: 1.0, source: 'zugferd' }
    }
    if (zugferd.lineItems.length > 0) {
      result.lineItems = zugferd.lineItems
    }
  }

  // Validate Swiss VAT rate
  if (result.vatRate && !isValidSwissVatRate(result.vatRate.value)) {
    result.vatRate.confidence = Math.min(result.vatRate.confidence, 0.5)
  }

  return result
}

function toField(raw: unknown, defaultSource: 'ai' | 'zugferd'): ExtractedField | null {
  if (!raw || raw === null) return null
  if (typeof raw === 'object' && 'value' in raw) {
    const obj = raw as Record<string, unknown>
    if (obj.value == null || obj.value === '') return null
    return {
      value: String(obj.value),
      confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.8,
      source: defaultSource,
    }
  }
  if (typeof raw === 'string' && raw) {
    return { value: raw, confidence: 0.8, source: defaultSource }
  }
  return null
}

function toNumericField(raw: unknown, defaultSource: 'ai' | 'zugferd'): ExtractedField<number> | null {
  if (!raw || raw === null) return null
  if (typeof raw === 'object' && 'value' in raw) {
    const obj = raw as Record<string, unknown>
    const val = typeof obj.value === 'number' ? obj.value : parseFloat(String(obj.value))
    if (isNaN(val)) return null
    return {
      value: val,
      confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.8,
      source: defaultSource,
    }
  }
  if (typeof raw === 'number') {
    return { value: raw, confidence: 0.8, source: defaultSource }
  }
  return null
}
