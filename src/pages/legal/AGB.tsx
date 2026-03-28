import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

export default function AGB() {
  usePageTitle('AGB')
  return (
    <>
    <PageMeta title="Allgemeine Geschäftsbedingungen" description="AGB von BelegPilot. Lesen Sie die Nutzungsbedingungen für die KI-Belegverarbeitungsplattform." canonical="https://belegpilot.predivo.ch/agb" />
    <div className="min-h-screen bg-background px-4 py-8 sm:py-16">
      <main className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link to="/" className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary hover:underline">&larr; Zurück zur Startseite</Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Allgemeine Geschäftsbedingungen (AGB)</h1>
          <p className="mt-1 text-sm text-ink-muted">Letzte Aktualisierung: März 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Anbieter</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            BelegPilot ist ein Dienst der:
          </p>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Predivo GmbH<br />
            Bahnhofstrasse 55<br />
            6403 Küssnacht am Rigi, Schweiz<br />
            UID: CHE-374.611.592<br />
            E-Mail:{' '}
            <a href="mailto:info@predivo.ch" className="text-primary hover:underline">info@predivo.ch</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Leistungsbeschreibung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            BelegPilot ist eine KI-gestützte Plattform zur Belegverarbeitung («der Dienst»). Der Dienst ermöglicht das Hochladen von Belegen (Rechnungen, Quittungen, Gutschriften), deren automatische Extraktion und Kategorisierung mittels künstlicher Intelligenz sowie den Export der Buchungssätze in verschiedene ERP-Systeme.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Kostenlose Testphase</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Neue Konten erhalten eine 14-tägige kostenlose Testphase mit vollem Zugang zu allen Funktionen. Während der Testphase ist keine Kreditkarte erforderlich. Nach Ablauf der Testphase können Sie einen kostenpflichtigen Plan wählen, um den Dienst weiter zu nutzen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Kontopflichten</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Sie sind für die Vertraulichkeit Ihrer Zugangsdaten und für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden. Sie müssen korrekte und vollständige Registrierungsinformationen angeben und diese aktuell halten.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Zulässige Nutzung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">Sie verpflichten sich, den Dienst nicht zu folgenden Zwecken zu nutzen:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>Hochladen gefälschter, betrügerischer oder rechtswidriger Belege</li>
            <li>Missbrauch der KI-Extraktion für nicht autorisierte Zwecke</li>
            <li>Automatisierter Missbrauch, Scraping oder Reverse Engineering des Dienstes</li>
            <li>Verstoss gegen geltende Gesetze, Vorschriften oder Rechte Dritter</li>
          </ul>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir behalten uns das Recht vor, Konten bei Verstoss gegen diese Bedingungen ohne vorherige Ankündigung zu sperren oder zu kündigen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. KI-generierte Inhalte</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Der Dienst verwendet künstliche Intelligenz zur Extraktion von Belegdaten und Erstellung von Buchungssätzen. Diese werden als Vorschläge zur Überprüfung bereitgestellt. Sie sind allein verantwortlich für die Buchungen, die Sie auf Basis der KI-Vorschläge erstellen. Die Predivo GmbH übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Angemessenheit der KI-generierten Vorschläge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Geistiges Eigentum</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Der Dienst einschliesslich Software, Design, Marke und Dokumentation ist geistiges Eigentum der Predivo GmbH und durch schweizerisches und internationales Urheberrecht geschützt. Sie behalten das vollständige Eigentum an Ihren Geschäftsdaten, Belegen und allen Inhalten, die Sie über den Dienst erstellen oder exportieren.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Preise & Abrechnung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Kostenpflichtige Pläne werden monatlich über Stripe abgerechnet. Preise sind in CHF angegeben und verstehen sich exklusive MwSt. Sie ermächtigen uns, Ihr Zahlungsmittel wiederkehrend zu belasten. Sie können Ihr Abonnement jederzeit kündigen; der Zugang bleibt bis zum Ende der laufenden Abrechnungsperiode bestehen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Haftungsbeschränkung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Die Gesamthaftung der Predivo GmbH für sämtliche Ansprüche aus oder im Zusammenhang mit dem Dienst ist auf den Gesamtbetrag begrenzt, den Sie in den 12 Monaten vor dem Anspruch für den Dienst bezahlt haben, soweit gesetzlich zulässig. Wir haften nicht für indirekte, beiläufige, Folge- oder Strafschäden, einschliesslich Umsatz-, Daten- oder Geschäftsverlust.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. Verfügbarkeit & Gewährleistung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Der Dienst wird «wie besehen» ohne ausdrückliche oder stillschweigende Gewährleistungen bereitgestellt. Wir bemühen uns um hohe Verfügbarkeit, garantieren jedoch keinen unterbrechungsfreien oder fehlerfreien Betrieb. Geplante Wartungsarbeiten werden mit angemessener Vorankündigung durchgeführt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. Kündigung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Beide Parteien können diesen Vertrag mit einer Frist von 30 Tagen schriftlich kündigen. Nach der Kündigung wird Ihr Zugang zum Dienst gesperrt und Ihre Daten werden innerhalb von 30 Tagen gelöscht, sofern keine gesetzliche Aufbewahrungspflicht besteht. Bei wesentlichem Verstoss gegen diese Bedingungen können wir Ihr Konto sofort kündigen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. Änderungen der AGB</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Wesentliche Änderungen werden per E-Mail oder In-App-Benachrichtigung mindestens 30 Tage vor Inkrafttreten mitgeteilt. Die fortgesetzte Nutzung des Dienstes nach Inkrafttreten der Änderungen gilt als Zustimmung.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">13. Salvatorische Klausel</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Sollte eine Bestimmung dieser AGB unwirksam oder undurchsetzbar sein, wird diese Bestimmung im geringstmöglichen Umfang angepasst, um sie durchsetzbar zu machen. Alle übrigen Bestimmungen behalten ihre volle Gültigkeit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">14. Anwendbares Recht & Gerichtsstand</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Diese AGB unterliegen Schweizer Recht. Ausschliesslicher Gerichtsstand ist Küssnacht am Rigi, Schweiz.
          </p>
        </section>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-ink-muted">
            Fragen zu diesen AGB? Kontaktieren Sie uns unter{' '}
            <a href="mailto:info@predivo.ch" className="inline-flex min-h-[44px] items-center text-primary hover:underline">info@predivo.ch</a>
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            <Link to="/datenschutz" className="inline-flex min-h-[44px] items-center text-primary hover:underline">Datenschutz</Link>
            {' · '}
            <Link to="/impressum" className="inline-flex min-h-[44px] items-center text-primary hover:underline">Impressum</Link>
          </p>
        </div>
      </main>
    </div>
    </>
  )
}
