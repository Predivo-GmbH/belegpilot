import { useState, type ReactNode } from 'react'

interface PasswordGateProps {
  password: string
  children: ReactNode
}

const STORAGE_KEY = 'belegpilot-unlocked'

export function PasswordGate({ password, children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === password) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-foreground">BelegPilot</h1>
          <p className="text-sm text-muted-foreground">Passwort eingeben um fortzufahren</p>
        </div>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          placeholder="Passwort"
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        />
        {error && <p className="text-sm text-destructive">Falsches Passwort</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
        >
          Weiter
        </button>
      </form>
    </div>
  )
}
