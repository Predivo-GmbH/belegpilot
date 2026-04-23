import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Settings from '../Settings'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', email: 'test@treuhand.ch' },
    session: {},
    loading: false,
    signOut: vi.fn(),
  })),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(() => ({
    data: {
      id: 'user-1',
      organization_id: 'org-1',
      full_name: 'Sandra Meier',
      organizations: {
        id: 'org-1',
        name: 'Meier Treuhand AG',
        plan: 'professional',
        documents_this_month: 45,
      },
    },
  })),
}))

// Mock HTMLDialogElement
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

function renderSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Settings', () => {
  it('renders Einstellungen heading', () => {
    renderSettings()
    expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument()
  })

  it('shows all 5 tabs', () => {
    renderSettings()
    expect(screen.getByRole('tab', { name: 'Firmenprofil' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Team' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'ERP-Exportformate' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Abrechnung' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sicherheit' })).toBeInTheDocument()
  })

  it('shows firm profile tab by default', () => {
    renderSettings()
    // 'Firmenprofil' appears as both tab label and section heading
    expect(screen.getByRole('tab', { name: 'Firmenprofil' })).toBeInTheDocument()
    expect(screen.getByLabelText('Firmenname')).toBeInTheDocument()
  })

  it('shows email field as disabled', () => {
    renderSettings()
    const emailInput = screen.getByLabelText('E-Mail')
    expect(emailInput).toBeDisabled()
  })

  it('shows save button', () => {
    renderSettings()
    expect(screen.getByText('Änderungen speichern')).toBeInTheDocument()
  })

  it('switches to billing tab', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('tab', { name: 'Abrechnung' }))
    expect(screen.getByText('Aktueller Plan')).toBeInTheDocument()
    expect(screen.getByText(/Professional/)).toBeInTheDocument()
  })

  it('switches to security tab', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('tab', { name: 'Sicherheit' }))
    expect(screen.getByRole('heading', { name: 'Passwort ändern' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Konto löschen' })).toBeInTheDocument()
  })

  it('switches to ERP tab', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('tab', { name: 'ERP-Exportformate' }))
    // 'ERP-Exportformate' is both tab label and section heading
    expect(screen.getByRole('heading', { name: 'ERP-Exportformate' })).toBeInTheDocument()
    expect(screen.getByText('CSV (Universal)')).toBeInTheDocument()
  })
})
