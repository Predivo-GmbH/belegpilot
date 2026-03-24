/**
 * Kontenrahmen KMU (Swiss SME Chart of Accounts) — common account mappings.
 * Used for auto-suggesting account numbers based on supplier/description keywords.
 */

export interface AccountSuggestion {
  account: string
  contraAccount: string
  label: string
}

/** Keyword → account mapping for common Swiss business expenses */
const KEYWORD_RULES: Array<{ keywords: string[]; account: string; contra: string; label: string }> = [
  // Office & IT
  { keywords: ['büromaterial', 'office', 'papier', 'toner', 'drucker'], account: '6500', contra: '1020', label: 'Büromaterial' },
  { keywords: ['software', 'saas', 'cloud', 'hosting', 'domain', 'server'], account: '6570', contra: '1020', label: 'IT-Kosten' },
  { keywords: ['telefon', 'mobile', 'swisscom', 'sunrise', 'salt'], account: '6510', contra: '1020', label: 'Telefon/Internet' },
  { keywords: ['internet', 'fiber', 'breitband'], account: '6510', contra: '1020', label: 'Telefon/Internet' },

  // Rent & Facilities
  { keywords: ['miete', 'mietkosten', 'raumkosten'], account: '6000', contra: '1020', label: 'Raumkosten/Miete' },
  { keywords: ['strom', 'energie', 'elektrizität', 'heizung'], account: '6040', contra: '1020', label: 'Energie/Nebenkosten' },
  { keywords: ['reinigung', 'cleaning', 'putz'], account: '6050', contra: '1020', label: 'Reinigung' },

  // Insurance & Fees
  { keywords: ['versicherung', 'insurance', 'prämie'], account: '6300', contra: '1020', label: 'Versicherungen' },
  { keywords: ['rechtsberatung', 'anwalt', 'notar', 'legal'], account: '6550', contra: '1020', label: 'Rechtsberatung' },
  { keywords: ['treuhand', 'revision', 'buchhaltung', 'audit'], account: '6560', contra: '1020', label: 'Treuhand/Revision' },

  // Travel & Transport
  { keywords: ['reise', 'reisekosten', 'flug', 'hotel', 'übernachtung'], account: '6640', contra: '1020', label: 'Reisekosten' },
  { keywords: ['sbb', 'bahn', 'zug', 'halbtax', 'ga'], account: '6640', contra: '1020', label: 'Reisekosten' },
  { keywords: ['benzin', 'tankstelle', 'diesel', 'parkgebühr'], account: '6200', contra: '1020', label: 'Fahrzeugkosten' },
  { keywords: ['auto', 'fahrzeug', 'leasing', 'garage'], account: '6200', contra: '1020', label: 'Fahrzeugkosten' },

  // Marketing & Sales
  { keywords: ['werbung', 'marketing', 'inserat', 'google ads', 'facebook'], account: '6600', contra: '1020', label: 'Werbeaufwand' },
  { keywords: ['druckkosten', 'flyer', 'broschüre', 'visitenkarten'], account: '6600', contra: '1020', label: 'Werbeaufwand' },

  // Personnel
  { keywords: ['lohn', 'gehalt', 'salär', 'salary'], account: '5000', contra: '1020', label: 'Löhne' },
  { keywords: ['ahv', 'iv', 'eo', 'sozialversicherung', 'bvg', 'pensionskasse'], account: '5700', contra: '1020', label: 'Sozialversicherungen' },

  // Materials & Goods
  { keywords: ['material', 'rohstoff', 'ware', 'einkauf', 'lieferant'], account: '4000', contra: '1020', label: 'Materialaufwand' },
  { keywords: ['post', 'porto', 'versand', 'dhl', 'ups', 'fedex'], account: '6520', contra: '1020', label: 'Porto/Versand' },

  // Financial
  { keywords: ['bank', 'kontoführung', 'bankgebühr', 'spesen'], account: '6800', contra: '1020', label: 'Bankspesen' },
  { keywords: ['zins', 'zinsen', 'kredit', 'darlehen'], account: '6900', contra: '1020', label: 'Zinsaufwand' },

  // Revenue (incoming)
  { keywords: ['umsatz', 'erlös', 'ertrag', 'honorar'], account: '1020', contra: '3000', label: 'Umsatzerlöse' },
]

/**
 * Suggest account numbers based on supplier name and/or description.
 * Returns null if no confident match is found.
 */
export function suggestAccount(
  supplierName: string | null,
  description: string | null,
): AccountSuggestion | null {
  const text = `${supplierName ?? ''} ${description ?? ''}`.toLowerCase()
  if (!text.trim()) return null

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return { account: rule.account, contraAccount: rule.contra, label: rule.label }
    }
  }

  return null
}

/** Swiss VAT rates (2024+) */
export const SWISS_VAT_RATES = {
  standard: 8.1,
  reduced: 2.6,
  accommodation: 3.8,
  exempt: 0,
} as const

/** Validate that a VAT rate matches a known Swiss rate (with tolerance) */
export function isValidSwissVatRate(rate: number): boolean {
  return Object.values(SWISS_VAT_RATES).some((r) => Math.abs(r - rate) < 0.05)
}
