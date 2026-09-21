import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/layout/Layout"
import { ForbiddenPage } from "@/features/auth/page/ForbiddenPage"
import { LoginPage } from "@/features/auth/page/LoginPage"
import { NoPermissionsPage } from "@/features/auth/page/NoPermissionsPage"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute"
import { adminRoutes } from "./routes/adminRoutes"
import { absencesRoutes } from "./routes/absencesRoutes"
import { employeesRoutes } from "./routes/employeesRoutes"
import { fleetRoutes } from "./routes/fleetRoutes"
import { inventoryRoutes } from "./routes/inventoryRoutes"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import { getFirstAccessibleRoute } from "@/features/auth/utils/authorized-navigation"

function AuthorizedIndexRedirect() {
  const { permissions } = useAuthAccess()
  const firstAccessibleRoute = getFirstAccessibleRoute(permissions)

  return <Navigate to={firstAccessibleRoute ?? "/sin-permisos"} replace />
}

export const AppRouter = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/403", element: <ForbiddenPage /> },
      { path: "/sin-permisos", element: <NoPermissionsPage /> },
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <AuthorizedIndexRedirect /> },
          adminRoutes,
          employeesRoutes,
          absencesRoutes,
          inventoryRoutes,
          fleetRoutes,
          { path: "*", element: <AuthorizedIndexRedirect /> },
        ],
      },
    ],
  },
])
