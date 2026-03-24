import type { ExportDocument, FormatResult } from './types.ts'

/**
 * Bexio CSV import format.
 * Bexio expects: Date;Reference;Account;Counter Account;Description;Debit;Credit;Tax code
 * Tax codes: VST_77 (7.7%), VST_81 (8.1%), VST_26 (2.6%), VST_38 (3.8%)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatBexio(documents: ExportDocument[], _orgName: string): FormatResult {
  const headers = [
    'Datum', 'Referenz', 'Konto', 'Gegenkonto', 'Beschreibung',
    'Soll', 'Haben', 'Steuercode',
  ]

  const rows = documents.map((doc) => {
    const taxCode = getBexioTaxCode(doc.vat_rate)
    const description = `${doc.supplier_name ?? 'Beleg'} - ${doc.file_name}`

    return [
      formatBexioDate(doc.document_date),
      doc.file_name,
      doc.account_number ?? '6500', // Default: Büromaterial
      doc.contra_account ?? '1020', // Default: Bankguthaben
      description,
      doc.amount?.toFixed(2) ?? '0.00', // Debit (expense)
      '', // Credit
      taxCode,
    ].map(escapeCsv).join(';')
  })

  const content = [headers.join(';'), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return {
    content,
    filename: `BelegPilot_Bexio_${date}.csv`,
    contentType: 'text/csv; charset=utf-8',
  }
}

function getBexioTaxCode(vatRate: number | null): string {
  if (vatRate == null) return ''
  if (Math.abs(vatRate - 8.1) < 0.1) return 'VST_81'
  if (Math.abs(vatRate - 7.7) < 0.1) return 'VST_77' // Old rate
  if (Math.abs(vatRate - 2.6) < 0.1) return 'VST_26'
  if (Math.abs(vatRate - 3.8) < 0.1) return 'VST_38'
  return ''
}

function formatBexioDate(date: string | null): string {
  if (!date) return ''
  // YYYY-MM-DD → DD.MM.YYYY
  const parts = date.split('-')
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
  return date
}

function escapeCsv(val: string): string {
  if (val.includes(';') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}
