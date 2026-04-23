import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Import all legal pages
import Datenschutz from '../legal/Datenschutz'
import AGB from '../legal/AGB'
import Impressum from '../legal/Impressum'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>,
  )
}

describe('Datenschutz', () => {
  it('renders heading', () => {
    renderWithProviders(<Datenschutz />)
    expect(
      screen.getByRole('heading', { name: 'Datenschutzerklärung' }),
    ).toBeInTheDocument()
  })

  it('shows responsible entity', () => {
    renderWithProviders(<Datenschutz />)
    expect(screen.getByText(/Predivo GmbH/)).toBeInTheDocument()
  })

  it('has back to home link', () => {
    renderWithProviders(<Datenschutz />)
    expect(screen.getByText(/Zurück zur Startseite/)).toBeInTheDocument()
  })

  it('has contact email link', () => {
    renderWithProviders(<Datenschutz />)
    expect(screen.getAllByText('info@predivo.ch').length).toBeGreaterThan(0)
  })
})

describe('AGB', () => {
  it('renders heading', () => {
    renderWithProviders(<AGB />)
    expect(
      screen.getByRole('heading', { name: /Allgemeine Geschäftsbedingungen/ }),
    ).toBeInTheDocument()
  })

  it('has back to home link', () => {
    renderWithProviders(<AGB />)
    expect(screen.getByText(/Zurück zur Startseite/)).toBeInTheDocument()
  })
})

describe('Impressum', () => {
  it('renders heading', () => {
    renderWithProviders(<Impressum />)
    expect(
      screen.getByRole('heading', { name: 'Impressum' }),
    ).toBeInTheDocument()
  })

  it('has back to home link', () => {
    renderWithProviders(<Impressum />)
    expect(screen.getByText(/Zurück zur Startseite/)).toBeInTheDocument()
  })
})
