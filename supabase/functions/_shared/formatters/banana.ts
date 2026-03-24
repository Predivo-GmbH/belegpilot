import type { ExportDocument, FormatResult } from './types.ts'

/**
 * Banana Accounting import format (Tab-separated TXT).
 * Very popular in Swiss small businesses. Uses tab-separated values.
 * Columns: Date\tDoc\tDescription\tAccountDebit\tAccountCredit\tAmount\tVATCode
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatBanana(documents: ExportDocument[], _orgName: string): FormatResult {
  const headers = ['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount', 'VATCode']

  const rows = documents.map((doc) => {
    const vatCode = getBananaVatCode(doc.vat_rate)
    const description = `${doc.supplier_name ?? 'Beleg'} - ${doc.file_name}`

    return [
      formatBananaDate(doc.document_date),
      doc.file_name.slice(0, 30),
      description.slice(0, 120),
      doc.account_number ?? '6500',
      doc.contra_account ?? '1020',
      doc.amount?.toFixed(2) ?? '0.00',
      vatCode,
    ].join('\t')
  })

  const content = [headers.join('\t'), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return {
    content,
    filename: `BelegPilot_Banana_${date}.txt`,
    contentType: 'text/plain; charset=utf-8',
  }
}

function getBananaVatCode(vatRate: number | null): string {
  if (vatRate == null) return ''
  if (Math.abs(vatRate - 8.1) < 0.1) return 'V81'
  if (Math.abs(vatRate - 2.6) < 0.1) return 'V26'
  if (Math.abs(vatRate - 3.8) < 0.1) return 'V38'
  return ''
}

function formatBananaDate(date: string | null): string {
  if (!date) return ''
  const parts = date.split('-')
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
  return date
}
