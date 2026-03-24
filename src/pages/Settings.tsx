import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { SUBSCRIPTION_TIERS, ERP_TARGETS } from '@/lib/constants'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'
import { toast } from 'sonner'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

type SettingsTab = 'firm' | 'team' | 'erp' | 'billing' | 'security'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'firm', label: 'Firmenprofil' },
  { id: 'team', label: 'Team' },
  { id: 'erp', label: 'ERP-Verbindungen' },
  { id: 'billing', label: 'Abrechnung' },
  { id: 'security', label: 'Sicherheit' },
]

const inputClass = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-ink-muted focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

export default function Settings() {
  usePageTitle('Einstellungen')
  const [tab, setTab] = useState<SettingsTab>('firm')
  const { data: profile } = useProfile()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const org = profile?.organizations as { id: string; name: string; plan: string; documents_this_month: number } | null

  // Team members query
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', org?.id],
    enabled: !!org?.id && tab === 'team',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', org!.id)
      if (error) throw error
      return data as unknown as ProfileRow[]
    },
  })

  // Update org name mutation
  const updateOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', org!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Firmenprofil gespeichert')
    },
    onError: () => toast.error('Fehler beim Speichern'),
  })

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwörter stimmen nicht überein.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Passwort erfolgreich geändert')
    }
  }

  const currentPlan = (org?.plan ?? 'starter') as keyof typeof SUBSCRIPTION_TIERS
  const tier = SUBSCRIPTION_TIERS[currentPlan]

  return (
    <AppLayout title="Einstellungen" subtitle="Verwalten Sie Ihre Firmen- und Kontoeinstellungen.">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-secondary hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Firm Profile */}
      {tab === 'firm' && (
        <form
          className="max-w-xl space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const name = formData.get('firm-name') as string
            if (name && name !== org?.name) updateOrgMutation.mutate(name)
          }}
        >
          <h2 className="text-lg font-semibold text-foreground">Firmenprofil</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="firm-name" className="mb-1 block text-sm font-medium text-foreground">Firmenname</label>
              <input id="firm-name" name="firm-name" type="text" defaultValue={org?.name ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor="firm-street" className="mb-1 block text-sm font-medium text-foreground">Strasse und Hausnummer</label>
              <input id="firm-street" type="text" placeholder="Bahnhofstrasse 42" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firm-plz" className="mb-1 block text-sm font-medium text-foreground">PLZ</label>
                <input id="firm-plz" type="text" placeholder="8001" className={inputClass} />
              </div>
              <div>
                <label htmlFor="firm-city" className="mb-1 block text-sm font-medium text-foreground">Ort</label>
                <input id="firm-city" type="text" placeholder="Zürich" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="firm-phone" className="mb-1 block text-sm font-medium text-foreground">Telefon</label>
              <input id="firm-phone" type="tel" placeholder="+41 44 123 45 67" className={inputClass} />
            </div>
            <div>
              <label htmlFor="firm-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
              <input id="firm-email" type="email" defaultValue={user?.email ?? ''} className={inputClass} />
            </div>
          </div>
          <button
            type="submit"
            disabled={updateOrgMutation.isPending}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            {updateOrgMutation.isPending ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
          {updateOrgMutation.isSuccess && <p className="text-sm text-status-success">Gespeichert.</p>}
        </form>
      )}

      {/* Team */}
      {tab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Teammitglieder</h2>
            <button className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
              Einladen
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-table-header">NAME</th>
                  <th className="px-4 py-2.5 text-left text-table-header">ROLLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(teamMembers ?? []).map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{member.full_name}</p>
                      <p className="text-xs text-ink-muted">{member.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        member.role === 'owner' ? 'bg-accent text-accent-foreground' : 'bg-muted text-ink-secondary',
                      )}>
                        {member.role === 'owner' ? 'Admin' : member.role === 'member' ? 'Buchhalter' : 'Viewer'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!teamMembers || teamMembers.length === 0) && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-sm text-ink-muted">
                      Keine Teammitglieder gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ERP Connections */}
      {tab === 'erp' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">ERP-Verbindungen</h2>
          <p className="text-sm text-ink-secondary">Konfigurieren Sie die Exportformate für jeden Mandanten. BelegPilot unterstützt alle gängigen Schweizer ERP-Systeme.</p>
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-table-header">ERP-SYSTEM</th>
                  <th className="px-4 py-2.5 text-left text-table-header">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.values(ERP_TARGETS).map((erp) => (
                  <tr key={erp.label}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{erp.label}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-status-success-light px-2 py-0.5 text-xs font-medium text-status-success">
                        Aktiv
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Aktueller Plan</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-muted">Plan</p>
                <p className="text-lg font-semibold text-foreground">{tier.name} — CHF {tier.price}/Monat</p>
                <p className="mt-1 text-sm text-ink-secondary">Monatslimit: {tier.documentsPerMonth.toLocaleString()} Dokumente</p>
              </div>
              <button className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted">
                Plan ändern
              </button>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-foreground">Nutzung diesen Monat</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-secondary">Dokumente verarbeitet</span>
              <span className="font-mono font-medium text-foreground">{org?.documents_this_month ?? 0} / {tier.documentsPerMonth.toLocaleString()}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, ((org?.documents_this_month ?? 0) / tier.documentsPerMonth) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="max-w-xl space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Passwort ändern</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">Neues Passwort</label>
              <input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-foreground">Passwort bestätigen</label>
              <input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" className={inputClass} />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-status-success">Passwort erfolgreich geändert.</p>}
            <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
              Passwort ändern
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Zwei-Faktor-Authentifizierung</h2>
                <p className="text-sm text-ink-secondary">Erhöhen Sie die Sicherheit Ihres Kontos mit einem zweiten Authentifizierungsfaktor.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-ink-secondary">Inaktiv</span>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-destructive">Konto löschen</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Alle Ihre Daten, Dokumente und Teammitglieder werden unwiderruflich gelöscht.
            </p>
            <button
              onClick={async () => {
                if (!confirm('Sind Sie sicher? Alle Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.')) return
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session?.access_token) throw new Error('Keine aktive Sitzung')
                  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session.access_token}`,
                    },
                  })
                  if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    throw new Error(body.error ?? 'Fehler beim Löschen')
                  }
                  await supabase.auth.signOut()
                  window.location.href = '/'
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Konto konnte nicht gelöscht werden')
                }
              }}
              className="mt-3 inline-flex h-9 items-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Konto endgültig löschen
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
