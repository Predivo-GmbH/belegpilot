import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordGate } from '../PasswordGate'

describe('PasswordGate', () => {
  beforeEach(() => {
    vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)
  })

  it('shows password form when not unlocked', () => {
    render(
      <PasswordGate>
        <div>Protected Content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('BelegPilot')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Passwort')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows children when sessionStorage has unlocked flag', () => {
    vi.mocked(window.sessionStorage.getItem).mockReturnValue('true')
    render(
      <PasswordGate>
        <div>Protected Content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows error on wrong password submission', async () => {
    const user = userEvent.setup()
    render(
      <PasswordGate>
        <div>Protected Content</div>
      </PasswordGate>,
    )
    const input = screen.getByPlaceholderText('Passwort')
    await user.type(input, 'wrongpassword')
    await user.click(screen.getByText('Weiter'))
    // Error should show (the SHA-256 won't match)
    expect(await screen.findByText('Falsches Passwort')).toBeInTheDocument()
  })

  it('has accessible password input with aria-label', () => {
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>,
    )
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>,
    )
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
  })
})
