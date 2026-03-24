import type { ExportDocument, FormatResult } from './types.ts'

/** Generic CSV export — universal, importable by most tools */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatCsv(documents: ExportDocument[], _orgName: string): FormatResult {
  const headers = [
    'Datum', 'Belegnummer', 'Lieferant', 'Beschreibung', 'Betrag', 'Währung',
    'MWST-Satz', 'MWST-Betrag', 'Konto', 'Gegenkonto', 'IBAN', 'UID',
  ]

  const rows = documents.map((doc) => {
    const vatAmount = doc.amount && doc.vat_rate
      ? ((doc.amount * doc.vat_rate) / (100 + doc.vat_rate)).toFixed(2)
      : ''
    const description = getDescription(doc)

    return [
      doc.document_date ?? '',
      doc.file_name,
      doc.supplier_name ?? '',
      description,
      doc.amount?.toFixed(2) ?? '',
      doc.currency ?? 'CHF',
      doc.vat_rate?.toFixed(1) ?? '',
      vatAmount,
      doc.account_number ?? '',
      doc.contra_account ?? '',
      doc.supplier_iban ?? '',
      doc.supplier_vat_number ?? '',
    ].map(escapeCsv).join(';')
  })

  const content = [headers.join(';'), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return {
    content,
    filename: `BelegPilot_Export_${date}.csv`,
    contentType: 'text/csv; charset=utf-8',
  }
}

function escapeCsv(val: string): string {
  if (val.includes(';') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function getDescription(doc: ExportDocument): string {
  const extracted = doc.extracted_data as Record<string, unknown> | null
  if (extracted?.description && typeof extracted.description === 'object') {
    const desc = extracted.description as { value?: string }
    return desc.value ?? ''
  }
  return ''
}
