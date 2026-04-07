import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Download, FileText, Loader2 } from 'lucide-react'
import { PdfViewer } from '@/components/shared/PdfViewer'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { useDocument } from '@/hooks/useDocuments'
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'
import { toast } from 'sonner'

function ConfidenceDot({ confidence }: { confidence: number }) {
  const color = confidence >= 0.9
    ? 'bg-status-success'
    : confidence >= 0.7
      ? 'bg-status-warning'
      : 'bg-status-error'
  const label = confidence >= 0.9 ? 'Hohe Konfidenz' : confidence >= 0.7 ? 'Mittlere Konfidenz' : 'Niedrige Konfidenz'
  return <span className={cn('inline-block h-2 w-2 rounded-full', color)} role="img" aria-label={`${label}: ${Math.round(confidence * 100)}%`} />
}

function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    qr: 'bg-accent text-accent-foreground',
    ai: 'bg-muted text-ink-secondary',
    zugferd: 'bg-status-info-light text-status-info',
    manual: 'bg-status-warning-light text-status-warning',
  }
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium uppercase', styles[source] || styles.ai)}>
      {source}
    </span>
  )
}

interface ExtractionField {
  label: string
  value: string
  confidence: number
  source: string
  mono?: boolean
}

function buildFields(doc: Record<string, unknown>): ExtractionField[] {
  const fields: ExtractionField[] = []
  const scores = (doc.confidence_scores as Record<string, number>) ?? {}
  const qrData = doc.qr_data as Record<string, unknown> | null

  const add = (label: string, key: string, opts?: { mono?: boolean }) => {
    const val = doc[key]
    if (val != null && val !== '') {
      fields.push({
        label,
        value: String(val),
        confidence: scores[key] ?? 0.85,
        source: qrData?.[key] ? 'qr' : 'ai',
        mono: opts?.mono,
      })
    }
  }

  add('LIEFERANT', 'supplier_name')
  add('DATUM', 'document_date')
  if (doc.amount) {
    fields.push({
      label: 'GESAMTBETRAG',
      value: `${doc.currency ?? 'CHF'} ${Number(doc.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}`,
      confidence: scores['amount'] ?? 0.95,
      source: qrData?.['amount'] ? 'qr' : 'ai',
      mono: true,
    })
  }
  add('MWST-SATZ', 'vat_rate')
  add('IBAN', 'supplier_iban', { mono: true })
  add('MWST-NR.', 'supplier_vat_number')
  add('KONTO', 'account_number')
  add('GEGENKONTO', 'contra_account')

  return fields
}

function useDocumentPreview(filePath: string | undefined) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(!!filePath)

  useEffect(() => {
    if (!filePath) return
    let cancelled = false
    supabase.storage
      .from('documents')
      .download(filePath)
      .then(({ data }) => {
        if (!cancelled && data) {
          const blobUrl = URL.createObjectURL(data)
          setPreviewUrl(blobUrl)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false)
      })
    return () => {
      cancelled = true
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [filePath])

  return { previewUrl, isLoadingPreview }
}

export default function DocumentReview() {
  const { id } = useParams()
  usePageTitle('Dokument')
  const { data: doc, isLoading } = useDocument(id)
  const queryClient = useQueryClient()
  const { previewUrl, isLoadingPreview } = useDocumentPreview(doc?.file_path)

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No document ID')
      const { error } = await supabase
        .from('documents')
        .update({ status: 'verified' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] })
      toast.success('Dokument verifiziert')
    },
    onError: () => toast.error('Fehler beim Verifizieren'),
  })

  const handleDownload = async () => {
    if (!doc?.file_path) return
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      toast.error('Download konnte nicht erstellt werden')
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Dokument laden..." subtitle="">
        <div className="flex items-center justify-center p-12" role="status">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="sr-only">Laden...</span>
        </div>
      </AppLayout>
    )
  }

  if (!doc) {
    return (
      <AppLayout title="Dokument nicht gefunden" subtitle="">
        <div className="p-8 text-center text-sm text-ink-muted">
          Dieses Dokument existiert nicht oder Sie haben keinen Zugriff.
        </div>
      </AppLayout>
    )
  }

  const fields = buildFields(doc as unknown as Record<string, unknown>)
  const clientName = doc.clients?.name
  const isPdf = doc.file_type === 'application/pdf'
  const isImage = doc.file_type?.startsWith('image/')

  return (
    <>
    <PageMeta title="Dokumentprüfung" noindex />
    <AppLayout
      title={doc.file_name}
      subtitle={`${clientName ?? '—'} • ${doc.status === 'verified' ? 'Verifiziert' : 'Zur Prüfung'}`}
      action={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/documents"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
          <button
            aria-label="Dokument herunterladen"
            onClick={handleDownload}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Speichern</span>
          </button>
          {doc.status !== 'verified' && (
            <button
              aria-label="Als verifiziert markieren"
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              {verifyMutation.isPending ? 'Wird verifiziert...' : 'Verifiziert'}
            </button>
          )}
        </div>
      }
    >
      {/* Split pane — PDF gets 2/3, data gets 1/3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left: Original document preview */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Original</h2>
          </div>
          <div className="h-[60vh] bg-muted lg:h-[calc(100vh-13rem)]">
            {isLoadingPreview ? (
              <div className="flex h-full items-center justify-center" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="sr-only">Laden...</span>
              </div>
            ) : previewUrl && isPdf ? (
              <PdfViewer
                url={previewUrl}
                className="flex h-full flex-col"
              />
            ) : previewUrl && isImage ? (
              <img
                src={previewUrl}
                alt={doc.file_name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <FileText className="mx-auto h-12 w-12 text-ink-muted" aria-hidden="true" />
                  <p className="mt-2 text-sm text-ink-muted">
                    Vorschau nicht verfügbar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Extracted data */}
        <div className="rounded-lg border border-border bg-card self-start lg:sticky lg:top-4">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Extrahierte Daten</h2>
          </div>
          <div className="divide-y divide-border">
            {fields.length > 0 ? (
              fields.map((field) => (
                <div key={field.label} className="flex items-start justify-between px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-table-header">{field.label}</p>
                    <p className={cn(
                      'mt-0.5 text-sm text-foreground',
                      field.mono && 'font-mono',
                    )}>
                      {field.value}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <SourceBadge source={field.source} />
                    <ConfidenceDot confidence={field.confidence} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-ink-muted">
                Noch keine extrahierten Daten vorhanden.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
    </>
  )
}
