import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Suspense, lazy } from 'react'
import { PasswordGate } from '@/components/shared/PasswordGate'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

const Landing = lazy(() => import('@/pages/Landing'))
const Auth = lazy(() => import('@/pages/Auth'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Documents = lazy(() => import('@/pages/Documents'))
const DocumentReview = lazy(() => import('@/pages/DocumentReview'))
const Upload = lazy(() => import('@/pages/Upload'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Clients = lazy(() => import('@/pages/Clients'))
const Export = lazy(() => import('@/pages/Export'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function DevBanner() {
  return (
    <div className="bg-status-warning px-4 py-2 text-center text-sm font-medium text-foreground">
      This site is currently under active development and is not yet functional. Features, content, and design may change without notice.
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <DevBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/documents/:id" element={<ProtectedRoute><DocumentReview /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export function App() {
  const gatePassword = import.meta.env.VITE_PASSWORD_GATE

  return (
    <QueryClientProvider client={queryClient}>
      {gatePassword ? (
        <PasswordGate password={gatePassword}>
          <AppRouter />
        </PasswordGate>
      ) : (
        <AppRouter />
      )}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
