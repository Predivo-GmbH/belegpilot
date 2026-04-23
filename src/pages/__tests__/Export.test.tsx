import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Export from '../Export'

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

vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}))

function renderExport() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Export />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Export', () => {
  it('renders Export heading', () => {
    renderExport()
    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
  })

  it('shows subtitle', () => {
    renderExport()
    expect(screen.getByText(/Exportieren Sie verifizierte/)).toBeInTheDocument()
  })

  it('shows ERP target selector label', () => {
    renderExport()
    expect(screen.getByText('Zielformat')).toBeInTheDocument()
  })

  it('shows all 5 ERP target buttons', () => {
    renderExport()
    expect(screen.getByText('CSV (Universal)')).toBeInTheDocument()
    expect(screen.getByText('Bexio')).toBeInTheDocument()
    expect(screen.getByText('Abacus (AbaConnect)')).toBeInTheDocument()
    expect(screen.getByText('Sage 50')).toBeInTheDocument()
    expect(screen.getByText('Banana Accounting')).toBeInTheDocument()
  })

  it('shows empty state when no verified documents', () => {
    renderExport()
    expect(screen.getByText('Keine verifizierten Dokumente')).toBeInTheDocument()
  })

  it('CSV is selected by default', () => {
    renderExport()
    const csvButton = screen.getByText('CSV (Universal)')
    expect(csvButton.closest('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
