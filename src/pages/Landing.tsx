import { Link, useNavigate } from 'react-router-dom'
import type { TIER_KEYS } from '@/lib/constants'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'
import { BelegPilotLogo } from '@/components/shared/BelegPilotLogo'
import { PricingGrid } from '@/components/shared/PricingGrid'

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
  usePageTitle()
  const navigate = useNavigate()

  function handleSelectPlan(tier: typeof TIER_KEYS[number]) {
    navigate(`/auth?mode=signup&plan=${tier}`)
  }

  return (
    <>
    <PageMeta title="KI-Belegverarbeitung für Schweizer Treuhand" description="Ihre Mandanten schicken Schuhkartons voller Belege — BelegPilot macht daraus in Sekunden fertige Buchungssätze." canonical="https://belegpilot.predivo.ch/" />
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Zum Hauptinhalt springen
      </a>
      {/* ── Navbar ── */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <BelegPilotLogo />
            <span className="text-sm font-semibold text-foreground">BelegPilot</span>
          </Link>
          <nav aria-label="Hauptnavigation" className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/pricing"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 text-sm font-medium text-ink-secondary hover:text-foreground sm:px-0"
            >
              Preise
            </Link>
            <Link
              to="/auth"
              className="hidden min-h-[44px] items-center text-sm font-medium text-ink-secondary hover:text-foreground sm:inline-flex"
            >
              Anmelden
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-accent-hover sm:px-4"
            >
              Kostenlos testen
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
      {/* ── Hero ── */}
      <section className="px-4 pb-10 pt-12 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-micro-label">Für Schweizer Treuhandbüros</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Aus Schuhkartons voller Belege werden fertige Buchungssätze
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-secondary">
            BelegPilot erkennt Rechnungen per KI, validiert MWST-Sätze und exportiert direkt in Ihr ERP — in Sekunden statt Stunden.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-accent-hover sm:w-auto"
            >
              14 Tage kostenlos testen
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted sm:w-auto"
            >
              Demo ansehen
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Keine Kreditkarte nötig · Setup in 2 Minuten</p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-y border-border bg-card px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-12 sm:gap-y-4">
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">50+</p>
            <p className="text-sm text-ink-muted">Treuhandbüros</p>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">120&apos;000+</p>
            <p className="text-sm text-ink-muted">Belege verarbeitet</p>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-foreground">99.2%</p>
            <p className="text-sm text-ink-muted">Erkennungsrate</p>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          <div className="text-center">
            <p className="font-mono text-xl font-bold text-foreground sm:text-2xl">Swiss Made</p>
            <p className="text-sm text-ink-muted">Hosting in der Schweiz</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-micro-label">Funktionen</p>
            <h2 className="text-2xl font-bold text-foreground">
              Alles, was Ihre Treuhand für die Belegverarbeitung braucht
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-3 sm:p-5">
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
      <section className="border-y border-border bg-card px-4 py-12 sm:py-20">
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
      <section className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-micro-label">Preise</p>
            <h2 className="text-2xl font-bold text-foreground">
              Einfache, transparente Preise
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">Jederzeit kündbar. 14 Tage kostenlos testen.</p>
          </div>

          <PricingGrid onSelectPlan={handleSelectPlan} />

          <p className="mt-8 text-center text-sm text-ink-muted">
            Alle Preise in CHF, exkl. MwSt.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-y border-border bg-card px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Bereit, Ihre Belegverarbeitung zu automatisieren?</h2>
          <p className="mt-3 text-sm text-ink-secondary">
            Starten Sie heute mit BelegPilot und sparen Sie Stunden pro Woche bei der Belegerfassung.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
          >
            14 Tage kostenlos testen
          </Link>
        </div>
      </section>
      </main>

      {/* ── Footer ── */}
      <footer className="px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <BelegPilotLogo />
              <span className="text-sm font-semibold text-foreground">BelegPilot</span>
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink-muted">KI-gest&uuml;tzte Belegerfassung f&uuml;r Schweizer Treuhand und KMU.</p>
            <p className="mt-1.5 text-[10px] text-ink-muted/60">Swiss-made &middot; Software that Thinks Ahead</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted sm:gap-6">
            <Link to="/pricing" className="inline-flex min-h-[44px] items-center hover:text-foreground">Preise</Link>
            <Link to="/datenschutz" className="inline-flex min-h-[44px] items-center hover:text-foreground">Datenschutz</Link>
            <Link to="/agb" className="inline-flex min-h-[44px] items-center hover:text-foreground">AGB</Link>
            <Link to="/impressum" className="inline-flex min-h-[44px] items-center hover:text-foreground">Impressum</Link>
          </div>
          <p className="text-sm text-ink-muted">&copy; 2026 BelegPilot by Predivo GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
    </>
  )
}
