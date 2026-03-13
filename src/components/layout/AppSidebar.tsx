import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CloudUpload,
  Users,
  Download,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'BELEGE',
    items: [
      { label: 'Dokumente', href: '/documents', icon: FileText },
      { label: 'Upload', href: '/upload', icon: CloudUpload },
    ],
  },
  {
    label: 'MANDANTEN',
    items: [
      { label: 'Clients', href: '/clients', icon: Users },
      { label: 'Export', href: '/export', icon: Download },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Einstellungen', href: '/settings', icon: Settings },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <svg width="18" height="18" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M10 37c-2 0-3-1-3-4-0.5-8-0.5-18 0-26 0-3 2-4 4-4l8 0c6 0 10 4 10 9 0 4-3 7-7 7.5 5 0.5 9 4.5 9 9 0 5.5-5 8.5-11 8.5z m3-29c0 0 4-0.5 6 0 3 1 4.5 2.5 4.5 4.5 0 2-1.5 4-5 4.5l-5.5 0z m0 14c0 0 5-0.5 7 0 3 1 5 3 5 5.5 0 2.5-2 4.5-5.5 4.5l-6.5 0z"
              fill="#0E7C6B"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-foreground">BelegPilot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="mb-1.5 px-3 text-micro-label">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-ink-secondary hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  )
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-card shadow-lg lg:hidden">
            <div className="flex items-center justify-end p-2">
              <button
                onClick={() => setOpen(false)}
                aria-label="Menü schliessen"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-secondary hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

export function AppSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  )
}
