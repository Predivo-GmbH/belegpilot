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
import { PageMeta } from '@/components/shared/PageMeta'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

type SettingsTab = 'firm' | 'team' | 'erp' | 'billing' | 'security'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'firm', label: 'Firmenprofil' },
  { id: 'team', label: 'Team' },
  { id: 'erp', label: 'ERP-Exportformate' },
  { id: 'billing', label: 'Abrechnung' },
  { id: 'security', label: 'Sicherheit' },
]

const inputClass = 'min-h-[44px] w-full rounded-md border border-input bg-card px-3 text-base md:text-sm text-foreground placeholder:text-ink-muted focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

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
      if (!org) throw new Error('No org')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', org.id)
      if (error) throw error
      return data as unknown as ProfileRow[]
    },
  })

  // Update org name mutation
  const updateOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!org) throw new Error('No org')
      const { error } = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', org.id)
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

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false)
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
  }

  // Plan change via Stripe
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const handleChangePlan = async () => {
    setIsChangingPlan(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Keine aktive Sitzung')

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: currentPlan === 'starter' ? 'professional' : 'enterprise' }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Fehler beim Erstellen der Checkout-Sitzung')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Plan konnte nicht geändert werden')
    } finally {
      setIsChangingPlan(false)
    }
  }

  const currentPlan = (org?.plan ?? 'starter') as keyof typeof SUBSCRIPTION_TIERS
  const tier = SUBSCRIPTION_TIERS[currentPlan]

  return (
    <>
    <PageMeta title="Einstellungen" noindex />
    <AppLayout title="Einstellungen" subtitle="Verwalten Sie Ihre Firmen- und Kontoeinstellungen.">
      {/* Tabs */}
      <div role="tablist" className="scroll-fade scroll-fade-bg mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-1 overflow-x-auto border-b border-border scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              'min-h-[44px] shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors snap-start',
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
          id="panel-firm"
          role="tabpanel"
          aria-labelledby="tab-firm"
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
              <label htmlFor="firm-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
              <input id="firm-email" type="email" defaultValue={user?.email ?? ''} disabled className={cn(inputClass, 'opacity-60')} />
              <p className="mt-1 text-xs text-ink-muted">Wird über Ihr Konto verwaltet.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={updateOrgMutation.isPending}
            className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            {updateOrgMutation.isPending ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
          {updateOrgMutation.isSuccess && <p className="text-sm text-status-success">Gespeichert.</p>}
        </form>
      )}

      {/* Team */}
      {tab === 'team' && (
        <div id="panel-team" role="tabpanel" aria-labelledby="tab-team" className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Teammitglieder</h2>
          <div className="scroll-fade overflow-x-auto rounded-lg border border-border bg-card">
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

      {/* ERP Export Formats */}
      {tab === 'erp' && (
        <div id="panel-erp" role="tabpanel" aria-labelledby="tab-erp" className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">ERP-Exportformate</h2>
          <p className="text-sm text-ink-secondary">BelegPilot unterstützt alle gängigen Schweizer ERP-Systeme. Wählen Sie beim Export einfach das gewünschte Format aus.</p>
          <div className="scroll-fade overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-table-header">ERP-SYSTEM</th>
                  <th className="px-4 py-2.5 text-left text-table-header">FORMAT</th>
                  <th className="px-4 py-2.5 text-left text-table-header">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(ERP_TARGETS).map(([key, erp]) => (
                  <tr key={key}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{erp.label}</td>
                    <td className="px-4 py-3 text-sm uppercase text-ink-secondary">{erp.format}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-status-success-light px-2 py-0.5 text-xs font-medium text-status-success">
                        Verfügbar
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
        <div id="panel-billing" role="tabpanel" aria-labelledby="tab-billing" className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Aktueller Plan</h2>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-ink-muted">Plan</p>
                <p className="text-lg font-semibold text-foreground">{tier.name} — CHF {tier.price}/Monat</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  Monatslimit: {tier.documentsPerMonth === Infinity ? 'Unbegrenzt' : tier.documentsPerMonth.toLocaleString()} Dokumente
                </p>
              </div>
              {currentPlan !== 'enterprise' && (
                <button
                  onClick={handleChangePlan}
                  disabled={isChangingPlan}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                >
                  {isChangingPlan && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  {isChangingPlan ? <><span role="status" className="sr-only">Laden...</span>Laden...</> : 'Upgrade'}
                </button>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-foreground">Nutzung diesen Monat</h2>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-secondary">Dokumente verarbeitet</span>
              <span className="font-mono font-medium text-foreground">
                {org?.documents_this_month ?? 0} / {tier.documentsPerMonth === Infinity ? '∞' : tier.documentsPerMonth.toLocaleString()}
              </span>
            </div>
            {tier.documentsPerMonth !== Infinity && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, ((org?.documents_this_month ?? 0) / tier.documentsPerMonth) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div id="panel-security" role="tabpanel" aria-labelledby="tab-security" className="max-w-xl space-y-6">
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
            {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && <p role="status" className="text-sm text-status-success">Passwort erfolgreich geändert.</p>}
            <button type="submit" className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
              Passwort ändern
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-destructive">Konto löschen</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Alle Ihre Daten, Dokumente und Teammitglieder werden unwiderruflich gelöscht.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-3 inline-flex min-h-[44px] items-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Konto endgültig löschen
            </button>
          </div>
        </div>
      )}
    </AppLayout>
    <ConfirmDialog
      open={showDeleteConfirm}
      title="Konto löschen"
      description="Sind Sie sicher? Alle Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
      confirmLabel="Endgültig löschen"
      cancelLabel="Abbrechen"
      variant="destructive"
      onConfirm={handleDeleteAccount}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  )
}
