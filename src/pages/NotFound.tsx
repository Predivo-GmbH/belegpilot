import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <FileQuestion className="h-12 w-12 text-ink-muted" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">404</h1>
      <p className="mt-1 text-sm text-ink-secondary">Seite nicht gefunden</p>
      <a
        href="/"
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
      >
        Zur Startseite
      </a>
    </div>
  )
}
