import { Navigate } from "react-router-dom"

import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import { INVENTORY_PERMISSIONS } from "../permissions"

export function InventoryIndexRedirect() {
  const { hasPermission } = useAuthAccess()

  if (hasPermission(INVENTORY_PERMISSIONS.TRACEABILITY_VIEW)) {
    return <Navigate to="/inventory/traceability" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.MODEL_VIEW)) {
    return <Navigate to="/inventory/models" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.PRODUCT_VIEW)) {
    return <Navigate to="/inventory/products" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.ENTRY_CREATE)) {
    return <Navigate to="/inventory/entry" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.ASSIGNMENT_CREATE)) {
    return <Navigate to="/inventory/assignment" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.RETURN_CREATE)) {
    return <Navigate to="/inventory/return" replace />
  }

  if (hasPermission(INVENTORY_PERMISSIONS.EXIT_CREATE)) {
    return <Navigate to="/inventory/out" replace />
  }

  return <Navigate to="/403" replace />
}
