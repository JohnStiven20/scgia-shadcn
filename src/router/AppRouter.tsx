import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/layout/Layout"
import { ForbiddenPage } from "@/features/auth/page/ForbiddenPage"
import { adminRoutes } from "./routes/adminRoutes"
import { absencesRoutes } from "./routes/absencesRoutes"
import { employeesRoutes } from "./routes/employeesRoutes"
import { fleetRoutes } from "./routes/fleetRoutes"
import { inventoryRoutes } from "./routes/inventoryRoutes"

export const AppRouter = createBrowserRouter([
  { path: "/403", element: <ForbiddenPage /> },
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
])
