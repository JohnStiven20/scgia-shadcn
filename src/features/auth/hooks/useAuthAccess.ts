import { useMemo } from "react"

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  matchesPermissionRule,
  type PermissionRule,
} from "../utils/permission.utils"

type PermissionClaims = {
  permissions?: unknown
  authorities?: unknown
}

function getPermissionValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "string") {
    return value.split(/[\s,]+/).filter(Boolean)
  }

  return []
}

function getStoredPermissions() {
  if (typeof window === "undefined") {
    return []
  }

  const storedPermissions = window.localStorage.getItem("permissions")
  if (storedPermissions) {
    try {
      return getPermissionValues(JSON.parse(storedPermissions))
    } catch {
      return []
    }
  }

  const token =
    window.localStorage.getItem("token") ??
    window.sessionStorage.getItem("token")
  if (!token) {
    return []
  }

  try {
    const payload = token.split(".")[1]
    const claims = JSON.parse(atob(payload)) as PermissionClaims

    return [
      ...getPermissionValues(claims.permissions),
      ...getPermissionValues(claims.authorities),
    ]
  } catch {
    return []
  }
}

export function useAuthAccess() {
  const permissions = useMemo(() => getStoredPermissions(), [])

  return {
    permissions,
    hasPermission: (permission: string) => hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: string[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: string[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    matchesRule: (rule?: PermissionRule | null) =>
      matchesPermissionRule(permissions, rule),
  }
}

