import type { ExportDocument, FormatResult } from './types.ts'

/**
 * Abacus AbaConnect XML format.
 * Standard Swiss ERP import format for Abacus accounting software.
 */
export function formatAbacus(documents: ExportDocument[], orgName: string): FormatResult {
  const date = new Date().toISOString().slice(0, 10)

  const entries = documents.map((doc, idx) => {
    const docDate = doc.document_date ?? date
    const amount = doc.amount?.toFixed(2) ?? '0.00'
    const vatCode = getAbacusVatCode(doc.vat_rate)

    return `    <Entry>
      <EntryId>${idx + 1}</EntryId>
      <EntryDate>${docDate}</EntryDate>
      <DebitAccount>${doc.account_number ?? '6500'}</DebitAccount>
      <CreditAccount>${doc.contra_account ?? '1020'}</CreditAccount>
      <Amount>${amount}</Amount>
      <Currency>${doc.currency ?? 'CHF'}</Currency>
      <Text1>${escapeXml(doc.supplier_name ?? 'Beleg')}</Text1>
      <Text2>${escapeXml(doc.file_name)}</Text2>
      <TaxCode>${vatCode}</TaxCode>
    </Entry>`
  }).join('\n')

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<AbaConnectContainer>
  <TaskCount>1</TaskCount>
  <Task>
    <Parameter>
      <Application>FIBU</Application>
      <Id>Booking</Id>
      <MapId>AbaDefault</MapId>
      <Version>2020.00</Version>
    </Parameter>
    <Transaction>
      <Batch>
        <BatchId>BelegPilot_${date}</BatchId>
        <Company>${escapeXml(orgName)}</Company>
        <EntryCount>${documents.length}</EntryCount>
${entries}
      </Batch>
    </Transaction>
  </Task>
</AbaConnectContainer>`

  return {
    content,
    filename: `BelegPilot_Abacus_${date}.xml`,
    contentType: 'application/xml; charset=utf-8',
  }
}

function getAbacusVatCode(vatRate: number | null): string {
  if (vatRate == null) return ''
  if (Math.abs(vatRate - 8.1) < 0.1) return 'VM81'
  if (Math.abs(vatRate - 2.6) < 0.1) return 'VM26'
  if (Math.abs(vatRate - 3.8) < 0.1) return 'VM38'
  return ''
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
