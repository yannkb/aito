import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants/storage'

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleClearAndReload = () => {
    localStorage.removeItem(STORAGE_KEYS.PROGRAM)
    localStorage.removeItem(STORAGE_KEYS.THEME)
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0f0f0f',
        color: '#e5e5e5',
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#999', marginBottom: '1.5rem', maxWidth: '20rem', lineHeight: 1.5 }}>
          The app hit an unexpected error. Try reloading, or clear your data to start fresh.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#333',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          <button
            onClick={this.handleClearAndReload}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #555',
              backgroundColor: 'transparent',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Data & Reload
          </button>
        </div>
      </div>
    )
  }
}
