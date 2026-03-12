import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/day/$dayId',
  component: lazyRouteComponent(() => import('./day.$dayId.lazy')),
})
