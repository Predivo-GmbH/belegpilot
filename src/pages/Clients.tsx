import { AppLayout } from '@/components/layout/AppLayout'
import { Users } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function Clients() {
  usePageTitle('Mandanten')
  return (
    <AppLayout title="Mandanten" subtitle="Verwalten Sie Ihre Mandanten und deren Einstellungen.">
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
        <Users className="h-10 w-10 text-ink-muted" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-foreground">Mandantenverwaltung</p>
        <p className="mt-1 text-sm text-ink-muted">Diese Funktion wird in einem zukünftigen Update verfügbar sein.</p>
      </div>
    </AppLayout>
  )
}
