/** Shared types for ERP formatters */

export interface ExportDocument {
  id: string
  file_name: string
  document_date: string | null
  supplier_name: string | null
  supplier_iban: string | null
  supplier_vat_number: string | null
  amount: number | null
  currency: string | null
  vat_rate: number | null
  account_number: string | null
  contra_account: string | null
  extracted_data: Record<string, unknown> | null
}

export interface FormatResult {
  content: string
  filename: string
  contentType: string
}

export type Formatter = (documents: ExportDocument[], orgName: string) => FormatResult
