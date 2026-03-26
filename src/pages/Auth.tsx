import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

type AuthMode = 'login' | 'signup' | 'verify' | 'profile' | 'forgot' | 'reset'

const VALID_MODES: AuthMode[] = ['login', 'signup', 'forgot', 'reset']

const PAGE_TITLES: Record<AuthMode, string> = {
  login: 'Anmelden',
  signup: 'Registrieren',
  verify: 'Code eingeben',
  profile: 'Profil vervollständigen',
  forgot: 'Passwort vergessen',
  reset: 'Neues Passwort',
}

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const urlMode = searchParams.get('mode') as AuthMode | null
  const [modeOverride, setModeOverride] = useState<AuthMode | null>(null)

  let mode: AuthMode = modeOverride ?? (urlMode && VALID_MODES.includes(urlMode) ? urlMode : 'login')
  if (mode === 'reset' && !authLoading && !user) {
    mode = 'forgot'
  }

  const setMode = (newMode: AuthMode) => setModeOverride(newMode)

  usePageTitle(PAGE_TITLES[mode])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resetDone, setResetDone] = useState(false)

  const resetMessages = () => { setError(null); setSuccess(null) }

  // ── Login (email + password) ──────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  // ── Signup step 1: send OTP ───────────────────────────────────────────────
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) {
      setError(friendlyError(error.message))
    } else {
      setSuccess('Bestätigungscode wurde an Ihre E-Mail gesendet.')
      setMode('verify')
    }
    setLoading(false)
  }

  // ── Signup step 2: verify OTP ─────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }

    // Check if user already has a profile (returning user)
    const isNewUser = !data.user?.user_metadata?.full_name
    if (isNewUser) {
      setMode('profile')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  // ── Signup step 3: complete profile ───────────────────────────────────────
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName, org_name: orgName },
    })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }

    // Persist org name + full name to database tables
    // (the trigger created defaults; now update with real values)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', currentUser.id)
        .single()
      if (profile) {
        await Promise.all([
          supabase.from('profiles').update({ full_name: fullName }).eq('id', currentUser.id),
          supabase.from('organizations').update({ name: orgName }).eq('id', profile.organization_id),
        ])
      }
    }

    // Send welcome email via edge function (best-effort)
    supabase.functions.invoke('send-welcome', { method: 'POST' }).catch(() => {})

    navigate('/dashboard')
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) {
      setError(friendlyError(error.message))
    } else {
      setSuccess('Link zum Zurücksetzen gesendet. Bitte prüfen Sie Ihren Posteingang.')
    }
    setLoading(false)
  }

  // ── Reset password ────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetMessages()

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(friendlyError(error.message))
    } else {
      setResetDone(true)
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

          {/* Signup — Step 1: Email */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSendOtp} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Konto erstellen</h1>
                <p className="mt-1 text-sm text-ink-secondary">14 Tage kostenlos — keine Kreditkarte nötig</p>
              </div>
              <div>
                <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-foreground">E-Mail</label>
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@treuhand.ch" required className={inputClass} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-status-success">{success}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Bestätigungscode senden'}
              </button>
              <p className="text-center text-sm text-ink-secondary">
                Bereits ein Konto?{' '}
                <button type="button" onClick={() => { setMode('login'); resetMessages() }} className="font-medium text-primary hover:underline">Anmelden</button>
              </p>
            </form>
          )}

          {/* Signup — Step 2: Verify OTP */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Code eingeben</h1>
                <p className="mt-1 text-sm text-ink-secondary">Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.</p>
              </div>
              <div>
                <label htmlFor="otp-code" className="mb-1 block text-sm font-medium text-foreground">Bestätigungscode</label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  autoFocus
                  className={`${inputClass} text-center text-lg tracking-[0.3em]`}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading || otpCode.length !== 6} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Bestätigen'}
              </button>
              <button type="button" onClick={() => { setMode('signup'); setOtpCode(''); resetMessages() }} className="flex w-full items-center justify-center text-sm font-medium text-primary hover:underline">
                ← Andere E-Mail verwenden
              </button>
            </form>
          )}

          {/* Signup — Step 3: Complete Profile */}
          {mode === 'profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profil vervollständigen</h1>
                <p className="mt-1 text-sm text-ink-secondary">Noch ein paar Angaben, dann geht's los.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="profile-org" className="mb-1 block text-sm font-medium text-foreground">Firmenname</label>
                  <input id="profile-org" type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Meier Treuhand AG" required maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-foreground">Vollständiger Name</label>
                  <input id="profile-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sandra Meier" required maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="profile-password" className="mb-1 block text-sm font-medium text-foreground">Passwort</label>
                  <input id="profile-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="profile-confirm" className="mb-1 block text-sm font-medium text-foreground">Passwort bestätigen</label>
                  <input id="profile-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" required minLength={8} autoComplete="new-password" className={inputClass} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Konto erstellen'}
              </button>
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

          {/* Reset Password */}
          {mode === 'reset' && !resetDone && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Neues Passwort wählen</h1>
                <p className="mt-1 text-sm text-ink-secondary">Geben Sie Ihr neues Passwort ein.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="reset-password" className="mb-1 block text-sm font-medium text-foreground">Neues Passwort</label>
                  <input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" required minLength={8} autoComplete="new-password" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium text-foreground">Passwort bestätigen</label>
                  <input id="reset-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" required minLength={8} autoComplete="new-password" className={inputClass} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Passwort zurücksetzen'}
              </button>
            </form>
          )}

          {/* Reset Password — Success */}
          {mode === 'reset' && resetDone && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success/10">
                <CheckCircle className="h-7 w-7 text-status-success" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-foreground">Passwort aktualisiert</h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </p>
              <button
                onClick={() => { setMode('login'); setResetDone(false); resetMessages(); setPassword(''); setConfirmPassword('') }}
                className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
              >
                Zur Anmeldung
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Map common Supabase auth error messages to German user-friendly messages */
function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.'
  if (msg.includes('Email not confirmed')) return 'E-Mail noch nicht bestätigt. Bitte prüfen Sie Ihren Posteingang.'
  if (msg.includes('User already registered')) return 'Ein Konto mit dieser E-Mail existiert bereits.'
  if (msg.includes('Password should be at least')) return 'Passwort muss mindestens 8 Zeichen lang sein.'
  if (msg.includes('rate limit')) return 'Zu viele Versuche. Bitte warten Sie einen Moment.'
  if (msg.includes('same_password')) return 'Das neue Passwort muss sich vom aktuellen unterscheiden.'
  if (msg.includes('Token has expired')) return 'Der Code ist abgelaufen. Bitte fordern Sie einen neuen an.'
  if (msg.includes('invalid')) return 'Ungültiger Code. Bitte überprüfen Sie Ihre Eingabe.'
  return msg
}
