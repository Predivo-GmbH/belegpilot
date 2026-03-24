/**
 * ZUGFeRD/Factur-X XML extraction from PDFs.
 *
 * Many European invoices embed structured XML (ZUGFeRD/Factur-X/XRechnung)
 * inside the PDF. This is free, instant, and 100% accurate when present.
 *
 * We attempt a lightweight extraction by scanning the PDF bytes for
 * the embedded XML attachment, since a full PDF parser is heavy for Deno.
 */

export interface ZugferdData {
  invoiceNumber: string | null
  issueDate: string | null
  dueDate: string | null
  supplierName: string | null
  supplierVatId: string | null
  supplierIban: string | null
  supplierAddress: string | null
  buyerName: string | null
  currency: string | null
  totalAmount: number | null
  vatRate: number | null
  vatAmount: number | null
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
    vatRate: number | null
  }>
}

/**
 * Try to extract ZUGFeRD/Factur-X XML from raw PDF bytes.
 * Returns null if no embedded XML is found.
 */
export function extractZugferd(pdfBytes: Uint8Array): ZugferdData | null {
  // ZUGFeRD XML is typically embedded as a file attachment named
  // "factur-x.xml", "ZUGFeRD-invoice.xml", or "xrechnung.xml"
  // We scan for the XML start/end markers within the PDF stream.

  const text = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes)

  // Look for CrossIndustryInvoice (ZUGFeRD/Factur-X root element)
  const xmlStartPatterns = [
    '<rsm:CrossIndustryInvoice',
    '<CrossIndustryInvoice',
    '<ram:CrossIndustryInvoice',
  ]

  let xmlStart = -1
  for (const pattern of xmlStartPatterns) {
    const idx = text.indexOf(pattern)
    if (idx !== -1 && (xmlStart === -1 || idx < xmlStart)) {
      xmlStart = idx
    }
  }

  if (xmlStart === -1) return null

  // Find closing tag
  const closingTags = [
    '</rsm:CrossIndustryInvoice>',
    '</CrossIndustryInvoice>',
    '</ram:CrossIndustryInvoice>',
  ]
  let xmlEnd = -1
  for (const tag of closingTags) {
    const idx = text.indexOf(tag, xmlStart)
    if (idx !== -1) {
      xmlEnd = idx + tag.length
      break
    }
  }

  if (xmlEnd === -1) return null

  const xml = text.substring(xmlStart, xmlEnd)
  return parseZugferdXml(xml)
}

/** Extract a value between XML tags (simple, no full XML parser needed) */
function xmlValue(xml: string, tagName: string): string | null {
  // Handle namespaced tags: try with common prefixes
  const prefixes = ['ram:', 'udt:', 'rsm:', 'qdt:', '']
  for (const prefix of prefixes) {
    const fullTag = `${prefix}${tagName}`
    const startTag = `<${fullTag}`
    const idx = xml.indexOf(startTag)
    if (idx === -1) continue

    const contentStart = xml.indexOf('>', idx) + 1
    const endTag = `</${fullTag}>`
    const contentEnd = xml.indexOf(endTag, contentStart)
    if (contentEnd === -1) continue

    return xml.substring(contentStart, contentEnd).trim()
  }
  return null
}

/** Extract all values matching a tag pattern */
function xmlValues(xml: string, tagName: string): string[] {
  const results: string[] = []
  const prefixes = ['ram:', 'udt:', 'rsm:', '']
  for (const prefix of prefixes) {
    const fullTag = `${prefix}${tagName}`
    const regex = new RegExp(`<${fullTag}[^>]*>([^<]*)</${fullTag}>`, 'g')
    let match
    while ((match = regex.exec(xml)) !== null) {
      results.push(match[1].trim())
    }
  }
  return results
}

/** Parse ZUGFeRD XML into structured data */
function parseZugferdXml(xml: string): ZugferdData {
  // Invoice number
  const invoiceNumber = xmlValue(xml, 'ID') // First ID is usually invoice number

  // Dates (format: YYYYMMDD in ZUGFeRD)
  const dateStrings = xmlValues(xml, 'DateTimeString')
  const issueDate = dateStrings[0] ? formatZugferdDate(dateStrings[0]) : null
  const dueDate = dateStrings.length > 1 ? formatZugferdDate(dateStrings[1]) : null

  // Supplier (seller)
  const supplierName = xmlValue(xml, 'Name') // First Name is typically seller
  const supplierVatId = findVatId(xml)
  const supplierIban = xmlValue(xml, 'IBANID')

  // Amounts
  const grandTotal = xmlValue(xml, 'GrandTotalAmount')
  const taxBasisTotal = xmlValue(xml, 'TaxBasisTotalAmount')
  const taxTotal = xmlValue(xml, 'TaxTotalAmount')
  const currency = xmlValue(xml, 'InvoiceCurrencyCode')

  // VAT
  const ratePercent = xmlValue(xml, 'RateApplicablePercent')

  // Line items
  const lineItems = extractLineItems(xml)

  return {
    invoiceNumber,
    issueDate,
    dueDate,
    supplierName,
    supplierVatId,
    supplierIban,
    supplierAddress: null, // Would need deeper parsing
    buyerName: null,
    currency: currency ?? 'CHF',
    totalAmount: grandTotal ? parseFloat(grandTotal) : (taxBasisTotal ? parseFloat(taxBasisTotal) : null),
    vatRate: ratePercent ? parseFloat(ratePercent) : null,
    vatAmount: taxTotal ? parseFloat(taxTotal) : null,
    lineItems,
  }
}

function formatZugferdDate(dateStr: string): string | null {
  // ZUGFeRD dates: YYYYMMDD → YYYY-MM-DD
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }
  return dateStr
}

function findVatId(xml: string): string | null {
  // VAT IDs appear in SpecifiedTaxRegistration > ID
  const match = xml.match(/<(?:ram:)?SpecifiedTaxRegistration[^>]*>[\s\S]*?<(?:ram:)?ID[^>]*>([^<]+)</i)
  return match ? match[1].trim() : null
}

function extractLineItems(xml: string): ZugferdData['lineItems'] {
  const items: ZugferdData['lineItems'] = []

  // Split by IncludedSupplyChainTradeLineItem
  const lineItemPattern = /<(?:ram:)?IncludedSupplyChainTradeLineItem>([\s\S]*?)<\/(?:ram:)?IncludedSupplyChainTradeLineItem>/g
  let match
  while ((match = lineItemPattern.exec(xml)) !== null) {
    const block = match[1]
    const desc = xmlValue(block, 'Name') ?? xmlValue(block, 'Content') ?? ''
    const qty = xmlValue(block, 'BilledQuantity')
    const unitPrice = xmlValue(block, 'ChargeAmount')
    const total = xmlValue(block, 'LineTotalAmount')
    const rate = xmlValue(block, 'RateApplicablePercent')

    items.push({
      description: desc,
      quantity: qty ? parseFloat(qty) : 1,
      unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
      total: total ? parseFloat(total) : 0,
      vatRate: rate ? parseFloat(rate) : null,
    })
  }

  return items
}
