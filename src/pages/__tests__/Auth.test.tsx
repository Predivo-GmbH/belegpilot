import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Auth from '../Auth'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    session: null,
    loading: false,
    signOut: vi.fn(),
  })),
}))

function renderAuth(search = '') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/auth${search}`]}>
        <Auth />
      </MemoryRouter>
    </HelmetProvider>,
  )
}

describe('Auth — Login mode', () => {
  it('renders login form by default', () => {
    renderAuth()
    expect(screen.getByText('Willkommen zurück')).toBeInTheDocument()
  })

  it('has email and password fields', () => {
    renderAuth()
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument()
  })

  it('has login button', () => {
    renderAuth()
    expect(screen.getByRole('button', { name: 'Anmelden' })).toBeInTheDocument()
  })

  it('has link to signup', () => {
    renderAuth()
    expect(screen.getByText('Jetzt registrieren')).toBeInTheDocument()
  })

  it('has forgot password link', () => {
    renderAuth()
    expect(screen.getByText('Passwort vergessen?')).toBeInTheDocument()
  })
})

describe('Auth — Signup mode', () => {
  it('renders signup form', () => {
    renderAuth('?mode=signup')
    expect(screen.getByText('Konto erstellen')).toBeInTheDocument()
  })

  it('shows email field for OTP', () => {
    renderAuth('?mode=signup')
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument()
  })

  it('has send OTP button', () => {
    renderAuth('?mode=signup')
    expect(screen.getByRole('button', { name: 'Bestätigungscode senden' })).toBeInTheDocument()
  })

  it('shows free trial text', () => {
    renderAuth('?mode=signup')
    expect(screen.getByText(/keine Kreditkarte nötig/i)).toBeInTheDocument()
  })
})

describe('Auth — Forgot mode', () => {
  it('renders forgot password form', () => {
    renderAuth('?mode=forgot')
    expect(screen.getByText('Passwort vergessen?')).toBeInTheDocument()
  })

  it('has send link button', () => {
    renderAuth('?mode=forgot')
    expect(screen.getByRole('button', { name: 'Link senden' })).toBeInTheDocument()
  })

  it('has back to login link', () => {
    renderAuth('?mode=forgot')
    expect(screen.getByText(/Zurück zur Anmeldung/)).toBeInTheDocument()
  })
})
