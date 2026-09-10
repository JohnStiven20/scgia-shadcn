import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/layout/Layout"
import { absencesRoutes } from "./routes/absencesRoutes"
import { employeesRoutes } from "./routes/employeesRoutes"
import { fleetRoutes } from "./routes/fleetRoutes"
import { inventoryRoutes } from "./routes/inventoryRoutes"

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/employees" replace /> },
      employeesRoutes,
      absencesRoutes,
      inventoryRoutes,
      fleetRoutes,
      { path: "*", element: <Navigate to="/employees" replace /> },
    ],
  },
])
