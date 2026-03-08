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
    if (pathname === '/settings') {
      document.title = 'Aito \u00b7 Settings'
    } else if (day) {
      document.title = `Aito \u00b7 ${day.name} \u2014 ${day.sessionName}`
    } else {
      document.title = 'Aito'
    }
  }, [pathname, day])

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
      <OfflineIndicator />

      <header className="app-header">
        {renderHeader()}
        <span className={`saved-indicator ${saved ? 'saved-visible' : ''}`}>
          Saved
        </span>
      </header>

      <div className="app-content">
        <Outlet />
      </div>

      <PWAUpdatePrompt />

      <nav className="bottom-nav">
        <Link to="/" className="nav-item" activeProps={{ className: 'active' }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-label">Program</span>
        </Link>

        <Link to="/settings" className="nav-item" activeProps={{ className: 'active' }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.8 5.2l-4.2-4.2m-6 0l-4.2 4.2" />
          </svg>
          <span className="nav-label">Settings</span>
        </Link>
      </nav>
    </div>
  )
}
