import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

export default function Datenschutz() {
  usePageTitle('Datenschutz')
  return (
    <>
    <PageMeta title="Datenschutzerklärung" description="Datenschutzerklärung von BelegPilot. Erfahren Sie, wie wir Ihre Daten im Einklang mit dem Schweizer DSG und der EU-DSGVO erheben, nutzen und schützen." canonical="https://belegpilot.predivo.ch/datenschutz" />
    <div className="min-h-screen bg-background px-4 py-8 sm:py-16">
      <main className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link to="/" className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary hover:underline">&larr; Zurück zur Startseite</Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Datenschutzerklärung</h1>
          <p className="mt-1 text-sm text-ink-muted">Letzte Aktualisierung: März 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Verantwortliche Stelle</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Verantwortlich für die Datenverarbeitung ist:
          </p>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Predivo GmbH<br />
            Bahnhofstrasse 55<br />
            6403 Küssnacht am Rigi, Schweiz<br />
            UID: CHE-374.611.592<br />
            E-Mail:{' '}
            <a href="mailto:info@predivo.ch" className="text-primary hover:underline">info@predivo.ch</a>
            <br />
            Vertreter: Roger Müller
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Geltungsbereich</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Diese Datenschutzerklärung gilt für die BelegPilot-Anwendung und -Website (zusammen der «Dienst»). Sie erläutert, wie wir Ihre personenbezogenen Daten gemäss dem Schweizer Datenschutzgesetz (DSG) und, soweit anwendbar, der EU-Datenschutz-Grundverordnung (DSGVO) erheben, nutzen, speichern und schützen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Erhobene Daten</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir erheben und verarbeiten folgende Kategorien personenbezogener Daten:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>
              <strong className="text-foreground">Kontodaten:</strong> E-Mail-Adresse, vollständiger Name und gehashtes Passwort bei der Kontoerstellung.
            </li>
            <li>
              <strong className="text-foreground">Geschäftsdaten:</strong> Hochgeladene Belege, extrahierte Finanzdaten, Mandanteninformationen und Exportkonfigurationen.
            </li>
            <li>
              <strong className="text-foreground">Nutzungsdaten:</strong> Funktionsnutzung, Zeitstempel und Sitzungsinformationen, die für den Betrieb des Dienstes erforderlich sind.
            </li>
            <li>
              <strong className="text-foreground">Zahlungsdaten:</strong> Abrechnungsinformationen, die über Stripe verarbeitet werden. Kreditkartennummern werden nicht bei uns gespeichert.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Zweck der Verarbeitung</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>Bereitstellung und Betrieb des BelegPilot-Dienstes</li>
            <li>KI-gestützte Extraktion und Verarbeitung von Belegdaten</li>
            <li>Authentifizierung Ihrer Identität und Sicherung Ihres Kontos</li>
            <li>Zahlungsabwicklung und Abonnementverwaltung</li>
            <li>Mitteilung von Service-Updates und wichtigen Hinweisen</li>
            <li>Verbesserung des Dienstes auf Basis aggregierter, anonymisierter Nutzungsmuster</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Rechtsgrundlage</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>
              <strong className="text-foreground">Vertragserfüllung:</strong> Verarbeitung, die zur Erbringung des von Ihnen abonnierten Dienstes erforderlich ist.
            </li>
            <li>
              <strong className="text-foreground">Berechtigtes Interesse:</strong> Verbesserung unseres Dienstes und Gewährleistung der Sicherheit.
            </li>
            <li>
              <strong className="text-foreground">Einwilligung:</strong> Soweit erforderlich, beispielsweise für optionale Mitteilungen.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Drittanbieter</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir nutzen folgende Drittanbieter für den Betrieb von BelegPilot:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>
              <strong className="text-foreground">Supabase</strong> (EU-Region) — Authentifizierung, Datenbank- und Speicher-Hosting.
            </li>
            <li>
              <strong className="text-foreground">Anthropic Claude</strong> (USA) — KI-Sprachmodell zur Belegextraktion. Belegbilder und -texte werden zur Verarbeitung an Anthropic übermittelt.
            </li>
            <li>
              <strong className="text-foreground">Metanet AG</strong> (Josefstrasse 218, 8005 Zürich, Schweiz) — Website- und Anwendungs-Hosting.
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> (USA, mit EU-Datenverarbeitung) — Zahlungsabwicklung. Für Zahlungsdaten gilt die Datenschutzerklärung von Stripe.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Cookies</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            BelegPilot verwendet ausschliesslich technisch notwendige Cookies für den Betrieb des Dienstes. Konkret nutzen wir einen Supabase-Authentifizierungs-Session-Cookie, um Sie angemeldet zu halten. Wir verwenden keine Tracking-Cookies, Werbe-Cookies oder Analysedienste wie Google Analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Datenübermittlung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Einige unserer Auftragsverarbeiter (Anthropic, Stripe) haben ihren Sitz in den USA. Bei der Übermittlung personenbezogener Daten ausserhalb der Schweiz oder des EWR stellen wir angemessene Garantien sicher, einschliesslich Standardvertragsklauseln (SCC) und der Einhaltung anerkannter Datenschutzrahmen durch die Auftragsverarbeiter.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Datenspeicherung</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir speichern Ihre Kontodaten, solange Ihr Konto aktiv ist. Bei Löschung Ihres Kontos werden alle personenbezogenen Daten innerhalb von 30 Tagen unwiderruflich entfernt, es sei denn, eine Aufbewahrung ist gesetzlich vorgeschrieben (z.B. Finanzunterlagen nach Schweizer Handelsrecht).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. Ihre Rechte</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Nach Schweizer Datenschutzrecht (DSG) und, soweit anwendbar, der DSGVO haben Sie folgende Rechte:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li><strong className="text-foreground">Auskunftsrecht:</strong> Auskunft über die von uns gespeicherten personenbezogenen Daten.</li>
            <li><strong className="text-foreground">Berichtigungsrecht:</strong> Korrektur unrichtiger Daten.</li>
            <li><strong className="text-foreground">Löschungsrecht:</strong> Löschung Ihrer personenbezogenen Daten.</li>
            <li><strong className="text-foreground">Datenübertragbarkeit:</strong> Erhalt Ihrer Daten in einem strukturierten, maschinenlesbaren Format.</li>
            <li><strong className="text-foreground">Widerrufsrecht:</strong> Widerruf einer erteilten Einwilligung jederzeit.</li>
          </ul>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter{' '}
            <a href="mailto:info@predivo.ch" className="text-primary hover:underline">info@predivo.ch</a>.
            Sie haben zudem das Recht, eine Beschwerde beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) einzureichen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. Datensicherheit</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Wir setzen angemessene technische und organisatorische Massnahmen zum Schutz Ihrer personenbezogenen Daten um, einschliesslich Verschlüsselung bei der Übertragung (TLS), verschlüsselter Speicherung, Zugriffskontrollen und regelmässiger Sicherheitsüberprüfungen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. Anwendbares Recht</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Diese Datenschutzerklärung unterliegt Schweizer Recht. Ausschliesslicher Gerichtsstand ist Küssnacht am Rigi, Schweiz.
          </p>
        </section>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-ink-muted">
            Fragen zu dieser Erklärung? Kontaktieren Sie uns unter{' '}
            <a href="mailto:info@predivo.ch" className="inline-flex min-h-[44px] items-center text-primary hover:underline">info@predivo.ch</a>
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            <Link to="/agb" className="inline-flex min-h-[44px] items-center text-primary hover:underline">AGB</Link>
            {' · '}
            <Link to="/impressum" className="inline-flex min-h-[44px] items-center text-primary hover:underline">Impressum</Link>
          </p>
        </div>
      </main>
    </div>
    </>
  )
}
