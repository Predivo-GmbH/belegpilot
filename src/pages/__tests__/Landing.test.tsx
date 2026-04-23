import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Landing from '../Landing'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderLanding() {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('Landing', () => {
  it('renders hero heading', () => {
    renderLanding()
    expect(
      screen.getByRole('heading', { name: /Buchungssätze/ }),
    ).toBeInTheDocument()
  })

  it('shows CTA button to signup', () => {
    renderLanding()
    expect(screen.getAllByText(/kostenlos testen/i).length).toBeGreaterThan(0)
  })

  it('displays trust bar metrics', () => {
    renderLanding()
    expect(screen.getByText('50+')).toBeInTheDocument()
    expect(screen.getByText('99.2%')).toBeInTheDocument()
    expect(screen.getByText('Swiss Made')).toBeInTheDocument()
  })

  it('shows all 6 feature cards', () => {
    renderLanding()
    // Feature text appears in both feature grid and pricing, so use getAllByText
    expect(screen.getAllByText('KI-Belegextraktion').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('QR-Rechnung & ZUGFeRD').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('heading', { name: 'Alle Schweizer ERP-Systeme' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Anomalie-Erkennung' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lieferanten-Lernen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'MWST-konform' })).toBeInTheDocument()
  })

  it('shows how-it-works steps', () => {
    renderLanding()
    expect(screen.getByText('Belege hochladen')).toBeInTheDocument()
    expect(screen.getByText('KI extrahiert & prüft')).toBeInTheDocument()
    expect(screen.getByText('In Ihr ERP exportieren')).toBeInTheDocument()
  })

  it('renders pricing section with 3 tiers', () => {
    renderLanding()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('has footer with legal links', () => {
    renderLanding()
    expect(screen.getAllByText('Datenschutz').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AGB').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Impressum').length).toBeGreaterThan(0)
  })

  it('has skip link for accessibility', () => {
    renderLanding()
    expect(screen.getByText('Zum Hauptinhalt springen')).toBeInTheDocument()
  })

  it('has main content area', () => {
    const { container } = renderLanding()
    expect(container.querySelector('#main-content')).toBeInTheDocument()
  })
})
