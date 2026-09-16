import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import type { RootState } from "@/store/store"

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  )

  if (!isInitialized) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
