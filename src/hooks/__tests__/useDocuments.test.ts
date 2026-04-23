import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useDocuments, useDocument } from '../useDocuments'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useDocuments', () => {
  it('returns undefined data when no user is authenticated', () => {
    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toBeUndefined()
  })

  it('accepts status and search filters', () => {
    const { result } = renderHook(
      () => useDocuments({ status: 'review', search: 'test' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.data).toBeUndefined()
  })

  it('query is disabled when no user', () => {
    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useDocument', () => {
  it('returns undefined when no document ID', () => {
    const { result } = renderHook(() => useDocument(undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toBeUndefined()
  })

  it('query is disabled when no user or no ID', () => {
    const { result } = renderHook(() => useDocument('test-id'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})
