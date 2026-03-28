import { SUBSCRIPTION_TIERS, TIER_KEYS, FEATURE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@/components/shared/CheckIcon'

interface PricingGridProps {
  /** Called when a plan is selected. Receives the tier key. */
  onSelectPlan: (tier: typeof TIER_KEYS[number]) => void
  /** Whether to render the CTA as a button (true) or anchor-like element (false). Default true. */
  ctaLabel?: (tier: typeof TIER_KEYS[number]) => string
}

export function PricingGrid({ onSelectPlan, ctaLabel }: PricingGridProps) {
  const getLabel = ctaLabel ?? ((key) => key === 'enterprise' ? 'Kontakt aufnehmen' : 'Jetzt starten')

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIER_KEYS.map((key) => {
        const tier = SUBSCRIPTION_TIERS[key]
        const isPopular = key === 'professional'

        return (
          <div
            key={key}
            className={cn(
              'relative flex flex-col rounded-lg border bg-card p-4 sm:p-6',
              isPopular ? 'border-primary' : 'border-border',
            )}
          >
            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                Beliebtester Plan
              </span>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
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
                {' \u00B7 '}
                {tier.maxClients === Infinity
                  ? 'Unbegrenzt Mandanten'
                  : `${tier.maxClients} Mandanten`}
              </p>
            </div>

            <ul className="mb-6 flex-1 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <CheckIcon />
                  {FEATURE_LABELS[feature] ?? feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(key)}
              className={cn(
                'inline-flex min-h-[44px] w-full items-center justify-center rounded-md text-sm font-medium transition-colors',
                isPopular
                  ? 'bg-primary text-primary-foreground hover:bg-accent-hover'
                  : 'border border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {getLabel(key)}
            </button>
          </div>
        )
      })}
    </div>
  )
}
