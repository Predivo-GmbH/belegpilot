import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * Handles Supabase auth callbacks (magic links, password resets, email confirmations).
 * Tokens arrive as URL hash fragments: #access_token=...&type=recovery|signup|...
 */
export default function AuthCallback() {
  usePageTitle('Wird verarbeitet...')
  const navigate = useNavigate()
  const [status, setStatus] = useState('Wird verarbeitet...')

  useEffect(() => {
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCallback() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      setStatus('Authentifizierungsfehler. Weiterleitung...')
      navigate('/auth')
      return
    }

    // Parse the hash fragment for the callback type
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const type = params.get('type')

    if (type === 'recovery') {
      // Password reset — redirect to reset form
      navigate('/auth?mode=reset')
    } else if (type === 'signup' || type === 'email') {
      // Email confirmation — user is now verified
      if (session) {
        navigate('/dashboard')
      } else {
        navigate('/auth')
      }
    } else if (session) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-ink-secondary">{status}</p>
      </div>
    </div>
  )
}
