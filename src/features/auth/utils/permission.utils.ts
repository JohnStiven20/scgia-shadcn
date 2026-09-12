export type PermissionMode = "any" | "all"

export type PermissionRule = {
  mode: PermissionMode
  permissions: string[]
}

export function hasPermission(permissions: string[], permission: string) {
  return permissions.includes(permission) || permissions.includes("*")
}

export function hasAnyPermission(
  permissions: string[],
  requiredPermissions: string[]
) {
  return requiredPermissions.some((permission) =>
    hasPermission(permissions, permission)
  )
}

export function hasAllPermissions(
  permissions: string[],
  requiredPermissions: string[]
) {
  return requiredPermissions.every((permission) =>
    hasPermission(permissions, permission)
  )
}

export function matchesPermissionRule(
  permissions: string[],
  rule?: PermissionRule | null
) {
  if (!rule || rule.permissions.length === 0) {
    return true
  }

  if (rule.mode === "all") {
    return hasAllPermissions(permissions, rule.permissions)
  }

  return hasAnyPermission(permissions, rule.permissions)
}

