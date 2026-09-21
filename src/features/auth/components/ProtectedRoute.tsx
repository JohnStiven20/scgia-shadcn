import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import type { RootState } from "@/store/store"
import { getFirstAccessibleRoute } from "../utils/authorized-navigation"

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isInitialized, permissions } = useSelector(
    (state: RootState) => state.auth
  )

  if (!isInitialized) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (getFirstAccessibleRoute(permissions) === null) {
    if (location.pathname !== "/sin-permisos") {
      return <Navigate to="/sin-permisos" replace />
    }
  }

  return <Outlet />
}
