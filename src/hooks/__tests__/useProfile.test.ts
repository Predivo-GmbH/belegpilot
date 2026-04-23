import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useProfile } from '../useProfile'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useProfile', () => {
  it('returns undefined data when no user is authenticated', () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toBeUndefined()
  })

  it('query is disabled when no user', () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})
