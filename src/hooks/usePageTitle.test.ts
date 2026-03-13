import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePageTitle } from './usePageTitle'

describe('usePageTitle', () => {
  afterEach(() => {
    document.title = ''
  })

  it('sets title with suffix when title provided', () => {
    renderHook(() => usePageTitle('Dashboard'))
    expect(document.title).toBe('Dashboard | BelegPilot')
  })

  it('sets default title when no title provided', () => {
    renderHook(() => usePageTitle())
    expect(document.title).toBe('BelegPilot — KI-Belegverarbeitung für Schweizer Treuhand')
  })

  it('updates title when title changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'A' },
    })
    expect(document.title).toBe('A | BelegPilot')
    rerender({ title: 'B' })
    expect(document.title).toBe('B | BelegPilot')
  })
})
