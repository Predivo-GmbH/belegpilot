import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Suspense, lazy, useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { PasswordGate } from '@/components/shared/PasswordGate'

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
const Datenschutz = lazy(() => import('@/pages/legal/Datenschutz'))
const AGB = lazy(() => import('@/pages/legal/AGB'))
const Impressum = lazy(() => import('@/pages/legal/Impressum'))

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
    <div className="flex h-screen items-center justify-center bg-background" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Laden...</span>
    </div>
  )
}

function RouteAnnouncer() {
  const location = useLocation()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const heading = document.querySelector('h1')
      setAnnouncement(heading?.textContent ?? document.title)
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div aria-live="assertive" aria-atomic="true" role="status" className="sr-only">
      {announcement}
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <RouteAnnouncer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/impressum" element={<Impressum />} />
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
  return (
    <PasswordGate>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </PasswordGate>
  )
}
