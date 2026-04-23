import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DocumentReview from '../DocumentReview'

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
  useDocuments: vi.fn(() => ({ data: [], isLoading: false })),
  useDocument: vi.fn(() => ({
    data: {
      id: 'doc-1',
      file_name: 'Invoice_Test.pdf',
      file_type: 'application/pdf',
      file_path: 'org-1/test.pdf',
      status: 'review',
      amount: 1500,
      currency: 'CHF',
      document_date: '2026-03-15',
      supplier_name: 'Lieferant AG',
      supplier_iban: 'CH93 0076 2011 6238 5295 7',
      vat_rate: 8.1,
      account_number: '4000',
      contra_account: '1020',
      confidence_scores: { amount: 0.95, supplier_name: 0.88, vat_rate: 0.72 },
      qr_data: null,
      clients: { name: 'Mandant X' },
    },
    isLoading: false,
  })),
}))

// Mock PdfViewer to avoid pdfjs-dist in tests
vi.mock('@/components/shared/PdfViewer', () => ({
  PdfViewer: () => <div data-testid="pdf-viewer">PDF Preview</div>,
}))

function renderReview() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/documents/doc-1']}>
          <Routes>
            <Route path="/documents/:id" element={<DocumentReview />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('DocumentReview', () => {
  it('renders document filename as heading', () => {
    renderReview()
    expect(screen.getByText('Invoice_Test.pdf')).toBeInTheDocument()
  })

  it('shows extracted data section', () => {
    renderReview()
    expect(screen.getByText('Extrahierte Daten')).toBeInTheDocument()
  })

  it('displays supplier name', () => {
    renderReview()
    expect(screen.getByText('Lieferant AG')).toBeInTheDocument()
  })

  it('displays amount with currency', () => {
    renderReview()
    expect(screen.getByText(/CHF/)).toBeInTheDocument()
  })

  it('shows verify button for review status', () => {
    renderReview()
    expect(screen.getByLabelText('Als verifiziert markieren')).toBeInTheDocument()
  })

  it('shows download button', () => {
    renderReview()
    expect(screen.getByLabelText('Dokument herunterladen')).toBeInTheDocument()
  })

  it('shows back button to documents', () => {
    renderReview()
    expect(screen.getByText('Zurück')).toBeInTheDocument()
  })

  it('shows confidence-related field labels', () => {
    renderReview()
    expect(screen.getByText('LIEFERANT')).toBeInTheDocument()
    expect(screen.getByText('GESAMTBETRAG')).toBeInTheDocument()
  })
})
