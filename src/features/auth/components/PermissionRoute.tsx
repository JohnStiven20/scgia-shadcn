import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthAccess } from "../hooks/useAuthAccess"
import type { PermissionRule } from "../utils/permission.utils"

type PermissionRouteProps = {
  rule?: PermissionRule | null
  children?: ReactNode
}

export function PermissionRoute({ rule, children }: PermissionRouteProps) {
  const location = useLocation()
  const { matchesRule } = useAuthAccess()

  if (!matchesRule(rule)) {
    return <Navigate to="/403" replace state={{ from: location }} />
  }

  if (children) {
    return <>{children}</>
  }

  return <Outlet />
}

