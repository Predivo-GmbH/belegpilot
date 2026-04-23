import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Documents from '../Documents'

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
    data: [
      {
        id: 'doc-1',
        file_name: 'Invoice_2026.pdf',
        status: 'review',
        amount: 500,
        document_date: '2026-03-10',
        clients: { name: 'Client A' },
      },
    ],
    isLoading: false,
  })),
}))

function renderDocuments() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Documents />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Documents', () => {
  it('renders Dokumente heading', () => {
    renderDocuments()
    expect(screen.getByRole('heading', { name: 'Dokumente' })).toBeInTheDocument()
  })

  it('shows search input', () => {
    renderDocuments()
    expect(screen.getByPlaceholderText('Dokumente durchsuchen...')).toBeInTheDocument()
  })

  it('shows status filter buttons', () => {
    renderDocuments()
    // Filter buttons have aria-current attribute; use getAllByText for items that appear in sidebar too
    expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prüfung' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verifiziert' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exportiert' })).toBeInTheDocument()
  })

  it('shows upload link', () => {
    renderDocuments()
    // "Upload" appears in both sidebar nav and page action; verify at least one exists
    expect(screen.getAllByText('Upload').length).toBeGreaterThanOrEqual(1)
  })

  it('renders document in table', () => {
    renderDocuments()
    expect(screen.getByText('Invoice_2026.pdf')).toBeInTheDocument()
    expect(screen.getByText('Client A')).toBeInTheDocument()
  })

  it('has table headers', () => {
    renderDocuments()
    expect(screen.getByText('DOKUMENT')).toBeInTheDocument()
    expect(screen.getByText('MANDANT')).toBeInTheDocument()
    expect(screen.getByText('STATUS')).toBeInTheDocument()
    expect(screen.getByText('BETRAG')).toBeInTheDocument()
    expect(screen.getByText('DATUM')).toBeInTheDocument()
  })
})
