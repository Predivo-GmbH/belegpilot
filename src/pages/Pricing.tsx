import { useNavigate } from 'react-router-dom'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'

const FEATURE_LABELS: Record<string, string> = {
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

const TIER_KEYS = ['starter', 'professional', 'enterprise'] as const

export default function Pricing() {
  usePageTitle('Preise')
  const navigate = useNavigate()

  function handleSelectPlan(tier: string) {
    // Navigate to auth with plan pre-selected — Stripe checkout happens post-signup
    navigate(`/auth?plan=${tier}`)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Einfache, transparente Preise
          </h1>
          <p className="mt-3 text-lg text-ink-secondary">
            Wählen Sie den Plan, der zu Ihrer Treuhand passt. Jederzeit kündbar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIER_KEYS.map((key) => {
            const tier = SUBSCRIPTION_TIERS[key]
            const isPopular = key === 'professional'

            return (
              <div
                key={key}
                className={cn(
                  'relative flex flex-col rounded-lg border bg-card p-6',
                  isPopular ? 'border-primary' : 'border-border',
                )}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Beliebtester Plan
                  </span>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">{tier.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-foreground">
                      {tier.currency} {tier.price}
                    </span>
                    <span className="text-sm text-ink-muted">/Monat</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-secondary">
                    {tier.documentsPerMonth === Infinity
                      ? 'Unbegrenzte Dokumente'
                      : `${tier.documentsPerMonth.toLocaleString()} Dokumente/Monat`}
                    {' · '}
                    {tier.maxClients === Infinity
                      ? 'Unbegrenzt Mandanten'
                      : `${tier.maxClients} Mandanten`}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M13.25 4.75L6 12 2.75 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {FEATURE_LABELS[feature] ?? feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(key)}
                  className={cn(
                    'inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors',
                    isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-accent-hover'
                      : 'border border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {key === 'enterprise' ? 'Kontakt aufnehmen' : 'Jetzt starten'}
                </button>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-ink-muted">
          Alle Preise in CHF, exkl. MwSt. 14 Tage kostenlos testen, keine Kreditkarte nötig.
        </p>
      </div>
    </div>
  )
}
