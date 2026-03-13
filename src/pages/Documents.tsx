import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Filter } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { DOCUMENT_STATUSES } from '@/lib/constants'
import { useDocuments } from '@/hooks/useDocuments'
import { usePageTitle } from '@/hooks/usePageTitle'

type StatusFilter = 'all' | keyof typeof DOCUMENT_STATUSES

const STATUS_BADGE_STYLES: Record<string, string> = {
  success: 'bg-status-success-light text-status-success',
  warning: 'bg-status-warning-light text-status-warning',
  info: 'bg-status-info-light text-status-info',
  error: 'bg-status-error-light text-status-error',
}

export default function Documents() {
  usePageTitle('Dokumente')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const { data: documents, isLoading } = useDocuments({ status: filter, search })

  return (
    <AppLayout
      title="Dokumente"
      subtitle={`${documents?.length ?? 0} Dokumente in allen Mandanten`}
      action={
        <Link
          to="/upload"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
        >
          Upload
        </Link>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            aria-label="Dokumente durchsuchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-ink-muted focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-ink-muted" />
          {(['all', 'review', 'verified', 'exported'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-current={filter === f ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-ink-secondary hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {f === 'all' ? 'Alle' : DOCUMENT_STATUSES[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-table-header">DOKUMENT</th>
                  <th className="px-4 py-3 text-left text-table-header">MANDANT</th>
                  <th className="px-4 py-3 text-left text-table-header">STATUS</th>
                  <th className="px-4 py-3 text-right text-table-header">BETRAG</th>
                  <th className="px-4 py-3 text-right text-table-header">DATUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(documents ?? []).map((doc) => {
                  const statusInfo = DOCUMENT_STATUSES[doc.status as keyof typeof DOCUMENT_STATUSES]
                  return (
                    <tr key={doc.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Link to={`/documents/${doc.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                          <FileText className="h-4 w-4 shrink-0 text-ink-muted" />
                          {doc.file_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-secondary">{doc.clients?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_BADGE_STYLES[statusInfo?.color ?? 'info'])}>
                          {statusInfo?.label ?? doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        {doc.amount ? `CHF ${Number(doc.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-ink-muted">
                        {doc.document_date ? new Date(doc.document_date).toLocaleDateString('de-CH') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!documents || documents.length === 0) && (
              <div className="p-8 text-center text-sm text-ink-muted">
                Keine Dokumente gefunden.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
