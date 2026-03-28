import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

export default function Impressum() {
  usePageTitle('Impressum')
  return (
    <>
    <PageMeta title="Impressum" description="Impressum von BelegPilot, einem Dienst der Predivo GmbH, Küssnacht am Rigi, Schweiz." canonical="https://belegpilot.predivo.ch/impressum" />
    <div className="min-h-screen bg-background px-4 py-8 sm:py-16">
      <main className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link to="/" className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary hover:underline">&larr; Zurück zur Startseite</Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Impressum</h1>
          <p className="mt-1 text-sm text-ink-muted">Angaben gemäss Schweizer Recht</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Unternehmen</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Predivo GmbH<br />
            Bahnhofstrasse 55<br />
            6403 Küssnacht am Rigi<br />
            Schweiz
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Handelsregister</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            UID: CHE-374.611.592<br />
            Handelsregister-Nr.: CH-130-4036622-2<br />
            EHRA-ID: 1738984<br />
            Eingetragen im Handelsregister des Kantons Schwyz
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Geschäftsführer</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">Roger Müller</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            E-Mail:{' '}
            <a href="mailto:info@predivo.ch" className="text-primary hover:underline">info@predivo.ch</a>
            <br />
            Webseite:{' '}
            <a href="https://belegpilot.predivo.ch" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">belegpilot.predivo.ch</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Hosting</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Metanet AG<br />
            Josefstrasse 218<br />
            8005 Zürich<br />
            Schweiz<br />
            <a href="https://www.metanet.ch" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.metanet.ch</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Haftungsausschluss</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Die Informationen auf dieser Website werden zu allgemeinen Informationszwecken bereitgestellt. Die Predivo GmbH bemüht sich um Richtigkeit und Aktualität der bereitgestellten Informationen, übernimmt jedoch keine Haftung für deren Korrektheit, Vollständigkeit oder Aktualität. Haftungsansprüche gegen die Predivo GmbH, die sich auf materielle oder immaterielle Schäden beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen verursacht wurden, sind ausgeschlossen, sofern kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden der Predivo GmbH vorliegt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Haftung für Links</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Jegliche Verantwortung für solche Webseiten wird abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Urheberrecht</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Das Urheberrecht und alle weiteren Rechte an Inhalten, Bildern, Fotos oder sonstigen Dateien auf dieser Website gehören ausschliesslich der Predivo GmbH oder den namentlich genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung des Urheberrechtsinhabers im Voraus einzuholen.
          </p>
        </section>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-ink-muted">
            <Link to="/datenschutz" className="inline-flex min-h-[44px] items-center text-primary hover:underline">Datenschutz</Link>
            {' · '}
            <Link to="/agb" className="inline-flex min-h-[44px] items-center text-primary hover:underline">AGB</Link>
          </p>
        </div>
      </main>
    </div>
    </>
  )
}
