import type { ReactNode } from 'react'
import { AppSidebar, MobileMenuButton } from './AppSidebar'

interface AppLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function AppLayout({ children, title, subtitle, action }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Zum Hauptinhalt springen
      </a>
      <AppSidebar />
      <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MobileMenuButton />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
                {subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-ink-secondary">{subtitle}</p>}
              </div>
            </div>
            {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
