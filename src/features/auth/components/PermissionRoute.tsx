import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { useAuthAccess } from "../hooks/useAuthAccess"
import type { PermissionRule } from "../utils/permission.utils"
import { getFirstAccessibleRoute } from "../utils/authorized-navigation"

type PermissionRouteProps = {
  rule?: PermissionRule | null
  children?: ReactNode
}

export function PermissionRoute({ rule, children }: PermissionRouteProps) {
  const { matchesRule, permissions } = useAuthAccess()

  if (!matchesRule(rule)) {
    const firstAccessibleRoute = getFirstAccessibleRoute(permissions)

    if (firstAccessibleRoute === null) {
      return <Navigate to="/sin-permisos" replace />
    }

    return <Navigate to={firstAccessibleRoute} replace />
  }

  if (children) {
    return <>{children}</>
  }

  return <Outlet />
}
