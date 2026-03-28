import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <AlertTriangle className="h-12 w-12 text-status-warning" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Etwas ist schiefgelaufen</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
          >
            Seite neu laden
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
