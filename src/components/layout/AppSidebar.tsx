import { useState, useEffect, useRef, useCallback } from 'react'
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
import { BelegPilotLogo } from '@/components/shared/BelegPilotLogo'

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
        <BelegPilotLogo />
        <span className="text-sm font-semibold text-foreground">BelegPilot</span>
      </div>

      {/* Navigation */}
      <nav aria-label="Hauptnavigation" className="flex-1 space-y-4 overflow-y-auto p-3">
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
                      'flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-ink-secondary hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
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
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDrawer()
      return
    }
    if (e.key === 'Tab') {
      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            onKeyDown={handleKeyDown}
            className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[260px] flex-col border-r border-border bg-card lg:hidden"
          >
            <div className="flex items-center justify-end p-2">
              <button
                onClick={closeDrawer}
                aria-label="Menü schliessen"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-ink-secondary hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={closeDrawer} />
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
