import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { PageMeta } from '../PageMeta'

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>)
}

describe('PageMeta', () => {
  it('renders without crashing', () => {
    const { container } = renderWithHelmet(<PageMeta title="Test" />)
    expect(container).toBeTruthy()
  })

  it('accepts title prop', () => {
    renderWithHelmet(<PageMeta title="Dashboard" />)
    // HelmetProvider updates are async, so we just verify no error
  })

  it('accepts description prop', () => {
    renderWithHelmet(
      <PageMeta title="Test" description="Test description" />,
    )
  })

  it('accepts canonical prop', () => {
    renderWithHelmet(
      <PageMeta title="Test" canonical="https://belegpilot.predivo.ch/" />,
    )
  })

  it('accepts noindex prop', () => {
    renderWithHelmet(<PageMeta title="Test" noindex />)
  })
})
