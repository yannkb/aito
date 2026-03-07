import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="route-placeholder">
      <h1>Weekly Overview</h1>
      <p>Coming Soon</p>
      <p className="route-description">
        This will display your 4-day training program with daily summaries.
      </p>
    </div>
  )
}
