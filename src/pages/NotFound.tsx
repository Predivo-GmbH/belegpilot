import { FileQuestion } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

export default function NotFound() {
  usePageTitle('404')
  return (
    <>
    <PageMeta title="Seite nicht gefunden" noindex />
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <FileQuestion className="h-12 w-12 text-ink-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">404</h1>
      <p className="mt-1 text-sm text-ink-secondary">Seite nicht gefunden</p>
      <a
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
      >
        Zur Startseite
      </a>
    </main>
    </>
  )
}
