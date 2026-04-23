import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signOut: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@test.ch' } as unknown as ReturnType<typeof useAuth>['user'],
      session: {} as unknown as ReturnType<typeof useAuth>['session'],
      loading: false,
      signOut: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /auth when no user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Should Not Render</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument()
  })
})
