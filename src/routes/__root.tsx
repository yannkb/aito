import { useEffect } from 'react'
import { Outlet, Link, createRootRoute, useRouterState } from '@tanstack/react-router'
import { useTheme } from '../context/ThemeContext'
import { useProgram, useSaved } from '../context/ProgramContext'
import { PWAUpdatePrompt } from '../components/PWAUpdatePrompt'
import { OfflineIndicator } from '../components/OfflineIndicator'
import '../styles/navigation.css'

export const Route = createRootRoute({
  component: RootComponent,
})

RootComponent.displayName = 'RootComponent'

function RootComponent() {
  const { theme } = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const program = useProgram()
  const saved = useSaved()

  const dayMatch = pathname.match(/^\/day\/(.+)$/)
  const dayId = dayMatch ? dayMatch[1] : null
  const day = dayId ? program.days.find((d) => d.id === dayId) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const pageTitle = pathname === '/settings'
    ? 'Aito \u00b7 Settings'
    : day
      ? `Aito \u00b7 ${day.name} \u2014 ${day.sessionName}`
      : 'Aito'

  const renderHeader = () => {
    if (dayId) {
      return (
        <>
          <Link to="/" className="app-header-back" aria-label="Back to overview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="app-header-title">
            {day ? `${day.name} \u2014 ${day.sessionName}` : 'Day not found'}
          </span>
        </>
      )
    }

    if (pathname === '/settings') {
      return <h1 className="app-header-title">Settings</h1>
    }

    return <h1 className="app-header-title">Aito</h1>
  }

  return (
    <div className="app-root" data-theme={theme}>
      <title>{pageTitle}</title>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <OfflineIndicator />

      <header className="app-header">
        {renderHeader()}
        <span className={`saved-indicator ${saved ? 'saved-visible' : ''}`}>
          Saved
        </span>
      </header>

      <main id="main-content" className="app-content">
        <Outlet />
      </main>

      <PWAUpdatePrompt />

      <nav className="bottom-nav">
        <Link to="/" className="nav-item" activeProps={{ className: 'active', 'aria-current': 'page' as const }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-label">Program</span>
        </Link>

        <Link to="/settings" className="nav-item" activeProps={{ className: 'active', 'aria-current': 'page' as const }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="nav-label">Settings</span>
        </Link>
      </nav>
    </div>
  )
}
