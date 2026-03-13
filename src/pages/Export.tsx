import { AppLayout } from '@/components/layout/AppLayout'
import { Download } from 'lucide-react'

export default function Export() {
  return (
    <AppLayout title="Export" subtitle="Exportieren Sie Buchungssätze in Ihr ERP-System.">
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
        <Download className="h-10 w-10 text-ink-muted" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-foreground">ERP-Export</p>
        <p className="mt-1 text-sm text-ink-muted">Diese Funktion wird in einem zukünftigen Update verfügbar sein.</p>
      </div>
    </AppLayout>
  )
}
