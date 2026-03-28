/** Subscription tiers matching offer_design.md */
export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 49,
    currency: 'CHF',
    documentsPerMonth: 200,
    maxClients: 15,
    features: ['ai-extraction', 'qr-bill', 'kontenrahmen', 'multilingual', 'csv-export', 'bexio-export'],
  },
  professional: {
    name: 'Professional',
    price: 99,
    currency: 'CHF',
    documentsPerMonth: 1000,
    maxClients: 50,
    features: ['ai-extraction', 'qr-bill', 'kontenrahmen', 'multilingual', 'all-erp-export', 'anomaly-detection', 'vendor-learning', 'batch-upload', 'priority-support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 249,
    currency: 'CHF',
    documentsPerMonth: Infinity,
    maxClients: Infinity,
    features: ['ai-extraction', 'qr-bill', 'kontenrahmen', 'multilingual', 'all-erp-export', 'api-access', 'anomaly-detection', 'vendor-learning', 'batch-upload', 'custom-mapping', 'multi-user', 'onboarding-call', 'phone-support'],
  },
} as const

/** Tier keys for iteration */
export const TIER_KEYS = ['starter', 'professional', 'enterprise'] as const

/** Human-readable feature labels (DE) */
export const FEATURE_LABELS: Record<string, string> = {
  'ai-extraction': 'KI-Belegextraktion',
  'qr-bill': 'QR-Rechnung Erkennung',
  'kontenrahmen': 'Kontenrahmen-Mapping',
  'multilingual': 'DE / FR / IT / EN',
  'csv-export': 'CSV-Export',
  'bexio-export': 'Bexio-Export',
  'all-erp-export': 'Alle ERP-Exporte',
  'anomaly-detection': 'Anomalie-Erkennung',
  'vendor-learning': 'Lieferanten-Lernen',
  'batch-upload': 'Batch-Upload',
  'priority-support': 'Priority Support',
  'api-access': 'API-Zugang',
  'custom-mapping': 'Benutzerdefinierte Kontierung',
  'multi-user': 'Multi-User',
  'onboarding-call': 'Onboarding-Call',
  'phone-support': 'Telefon-Support',
}

/** Document processing statuses */
export const DOCUMENT_STATUSES = {
  uploading: { label: 'Hochladen', color: 'info' },
  processing: { label: 'Verarbeitung', color: 'info' },
  review: { label: 'Prüfung', color: 'warning' },
  verified: { label: 'Verifiziert', color: 'success' },
  exported: { label: 'Exportiert', color: 'success' },
  error: { label: 'Fehler', color: 'error' },
} as const

/** Confidence levels for extracted fields */
export const CONFIDENCE_LEVELS = {
  high: { label: 'Hoch', color: '#16A34A', threshold: 0.9 },
  medium: { label: 'Mittel', color: '#D97706', threshold: 0.7 },
  low: { label: 'Niedrig', color: '#DF1B41', threshold: 0 },
} as const

/** Supported ERP export targets */
export const ERP_TARGETS = {
  csv: { label: 'CSV (Universal)', format: 'csv' },
  bexio: { label: 'Bexio', format: 'csv' },
  abacus: { label: 'Abacus (AbaConnect)', format: 'xml' },
  sage: { label: 'Sage 50', format: 'csv' },
  banana: { label: 'Banana Accounting', format: 'csv' },
} as const

/** Swiss VAT rates */
export const SWISS_VAT_RATES = {
  standard: { rate: 8.1, label: 'Normalsatz 8.1%' },
  reduced: { rate: 2.6, label: 'Reduzierter Satz 2.6%' },
  accommodation: { rate: 3.8, label: 'Sondersatz Beherbergung 3.8%' },
  exempt: { rate: 0, label: 'Befreit' },
} as const
