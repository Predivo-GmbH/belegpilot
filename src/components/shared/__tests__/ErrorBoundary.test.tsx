import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

function ThrowingComponent(): never {
  throw new Error('Test error')
}

function GoodComponent() {
  return <div>Working content</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected error boundary logs
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Working content')).toBeInTheDocument()
  })

  it('shows error fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Etwas ist schiefgelaufen')).toBeInTheDocument()
  })

  it('shows reload button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Seite neu laden')).toBeInTheDocument()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })
})
