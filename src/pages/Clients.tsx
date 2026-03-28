import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { ERP_TARGETS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'
import { toast } from 'sonner'

type ClientRow = Database['public']['Tables']['clients']['Row']
type ErpTarget = ClientRow['erp_target']

const inputClass = 'min-h-[44px] w-full rounded-md border border-input bg-card px-3 text-base md:text-sm text-foreground placeholder:text-ink-muted focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

function ClientForm({ client, orgId, onClose }: { client?: ClientRow; orgId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!client

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = {
        name: formData.get('name') as string,
        contact_email: (formData.get('contact_email') as string) || null,
        address: (formData.get('address') as string) || null,
        erp_target: (formData.get('erp_target') as ErpTarget) || 'csv',
        organization_id: orgId,
      }

      if (isEdit) {
        const { error } = await supabase.from('clients').update(payload).eq('id', client.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clients').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(isEdit ? 'Mandant aktualisiert' : 'Mandant erstellt')
      onClose()
    },
    onError: () => toast.error('Fehler beim Speichern'),
  })

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        {isEdit ? 'Mandant bearbeiten' : 'Neuer Mandant'}
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate(new FormData(e.currentTarget))
        }}
      >
        <div>
          <label htmlFor="client-name" className="mb-1 block text-sm font-medium text-foreground">Name *</label>
          <input id="client-name" name="name" type="text" required defaultValue={client?.name ?? ''} className={inputClass} placeholder="Firma Muster AG" />
        </div>
        <div>
          <label htmlFor="client-email" className="mb-1 block text-sm font-medium text-foreground">Kontakt-E-Mail</label>
          <input id="client-email" name="contact_email" type="email" defaultValue={client?.contact_email ?? ''} className={inputClass} placeholder="kontakt@firma.ch" />
        </div>
        <div>
          <label htmlFor="client-address" className="mb-1 block text-sm font-medium text-foreground">Adresse</label>
          <input id="client-address" name="address" type="text" defaultValue={client?.address ?? ''} className={inputClass} placeholder="Bahnhofstrasse 42, 8001 Zürich" />
        </div>
        <div>
          <label htmlFor="client-erp" className="mb-1 block text-sm font-medium text-foreground">Standard-Exportformat</label>
          <select id="client-erp" name="erp_target" defaultValue={client?.erp_target ?? 'csv'} className={inputClass}>
            {Object.entries(ERP_TARGETS).map(([key, erp]) => (
              <option key={key} value={key}>{erp.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            {mutation.isPending ? 'Speichern...' : isEdit ? 'Aktualisieren' : 'Erstellen'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Clients() {
  usePageTitle('Mandanten')
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRow | undefined>()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // Close action menu on Escape
  const handleEscapeMenu = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpenMenu(null)
  }, [])

  useEffect(() => {
    if (openMenu) {
      document.addEventListener('keydown', handleEscapeMenu)
      return () => document.removeEventListener('keydown', handleEscapeMenu)
    }
  }, [openMenu, handleEscapeMenu])

  const orgId = profile?.organization_id

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', orgId, search],
    enabled: !!orgId,
    queryFn: async () => {
      if (!orgId) throw new Error('No org ID')
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', orgId)
        .order('name')

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as ClientRow[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Mandant gelöscht')
    },
    onError: () => toast.error('Fehler beim Löschen'),
  })

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name })
    setOpenMenu(null)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
    <PageMeta title="Mandanten" noindex />
    <AppLayout
      title="Mandanten"
      subtitle="Verwalten Sie Ihre Mandanten und deren Einstellungen."
      action={
        <button
          onClick={() => { setEditingClient(undefined); setShowForm(true) }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Neuer Mandant
        </button>
      }
    >
      {showForm && (
        <div className="mb-6">
          <ClientForm
            client={editingClient}
            orgId={orgId ?? ''}
            onClose={() => { setShowForm(false); setEditingClient(undefined) }}
          />
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Mandant suchen..."
            aria-label="Mandant suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, 'pl-9')}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3 p-4" role="status">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
          ))}
          <span className="sr-only">Laden...</span>
        </div>
      ) : !clients || clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-10 sm:py-16">
          <p className="text-sm font-medium text-foreground">Keine Mandanten</p>
          <p className="mt-1 text-sm text-ink-muted">
            {search ? 'Keine Treffer für Ihre Suche.' : 'Erstellen Sie Ihren ersten Mandanten.'}
          </p>
        </div>
      ) : (
        <div className="scroll-fade overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-table-header">NAME</th>
                <th className="px-4 py-2.5 text-left text-table-header">E-MAIL</th>
                <th className="px-4 py-2.5 text-left text-table-header">ERP</th>
                <th className="px-4 py-2.5 text-left text-table-header">STATUS</th>
                <th className="px-4 py-2.5 text-right text-table-header" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    {client.address && <p className="text-xs text-ink-muted">{client.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{client.contact_email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">
                    {ERP_TARGETS[client.erp_target as keyof typeof ERP_TARGETS]?.label ?? client.erp_target}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      client.status === 'active'
                        ? 'bg-status-success-light text-status-success'
                        : 'bg-muted text-ink-secondary',
                    )}>
                      {client.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-ink-muted hover:bg-muted hover:text-foreground"
                        aria-label="Aktionen"
                        aria-expanded={openMenu === client.id}
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {openMenu === client.id && (
                        <div role="menu" className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-border bg-card py-1">
                          <button
                            role="menuitem"
                            onClick={() => {
                              setEditingClient(client)
                              setShowForm(true)
                              setOpenMenu(null)
                            }}
                            className="flex min-h-[44px] w-full items-center gap-2 px-3 text-sm text-foreground hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Bearbeiten
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => handleDeleteRequest(client.id, client.name)}
                            className="flex min-h-[44px] w-full items-center gap-2 px-3 text-sm text-destructive hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Löschen
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
    <ConfirmDialog
      open={deleteTarget !== null}
      title="Mandant löschen"
      description={`Mandant "${deleteTarget?.name ?? ''}" wirklich löschen? Bestehende Dokumente bleiben erhalten.`}
      confirmLabel="Löschen"
      cancelLabel="Abbrechen"
      variant="destructive"
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteTarget(null)}
    />
    </>
  )
}
