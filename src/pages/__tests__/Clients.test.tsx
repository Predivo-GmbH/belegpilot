import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Clients from '../Clients'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1' },
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
      organizations: { id: 'org-1', name: 'Test AG', plan: 'starter' },
    },
  })),
}))

function renderClients() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Clients />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Clients', () => {
  it('renders Mandanten heading', () => {
    renderClients()
    expect(screen.getByRole('heading', { name: 'Mandanten' })).toBeInTheDocument()
  })

  it('shows subtitle', () => {
    renderClients()
    expect(screen.getByText(/Verwalten Sie Ihre Mandanten/)).toBeInTheDocument()
  })

  it('has new client button', () => {
    renderClients()
    expect(screen.getByText('Neuer Mandant')).toBeInTheDocument()
  })

  it('has search input', () => {
    renderClients()
    expect(screen.getByPlaceholderText('Mandant suchen...')).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    renderClients()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
