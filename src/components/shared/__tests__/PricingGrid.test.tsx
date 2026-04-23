import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PricingGrid } from '../PricingGrid'

describe('PricingGrid', () => {
  it('renders all 3 pricing tiers', () => {
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows correct prices', () => {
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    expect(screen.getByText(/CHF 49/)).toBeInTheDocument()
    expect(screen.getByText(/CHF 99/)).toBeInTheDocument()
    expect(screen.getByText(/CHF 249/)).toBeInTheDocument()
  })

  it('marks Professional as "Beliebtester Plan"', () => {
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    expect(screen.getByText('Beliebtester Plan')).toBeInTheDocument()
  })

  it('calls onSelectPlan with correct tier key', async () => {
    const user = userEvent.setup()
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0]) // Starter
    expect(onSelectPlan).toHaveBeenCalledWith('starter')
  })

  it('displays feature labels for each tier', () => {
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    // Feature labels appear in all tiers, so use getAllByText
    expect(screen.getAllByText('KI-Belegextraktion').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('QR-Rechnung Erkennung').length).toBeGreaterThanOrEqual(1)
  })

  it('shows document limits per tier', () => {
    const onSelectPlan = vi.fn()
    render(<PricingGrid onSelectPlan={onSelectPlan} />)
    expect(screen.getByText(/200 Dokumente/)).toBeInTheDocument()
    expect(screen.getByText(/1.000 Dokumente/)).toBeInTheDocument()
    expect(screen.getByText(/Unbegrenzte Dokumente/)).toBeInTheDocument()
  })
})
