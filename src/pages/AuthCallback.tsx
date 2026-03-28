import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageMeta } from '@/components/shared/PageMeta'

/**
 * Handles Supabase auth callbacks (magic links, password resets, email confirmations).
 * Tokens arrive as URL hash fragments: #access_token=...&type=recovery|signup|...
 */
export default function AuthCallback() {
  usePageTitle('Wird verarbeitet...')
  const navigate = useNavigate()
  const [status, setStatus] = useState('Wird verarbeitet...')

  useEffect(() => {
    // Parse the hash fragment for the callback type
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const type = params.get('type')

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (type === 'recovery') {
        navigate('/auth?mode=reset')
      } else if (session) {
        navigate('/dashboard')
      } else {
        setStatus('Authentifizierungsfehler. Weiterleitung...')
        navigate('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <>
    <PageMeta title="Authentifizierung" noindex />
    <div className="flex h-screen items-center justify-center bg-background" role="status">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-ink-secondary" aria-live="polite">{status}</p>
        <span className="sr-only">Laden...</span>
      </div>
    </div>
    </>
  )
}
