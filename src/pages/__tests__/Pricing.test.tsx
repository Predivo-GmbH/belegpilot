import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Pricing from '../Pricing'

function renderPricing() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    </HelmetProvider>,
  )
}

describe('Pricing', () => {
  it('renders pricing heading', () => {
    renderPricing()
    expect(
      screen.getByRole('heading', { name: /transparente Preise/ }),
    ).toBeInTheDocument()
  })

  it('shows all 3 tiers', () => {
    renderPricing()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows prices in CHF', () => {
    renderPricing()
    expect(screen.getByText(/CHF 49/)).toBeInTheDocument()
    expect(screen.getByText(/CHF 99/)).toBeInTheDocument()
    expect(screen.getByText(/CHF 249/)).toBeInTheDocument()
  })

  it('shows subtitle about cancellation', () => {
    renderPricing()
    expect(screen.getByText(/Jederzeit kündbar/)).toBeInTheDocument()
  })

  it('has skip link for accessibility', () => {
    renderPricing()
    expect(screen.getByText('Zum Hauptinhalt springen')).toBeInTheDocument()
  })

  it('shows disclaimer about VAT', () => {
    renderPricing()
    expect(screen.getByText(/exkl. MwSt/)).toBeInTheDocument()
  })
})
