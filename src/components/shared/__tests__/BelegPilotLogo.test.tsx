import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BelegPilotLogo } from '../BelegPilotLogo'

describe('BelegPilotLogo', () => {
  it('renders SVG element', () => {
    const { container } = render(<BelegPilotLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('SVG is aria-hidden', () => {
    const { container } = render(<BelegPilotLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders sm size by default', () => {
    const { container } = render(<BelegPilotLogo />)
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('h-8')
    expect(wrapper?.className).toContain('w-8')
  })

  it('renders lg size when specified', () => {
    const { container } = render(<BelegPilotLogo size="lg" />)
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('h-10')
    expect(wrapper?.className).toContain('w-10')
  })

  it('has SVG path inside', () => {
    const { container } = render(<BelegPilotLogo />)
    const path = container.querySelector('path')
    expect(path).toBeInTheDocument()
  })
})
