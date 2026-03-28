import { Link } from 'react-router-dom'
import { FileText, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { useProfile } from '@/hooks/useProfile'
import { useDashboardStats, useRecentDocuments } from '@/hooks/useDashboardStats'
import { DOCUMENT_STATUSES } from '@/lib/constants'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

const STATUS_STYLES: Record<string, string> = {
  success: 'text-status-success',
  warning: 'text-status-warning',
  info: 'text-status-info',
  error: 'text-status-error',
}

const DOT_STYLES: Record<string, string> = {
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  info: 'bg-status-info',
  error: 'bg-status-error',
}

function formatCHF(amount: number): string {
  return amount.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { data: profile } = useProfile()
  const { data: stats } = useDashboardStats()
  const { data: recentDocs } = useRecentDocuments()

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  const metrics = [
    { label: 'BELEGE GESAMT', value: formatCHF(stats?.totalDocuments ?? 0), sub: 'Alle Dokumente', icon: FileText, trend: 'neutral' as const },
    { label: 'VERARBEITET', value: formatCHF(stats?.processedDocuments ?? 0), sub: stats?.totalDocuments ? `${((stats.processedDocuments / stats.totalDocuments) * 100).toFixed(1)}% Erfolgsrate` : '—', icon: TrendingUp, trend: 'up' as const },
    { label: 'ZUR PRÜFUNG', value: String(stats?.reviewDocuments ?? 0), sub: 'Warten auf Verifizierung', icon: AlertTriangle, trend: (stats?.reviewDocuments ?? 0) > 0 ? 'warn' as const : 'neutral' as const },
    { label: 'EXPORTIERT (CHF)', value: formatCHF(stats?.totalAmount ?? 0), sub: 'Laufender Monat', icon: Download, trend: 'neutral' as const },
  ]

  return (
    <>
    <PageMeta title="Dashboard" noindex />
    <AppLayout
      title="Dashboard"
      subtitle={`Willkommen bei BelegPilot${firstName ? `, ${firstName}` : ''}`}
      action={
        <Link
          to="/upload"
          className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
        >
          Beleg hochladen
        </Link>
      }
    >
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-table-header">{m.label}</p>
              <m.icon className="h-4 w-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{m.value}</p>
            <p className={cn(
              'mt-1 text-xs',
              m.trend === 'up' ? 'text-status-success' : m.trend === 'warn' ? 'text-status-warning' : 'text-ink-muted',
            )}>
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent documents */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Letzte Dokumente</h2>
          <Link to="/documents" className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary hover:text-accent-foreground">
            Alle anzeigen
          </Link>
        </div>
        {recentDocs && recentDocs.length > 0 ? (
          <div className="scroll-fade overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-table-header">DOKUMENT</th>
                <th className="px-4 py-2.5 text-left text-table-header">MANDANT</th>
                <th className="px-4 py-2.5 text-left text-table-header">STATUS</th>
                <th className="px-4 py-2.5 text-right text-table-header">BETRAG</th>
                <th className="px-4 py-2.5 text-right text-table-header">DATUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentDocs.map((doc) => {
                const statusInfo = DOCUMENT_STATUSES[doc.status as keyof typeof DOCUMENT_STATUSES]
                const colorKey = statusInfo?.color ?? 'info'
                return (
                  <tr key={doc.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3.5">
                      <Link to={`/documents/${doc.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                        <FileText className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                        {doc.file_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-secondary">{doc.clients?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-sm font-medium', STATUS_STYLES[colorKey])}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', DOT_STYLES[colorKey])} />
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
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-ink-muted">
            Noch keine Dokumente vorhanden. Laden Sie Ihren ersten Beleg hoch.
          </div>
        )}
      </div>
    </AppLayout>
    </>
  )
}
