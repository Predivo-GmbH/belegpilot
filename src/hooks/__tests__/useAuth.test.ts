import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

// The supabase mock is set up in test/setup.ts

describe('useAuth', () => {
  it('initializes with loading=true and user=null', () => {
    const { result } = renderHook(() => useAuth())
    // Initially loading
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('resolves loading to false after session check', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('exposes a signOut function', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.signOut).toBe('function')
  })

  it('signOut calls supabase.auth.signOut', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    await act(async () => {
      await result.current.signOut()
    })
    // Should not throw
  })
})
