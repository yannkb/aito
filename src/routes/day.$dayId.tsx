import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/day/$dayId',
  component: DayDetailComponent,
})

function DayDetailComponent() {
  const { dayId } = Route.useParams()
  
  return (
    <div className="route-placeholder">
      <h1>Day Detail</h1>
      <p>Coming Soon</p>
      <p className="route-description">
        Day ID: <strong>{dayId}</strong>
      </p>
      <p className="route-description">
        This will display the full workout for the selected day.
      </p>
    </div>
  )
}
