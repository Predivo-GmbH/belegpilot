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
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MobileMenuButton />
              <div>
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
                {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
