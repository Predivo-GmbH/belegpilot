import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AuthCallback from '../AuthCallback'

function renderCallback() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    </HelmetProvider>,
  )
}

describe('AuthCallback', () => {
  it('shows loading spinner', () => {
    renderCallback()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays processing status text', () => {
    renderCallback()
    expect(screen.getByText('Wird verarbeitet...')).toBeInTheDocument()
  })

  it('has sr-only loading text', () => {
    renderCallback()
    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })
})
