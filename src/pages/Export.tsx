import { useState } from 'react'
import { Download, Loader2, FileDown, CheckCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { ERP_TARGETS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useDocuments } from '@/hooks/useDocuments'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'
import { toast } from 'sonner'

type ErpTarget = keyof typeof ERP_TARGETS

export default function Export() {
  usePageTitle('Export')
  const [selectedErp, setSelectedErp] = useState<ErpTarget>('csv')
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  const { data: documents, isLoading } = useDocuments({ status: 'verified' })

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (!documents) return
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set())
    } else {
      setSelectedDocs(new Set(documents.map((d) => d.id)))
    }
  }

  const handleExport = async () => {
    if (selectedDocs.size === 0) {
      toast.error('Bitte wählen Sie mindestens ein Dokument aus.')
      return
    }

    setIsExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Keine aktive Sitzung')

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-erp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocs),
          erpTarget: selectedErp,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Export fehlgeschlagen')
      }

      const result = await res.json()

      // Download the file
      if (result.downloadUrl) {
        const a = document.createElement('a')
        a.href = result.downloadUrl
        a.download = result.filename ?? `BelegPilot_Export.${selectedErp === 'abacus' ? 'xml' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }

      toast.success(`${result.documentCount} Dokument${result.documentCount > 1 ? 'e' : ''} als ${ERP_TARGETS[selectedErp].label} exportiert`)
      setSelectedDocs(new Set())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export fehlgeschlagen')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
    <PageMeta title="Export" noindex />
    <AppLayout
      title="Export"
      subtitle="Exportieren Sie verifizierte Buchungssätze in Ihr ERP-System."
      action={
        selectedDocs.size > 0 ? (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            {isExporting ? <span role="status"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /><span className="sr-only">Exportiere...</span></span> : <Download className="h-4 w-4" aria-hidden="true" />}
            {isExporting ? 'Exportiere...' : `${selectedDocs.size} exportieren`}
          </button>
        ) : null
      }
    >
      {/* ERP target selector */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">Zielformat</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(ERP_TARGETS) as [ErpTarget, { label: string; format: string }][]).map(([key, erp]) => (
            <button
              key={key}
              onClick={() => setSelectedErp(key)}
              aria-pressed={selectedErp === key}
              className={cn(
                'inline-flex min-h-[44px] items-center rounded-md border px-4 text-sm font-medium transition-colors',
                selectedErp === key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {erp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document selection */}
      {isLoading ? (
        <div className="space-y-3 p-4" role="status">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
          ))}
          <span className="sr-only">Laden...</span>
        </div>
      ) : !documents || documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-10 sm:py-16">
          <CheckCircle className="h-10 w-10 text-ink-muted" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">Keine verifizierten Dokumente</p>
          <p className="mt-1 text-sm text-ink-muted">
            Verifizieren Sie Dokumente unter &quot;Belege&quot;, um sie exportieren zu können.
          </p>
        </div>
      ) : (
        <div className="scroll-fade overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left">
                  <span className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedDocs.size === documents.length && documents.length > 0}
                      onChange={selectAll}
                      className="h-4 w-4 rounded border-border"
                      aria-label="Alle auswählen"
                    />
                  </span>
                </th>
                <th className="px-4 py-2.5 text-left text-table-header">DOKUMENT</th>
                <th className="px-4 py-2.5 text-left text-table-header">LIEFERANT</th>
                <th className="px-4 py-2.5 text-left text-table-header">MANDANT</th>
                <th className="px-4 py-2.5 text-right text-table-header">BETRAG</th>
                <th className="px-4 py-2.5 text-left text-table-header">DATUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  role="row"
                  tabIndex={0}
                  className={cn('cursor-pointer transition-colors hover:bg-muted', selectedDocs.has(doc.id) && 'bg-accent/5')}
                  onClick={() => toggleDoc(doc.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDoc(doc.id) } }}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => toggleDoc(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-border"
                        aria-label={`${doc.file_name} auswählen`}
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileDown className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      <span className="truncate text-sm font-medium text-foreground">{doc.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{doc.supplier_name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{doc.clients?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                    {doc.amount != null
                      ? `CHF ${Number(doc.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">
                    {doc.document_date
                      ? new Date(doc.document_date).toLocaleDateString('de-CH')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
    </>
  )
}
