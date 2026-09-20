import { Navigate } from "react-router-dom"

import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

export function AbsencesIndexRedirect() {
  const { hasPermission } = useAuthAccess()

  if (hasPermission("absence.own.view")) {
    return <Navigate to="my-absences" replace />
  }

  if (hasPermission("absence.management.view")) {
    return <Navigate to="requests" replace />
  }

  if (hasPermission("absence.type.view")) {
    return <Navigate to="types" replace />
  }

  return <Navigate to="/403" replace />
}
