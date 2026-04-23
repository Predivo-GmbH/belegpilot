import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useDashboardStats, useRecentDocuments } from '../useDashboardStats'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useDashboardStats', () => {
  it('returns undefined data when no user is authenticated', () => {
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toBeUndefined()
  })

  it('query is disabled when no user', () => {
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useRecentDocuments', () => {
  it('returns undefined data when no user is authenticated', () => {
    const { result } = renderHook(() => useRecentDocuments(), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toBeUndefined()
  })
})
