export type { Database } from './database'

/** Document status */
export type DocumentStatus = 'uploading' | 'processing' | 'review' | 'verified' | 'exported' | 'error'

/** Confidence level for extracted fields */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** ERP export target */
export type ErpTarget = 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'

/** Subscription plan */
export type Plan = 'starter' | 'professional' | 'enterprise'

/** User role within organization */
export type UserRole = 'owner' | 'member' | 'viewer'

/** Swiss VAT rate key */
export type VatRateKey = 'standard' | 'reduced' | 'accommodation' | 'exempt'

/** Extracted field with confidence */
export interface ExtractedField<T = string> {
  value: T
  confidence: number
  source: 'qr' | 'zugferd' | 'ai' | 'manual'
}

/** Full extraction result from a document */
export interface ExtractionResult {
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
