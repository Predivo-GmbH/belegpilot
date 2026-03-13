import { Link } from 'react-router-dom'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* ── Logo component (reused from sidebar) ── */
function BelegPilotLogo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'
  const svg = size === 'lg' ? 22 : 18
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-foreground', dim)}>
      <svg width={svg} height={svg} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M10 37c-2 0-3-1-3-4-0.5-8-0.5-18 0-26 0-3 2-4 4-4l8 0c6 0 10 4 10 9 0 4-3 7-7 7.5 5 0.5 9 4.5 9 9 0 5.5-5 8.5-11 8.5z m3-29c0 0 4-0.5 6 0 3 1 4.5 2.5 4.5 4.5 0 2-1.5 4-5 4.5l-5.5 0z m0 14c0 0 5-0.5 7 0 3 1 5 3 5 5.5 0 2.5-2 4.5-5.5 4.5l-6.5 0z"
          fill="#0E7C6B"
          fillRule="evenodd"
        />
      </svg>
    </div>
  )
}

/* ── Inline check icon ── */
function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.25 4.75L6 12 2.75 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Feature labels ── */
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

/* ── Features for the grid section ── */
const FEATURES = [
  {
    title: 'KI-Belegextraktion',
    description: 'Claude Vision erkennt alle relevanten Felder — Betrag, MWST, IBAN, Kontonummer — aus Rechnungen, Quittungen und Gutschriften.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: 'QR-Rechnung & ZUGFeRD',
    description: 'Automatische Erkennung von Swiss QR-Codes und ZUGFeRD/Factur-X-Daten — strukturierte Daten ohne manuelle Eingabe.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
        <path d="M21 21v.01" />
        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
        <path d="M3 12h.01" />
        <path d="M12 3h.01" />
        <path d="M12 16v.01" />
        <path d="M16 12h1" />
        <path d="M21 12v.01" />
        <path d="M12 21v-1" />
      </svg>
    ),
  },
  {
    title: 'Alle Schweizer ERP-Systeme',
    description: 'Export nach Bexio, Abacus, Sage 50, Banana Accounting oder als universelle CSV — konfigurierbar pro Mandant.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    title: 'Anomalie-Erkennung',
    description: 'BelegPilot markiert verdächtige Beträge, Duplikate und unbekannte Lieferanten automatisch — bevor Fehler in die Buchhaltung gelangen.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M3.44 18.67 10.5 3.67a1.7 1.7 0 0 1 3 0l7.06 15a1.7 1.7 0 0 1-1.5 2.33H4.94a1.7 1.7 0 0 1-1.5-2.33" />
      </svg>
    ),
  },
  {
    title: 'Lieferanten-Lernen',
    description: 'BelegPilot merkt sich Kontierungen pro Lieferant. Nach wenigen Belegen bucht das System automatisch richtig.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: 'MWST-konform',
    description: 'Alle Schweizer MWST-Sätze (8.1%, 2.6%, 3.8%) sind integriert. BelegPilot erkennt und validiert den korrekten Satz automatisch.',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
]

/* ── How It Works steps ── */
const STEPS = [
  { number: '01', title: 'Belege hochladen', description: 'Laden Sie Rechnungen, Quittungen oder Gutschriften hoch — als PDF, Foto oder direkt aus dem Scanner.' },
  { number: '02', title: 'KI extrahiert & prüft', description: 'BelegPilot erkennt alle relevanten Felder, validiert MWST-Sätze und markiert Anomalien automatisch.' },
  { number: '03', title: 'In Ihr ERP exportieren', description: 'Exportieren Sie fertige Buchungssätze direkt nach Bexio, Abacus, Sage 50 oder als CSV — mit einem Klick.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <BelegPilotLogo />
            <span className="text-sm font-semibold text-foreground">BelegPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className="text-sm font-medium text-ink-secondary hover:text-foreground"
            >
              Preise
            </Link>
            <Link
              to="/auth"
              className="text-sm font-medium text-ink-secondary hover:text-foreground"
            >
              Anmelden
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
            >
              Kostenlos testen
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-4 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-micro-label">Für Schweizer Treuhandbüros</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Aus Schuhkartons voller Belege werden fertige Buchungssätze
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-secondary">
            BelegPilot erkennt Rechnungen per KI, validiert MWST-Sätze und exportiert direkt in Ihr ERP — in Sekunden statt Stunden.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
            >
              14 Tage kostenlos testen
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Demo ansehen
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Keine Kreditkarte nötig · Setup in 2 Minuten</p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-y border-border bg-card px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">50+</p>
            <p className="text-sm text-ink-muted">Treuhandbüros</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">120&apos;000+</p>
            <p className="text-sm text-ink-muted">Belege verarbeitet</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">99.2%</p>
            <p className="text-sm text-ink-muted">Erkennungsrate</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">Swiss Made</p>
            <p className="text-sm text-ink-muted">Hosting in der Schweiz</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-micro-label">Funktionen</p>
            <h2 className="text-2xl font-bold text-foreground">
              Alles, was Ihre Treuhand für die Belegverarbeitung braucht
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-border bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-micro-label">So funktioniert&apos;s</p>
            <h2 className="text-2xl font-bold text-foreground">In drei Schritten zum Buchungssatz</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="text-center">
                <span className="mb-3 inline-block font-mono text-3xl font-bold text-primary">{s.number}</span>
                <h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-micro-label">Preise</p>
            <h2 className="text-2xl font-bold text-foreground">
              Einfache, transparente Preise
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">Jederzeit kündbar. 14 Tage kostenlos testen.</p>
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
                      {' · '}
                      {tier.maxClients === Infinity
                        ? 'Unbegrenzt Mandanten'
                        : `${tier.maxClients} Mandanten`}
                    </p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
                        <Check />
                        {FEATURE_LABELS[feature] ?? feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/auth?mode=signup&plan=${key}`}
                    className={cn(
                      'inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors',
                      isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-accent-hover'
                        : 'border border-border bg-card text-foreground hover:bg-muted',
                    )}
                  >
                    {key === 'enterprise' ? 'Kontakt aufnehmen' : 'Jetzt starten'}
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-ink-muted">
            Alle Preise in CHF, exkl. MwSt.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-y border-border bg-card px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Bereit, Ihre Belegverarbeitung zu automatisieren?</h2>
          <p className="mt-3 text-sm text-ink-secondary">
            Starten Sie heute mit BelegPilot und sparen Sie Stunden pro Woche bei der Belegerfassung.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
          >
            14 Tage kostenlos testen
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <BelegPilotLogo />
            <span className="text-sm font-semibold text-foreground">BelegPilot</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-ink-muted">
            <Link to="/pricing" className="hover:text-foreground">Preise</Link>
            <span>Datenschutz</span>
            <span>AGB</span>
            <span>Impressum</span>
          </div>
          <p className="text-sm text-ink-muted">&copy; 2026 BelegPilot. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  )
}
