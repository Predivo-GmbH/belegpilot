import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import NotFound from '../NotFound'

function renderNotFound() {
  return render(
    <HelmetProvider>
      <NotFound />
    </HelmetProvider>,
  )
}

describe('NotFound', () => {
  it('renders 404 heading', () => {
    renderNotFound()
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('shows "Seite nicht gefunden" text', () => {
    renderNotFound()
    expect(screen.getByText('Seite nicht gefunden')).toBeInTheDocument()
  })

  it('has link to home page', () => {
    renderNotFound()
    const link = screen.getByText('Zur Startseite')
    expect(link).toHaveAttribute('href', '/')
  })

  it('has main element', () => {
    const { container } = renderNotFound()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
