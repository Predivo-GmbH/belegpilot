import type { ExportDocument, FormatResult } from './types.ts'

/**
 * Sage 50 CSV import format (Swiss version).
 * Standard columns: Date;DocNo;Account;ContraAccount;Text;Amount;DC;TaxCode;Currency
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatSage(documents: ExportDocument[], _orgName: string): FormatResult {
  const headers = [
    'Datum', 'BelegNr', 'Konto', 'Gegenkonto', 'Text', 'Betrag', 'SH', 'MWST-Code', 'Währung',
  ]

  const rows = documents.map((doc) => {
    const taxCode = getSageTaxCode(doc.vat_rate)
    const description = `${doc.supplier_name ?? 'Beleg'} ${doc.file_name}`

    return [
      formatSageDate(doc.document_date),
      doc.file_name.slice(0, 20),
      doc.account_number ?? '6500',
      doc.contra_account ?? '1020',
      description.slice(0, 80),
      doc.amount?.toFixed(2) ?? '0.00',
      'S', // Soll (debit)
      taxCode,
      doc.currency ?? 'CHF',
    ].map(escapeCsv).join(';')
  })

  const content = [headers.join(';'), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return {
    content,
    filename: `BelegPilot_Sage50_${date}.csv`,
    contentType: 'text/csv; charset=utf-8',
  }
}

function getSageTaxCode(vatRate: number | null): string {
  if (vatRate == null) return ''
  if (Math.abs(vatRate - 8.1) < 0.1) return 'VM81'
  if (Math.abs(vatRate - 2.6) < 0.1) return 'VM26'
  if (Math.abs(vatRate - 3.8) < 0.1) return 'VM38'
  return ''
}

function formatSageDate(date: string | null): string {
  if (!date) return ''
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
