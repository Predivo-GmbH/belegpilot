import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Upload from '../Upload'

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

function renderUpload() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Upload />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Upload', () => {
  it('renders upload heading', () => {
    renderUpload()
    expect(screen.getByRole('heading', { name: 'Dokument hochladen' })).toBeInTheDocument()
  })

  it('shows subtitle', () => {
    renderUpload()
    expect(screen.getByText(/Laden Sie Belege/)).toBeInTheDocument()
  })

  it('shows drop zone instructions', () => {
    renderUpload()
    expect(screen.getByText(/Dateien hierher ziehen/)).toBeInTheDocument()
  })

  it('shows accepted file types', () => {
    renderUpload()
    expect(screen.getByText(/PDF, JPG, PNG, TIFF/)).toBeInTheDocument()
  })

  it('shows max file size', () => {
    renderUpload()
    expect(screen.getByText(/20 MB/)).toBeInTheDocument()
  })

  it('has file input element', () => {
    const { container } = renderUpload()
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept')
  })

  it('has "Dateien auswählen" button', () => {
    renderUpload()
    expect(screen.getByText('Dateien auswählen')).toBeInTheDocument()
  })
})
