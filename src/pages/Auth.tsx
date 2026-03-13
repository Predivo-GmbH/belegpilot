import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'

type AuthMode = 'login' | 'signup' | 'forgot'

export default function Auth() {
  usePageTitle('Anmelden')
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetMessages = () => { setError(null); setSuccess(null) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, org_name: orgName },
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Bestätigungs-E-Mail gesendet. Bitte prüfen Sie Ihren Posteingang.')
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Link zum Zurücksetzen gesendet. Bitte prüfen Sie Ihren Posteingang.')
    }
    setLoading(false)
  }

  const inputClass = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-ink-muted focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-1/2 flex-col justify-center bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M10 37c-2 0-3-1-3-4-0.5-8-0.5-18 0-26 0-3 2-4 4-4l8 0c6 0 10 4 10 9 0 4-3 7-7 7.5 5 0.5 9 4.5 9 9 0 5.5-5 8.5-11 8.5z m3-29c0 0 4-0.5 6 0 3 1 4.5 2.5 4.5 4.5 0 2-1.5 4-5 4.5l-5.5 0z m0 14c0 0 5-0.5 7 0 3 1 5 3 5 5.5 0 2.5-2 4.5-5.5 4.5l-6.5 0z"
                fill="#0E7C6B"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">BelegPilot</span>
        </div>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
          Belege verarbeiten.<br />
          Automatisch. Präzise. Swiss.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Willkommen zurück</h1>
                <p className="mt-1 text-sm text-ink-secondary">Melden Sie sich in Ihrem Konto an</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
                  <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@treuhand.ch" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-foreground">Passwort</label>
                  <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
                </div>
              </div>
              <button type="button" onClick={() => { setMode('forgot'); resetMessages() }} className="text-sm font-medium text-primary hover:underline">
                Passwort vergessen?
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Anmelden'}
              </button>
              <p className="text-center text-sm text-ink-secondary">
                Noch kein Konto?{' '}
                <button type="button" onClick={() => { setMode('signup'); resetMessages() }} className="font-medium text-primary hover:underline">Jetzt registrieren</button>
              </p>
            </form>
          )}

          {/* Signup */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Konto erstellen</h1>
                <p className="mt-1 text-sm text-ink-secondary">30 Tage kostenlos — keine Kreditkarte nötig</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="signup-org" className="mb-1 block text-sm font-medium text-foreground">Firmenname</label>
                  <input id="signup-org" type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Meier Treuhand AG" required maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-foreground">Vollständiger Name</label>
                  <input id="signup-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sandra Meier" required maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
                  <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@treuhand.ch" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-foreground">Passwort</label>
                  <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-status-success">{success}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Konto erstellen'}
              </button>
              <p className="text-center text-sm text-ink-secondary">
                Bereits ein Konto?{' '}
                <button type="button" onClick={() => { setMode('login'); resetMessages() }} className="font-medium text-primary hover:underline">Anmelden</button>
              </p>
            </form>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Passwort vergessen?</h1>
                <p className="mt-1 text-sm text-ink-secondary">Geben Sie Ihre E-Mail ein. Wir senden Ihnen einen Link zum Zurücksetzen.</p>
              </div>
              <div>
                <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
                <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@treuhand.ch" required className={inputClass} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-status-success">{success}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link senden'}
              </button>
              <button type="button" onClick={() => { setMode('login'); resetMessages() }} className="flex w-full items-center justify-center text-sm font-medium text-primary hover:underline">
                ← Zurück zur Anmeldung
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
