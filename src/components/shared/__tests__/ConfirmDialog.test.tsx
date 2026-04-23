import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../ConfirmDialog'

// Mock HTMLDialogElement methods
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Test"
        description="Test desc"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(container.querySelector('dialog')).not.toBeInTheDocument()
  })

  it('shows title and description when open', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Mandant löschen"
        description="Wirklich löschen?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Mandant löschen')).toBeInTheDocument()
    expect(screen.getByText('Wirklich löschen?')).toBeInTheDocument()
  })

  it('shows confirm and cancel buttons with custom labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Löschen')).toBeInTheDocument()
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        confirmLabel="OK"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    await user.click(screen.getByText('OK'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        cancelLabel="Nein"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByText('Nein'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('uses default labels when not specified', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Bestätigen')).toBeInTheDocument()
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
  })
})
