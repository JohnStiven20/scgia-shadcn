import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/layout/Layout"
import { ForbiddenPage } from "@/features/auth/page/ForbiddenPage"
import { LoginPage } from "@/features/auth/page/LoginPage"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute"
import { adminRoutes } from "./routes/adminRoutes"
import { absencesRoutes } from "./routes/absencesRoutes"
import { employeesRoutes } from "./routes/employeesRoutes"
import { fleetRoutes } from "./routes/fleetRoutes"
import { inventoryRoutes } from "./routes/inventoryRoutes"

export const AppRouter = createBrowserRouter([
  { path: "/403", element: <ForbiddenPage /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/employees" replace /> },
          adminRoutes,
          employeesRoutes,
          absencesRoutes,
          inventoryRoutes,
          fleetRoutes,
          { path: "*", element: <Navigate to="/employees" replace /> },
        ],
      },
    ],
  },
])
