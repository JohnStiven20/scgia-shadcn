export interface CurrentAccountResponse {
  id: number
  username: string
  roles: string[]
  permissions: string[]
}

type PermissionLike = {
  code?: unknown
  name?: unknown
  path?: unknown
  authority?: unknown
  permission?: unknown
}

type RoleLike = {
  name?: unknown
  permissions?: unknown
  authorities?: unknown
}

export type RawCurrentAccountResponse = {
  id: number
  username: string
  roles?: unknown
  permissions?: unknown
  authorities?: unknown
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function readPermissionCode(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (!value || typeof value !== "object") {
    return null
  }

  const permission = value as PermissionLike

  for (const candidate of [
    permission.code,
    permission.authority,
    permission.permission,
    permission.path,
    permission.name,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate
    }
  }

  return null
}

function readRoleName(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (!value || typeof value !== "object") {
    return null
  }

  const role = value as RoleLike

  return typeof role.name === "string" && role.name.trim() ? role.name : null
}

export function normalizeCurrentAccount(
  account: RawCurrentAccountResponse
): CurrentAccountResponse {
  const roles = toArray(account.roles)
  const directPermissions = [
    ...toArray(account.permissions),
    ...toArray(account.authorities),
  ]
  const rolePermissions = roles.flatMap((role) => {
    if (!role || typeof role !== "object") {
      return []
    }

    const roleLike = role as RoleLike

    return [...toArray(roleLike.permissions), ...toArray(roleLike.authorities)]
  })

  return {
    id: account.id,
    username: account.username,
    roles: roles
      .map(readRoleName)
      .filter((role): role is string => Boolean(role)),
    permissions: [...directPermissions, ...rolePermissions]
      .map(readPermissionCode)
      .filter((permission): permission is string => Boolean(permission)),
  }
}
