import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../Dashboard'

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
      full_name: 'Sandra Meier',
      organization_id: 'org-1',
      organizations: { id: 'org-1', name: 'Meier Treuhand AG', plan: 'starter' },
    },
  })),
}))

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(() => ({
    data: {
      totalDocuments: 142,
      processedDocuments: 128,
      reviewDocuments: 5,
      totalAmount: 45200,
    },
  })),
  useRecentDocuments: vi.fn(() => ({
    data: [
      {
        id: 'doc-1',
        file_name: 'Rechnung_2026.pdf',
        status: 'verified',
        amount: 1250.5,
        document_date: '2026-03-15',
        clients: { name: 'Muster AG' },
      },
    ],
  })),
}))

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Dashboard', () => {
  it('renders Dashboard heading', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('shows personalized greeting', () => {
    renderDashboard()
    expect(screen.getByText(/Sandra/)).toBeInTheDocument()
  })

  it('displays 4 metric cards', () => {
    renderDashboard()
    expect(screen.getByText('BELEGE GESAMT')).toBeInTheDocument()
    expect(screen.getByText('VERARBEITET')).toBeInTheDocument()
    expect(screen.getByText('ZUR PRÜFUNG')).toBeInTheDocument()
    expect(screen.getByText('EXPORTIERT (CHF)')).toBeInTheDocument()
  })

  it('shows recent documents heading', () => {
    renderDashboard()
    expect(screen.getByText('Letzte Dokumente')).toBeInTheDocument()
  })

  it('shows upload button', () => {
    renderDashboard()
    expect(screen.getByText('Beleg hochladen')).toBeInTheDocument()
  })

  it('renders recent document in table', () => {
    renderDashboard()
    expect(screen.getByText('Rechnung_2026.pdf')).toBeInTheDocument()
    expect(screen.getByText('Muster AG')).toBeInTheDocument()
  })

  it('shows "Alle anzeigen" link', () => {
    renderDashboard()
    expect(screen.getByText('Alle anzeigen')).toBeInTheDocument()
  })
})
