import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsComponent,
})

function SettingsComponent() {
  return (
    <div className="route-placeholder">
      <h1>Settings</h1>
      <p>Coming Soon</p>
      <p className="route-description">
        This will contain theme selection, data management, and app preferences.
      </p>
    </div>
  )
}
