import { useSelector } from "react-redux"

import type { RootState } from "@/store/store"
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  matchesPermissionRule,
  type PermissionRule,
} from "../utils/permission.utils"

export function useAuthAccess() {
  const { currentAccount, permissions, roles } = useSelector(
    (state: RootState) => state.auth
  )

  return {
    currentAccount,
    permissions,
    roles,
    hasPermission: (permission: string) => hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: string[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: string[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    matchesRule: (rule?: PermissionRule | null) =>
      matchesPermissionRule(permissions, rule),
  }
}
