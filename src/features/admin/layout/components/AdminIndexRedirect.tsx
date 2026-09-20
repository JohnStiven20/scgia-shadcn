import { Navigate } from "react-router-dom"

import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

export function AdminIndexRedirect() {
  const { hasPermission } = useAuthAccess()

  if (hasPermission("account.view")) {
    return <Navigate to="users" replace />
  }

  if (hasPermission("role.view")) {
    return <Navigate to="roles" replace />
  }

  return <Navigate to="/403" replace />
}
