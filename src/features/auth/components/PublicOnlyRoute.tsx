import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

import type { RootState } from "@/store/store"

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  )

  if (!isInitialized) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
