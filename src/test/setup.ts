import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock import.meta.env for Supabase client
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

// Global Supabase mock to prevent CI crashes
const mockSingle = vi.fn().mockReturnValue({ data: null, error: null })
const mockEq = vi.fn().mockReturnThis()
const mockIn = vi.fn().mockReturnThis()
const mockIlike = vi.fn().mockReturnThis()
const mockOr = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()
const mockLimit = vi.fn().mockReturnThis()

const mockQueryBuilder = {
  select: vi.fn().mockReturnValue({
    data: [],
    error: null,
    count: 0,
    eq: mockEq,
    in: mockIn,
    ilike: mockIlike,
    or: mockOr,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
  }),
  insert: vi.fn().mockReturnValue({ data: null, error: null }),
  update: vi.fn().mockReturnValue({ eq: mockEq, error: null }),
  delete: vi.fn().mockReturnValue({ eq: mockEq, error: null }),
}

const mockSubscription = { unsubscribe: vi.fn() }

const mockSupabaseClient = {
  from: vi.fn(() => mockQueryBuilder),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: mockSubscription } })),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ error: null }),
      download: vi.fn().mockResolvedValue({ data: null }),
      createSignedUrl: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock the project's own Supabase client import
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

// Mock window.crypto.subtle for PasswordGate SHA-256
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => 'test-uuid-1234',
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
    },
  })
}

// Mock sessionStorage
const sessionStore: Record<string, string> = {}
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key: string) => sessionStore[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { sessionStore[key] = value }),
    removeItem: vi.fn((key: string) => { delete sessionStore[key] }),
    clear: vi.fn(() => { Object.keys(sessionStore).forEach(k => delete sessionStore[k]) }),
  },
})
