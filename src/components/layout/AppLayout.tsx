import type { ReactNode } from 'react'
import { AppSidebar } from './AppSidebar'

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
        <div className="mx-auto max-w-[1200px] p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
