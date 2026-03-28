import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'
import { PricingGrid } from '@/components/shared/PricingGrid'
import type { TIER_KEYS } from '@/lib/constants'

export default function Pricing() {
  usePageTitle('Preise')
  const navigate = useNavigate()

  function handleSelectPlan(tier: typeof TIER_KEYS[number]) {
    navigate(`/auth?plan=${tier}`)
  }

  return (
    <>
    <PageMeta title="Preise" description="Einfache, transparente Preise für die KI-Belegverarbeitung. Starter ab CHF 49/Monat." canonical="https://belegpilot.predivo.ch/pricing" />
    <div className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Zum Hauptinhalt springen
      </a>
      <main id="main-content" className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Einfache, transparente Preise
          </h1>
          <p className="mt-3 text-lg text-ink-secondary">
            Wählen Sie den Plan, der zu Ihrer Treuhand passt. Jederzeit kündbar.
          </p>
        </div>

        <PricingGrid onSelectPlan={handleSelectPlan} />

        <p className="mt-8 text-center text-sm text-ink-muted">
          Alle Preise in CHF, exkl. MwSt. 14 Tage kostenlos testen, keine Kreditkarte nötig.
        </p>
      </main>
    </div>
    </>
  )
}
