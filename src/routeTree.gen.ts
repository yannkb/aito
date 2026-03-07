import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as SettingsRoute } from './routes/settings'
import { Route as DayDayIdRoute } from './routes/day.$dayId'

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  SettingsRoute,
  DayDayIdRoute,
])
