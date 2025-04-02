import { createRootRoute, Navigate, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools initialIsOpen={false} />
    </>
  ),
  notFoundComponent: () => <Navigate to={'/404'} />,
})
