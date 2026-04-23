import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from '../AppLayout'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AppLayout', () => {
  it('renders title', () => {
    renderWithRouter(
      <AppLayout title="Dashboard">
        <div>Content</div>
      </AppLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    renderWithRouter(
      <AppLayout title="Test" subtitle="Subtitle text">
        <div>Content</div>
      </AppLayout>,
    )
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })

  it('renders children', () => {
    renderWithRouter(
      <AppLayout title="Test">
        <div>Child Content</div>
      </AppLayout>,
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    renderWithRouter(
      <AppLayout title="Test" action={<button>Action</button>}>
        <div>Content</div>
      </AppLayout>,
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('has skip link for accessibility', () => {
    renderWithRouter(
      <AppLayout title="Test">
        <div>Content</div>
      </AppLayout>,
    )
    expect(screen.getByText('Zum Hauptinhalt springen')).toBeInTheDocument()
  })

  it('has main content area with id', () => {
    const { container } = renderWithRouter(
      <AppLayout title="Test">
        <div>Content</div>
      </AppLayout>,
    )
    expect(container.querySelector('#main-content')).toBeInTheDocument()
  })

  it('renders sidebar navigation', () => {
    renderWithRouter(
      <AppLayout title="Test">
        <div>Content</div>
      </AppLayout>,
    )
    expect(screen.getByLabelText('Hauptnavigation')).toBeInTheDocument()
  })
})
