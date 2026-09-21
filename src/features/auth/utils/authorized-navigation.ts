import {
  matchesPermissionRule,
  type PermissionRule,
} from "./permission.utils"

export type AuthorizedNavigationItem = {
  title: string
  href: string
  rule: PermissionRule
}

const anyOf = (...permissions: string[]): PermissionRule => ({
  mode: "any",
  permissions,
})

export const authorizedNavigationItems: AuthorizedNavigationItem[] = [
  {
    title: "Admin",
    href: "/admin",
    rule: anyOf("account.view", "role.view"),
  },
  {
    title: "Inventario",
    href: "/inventory",
    rule: anyOf(
      "inventory.entry.create",
      "inventory.assignment.create",
      "inventory.return.create",
      "inventory.exit.create",
      "inventory.model.view",
      "inventory.model.create",
      "inventory.model.update",
      "inventory.model.delete",
      "inventory.product.view",
      "inventory.traceability.view"
    ),
  },
  {
    title: "Trabajadores",
    href: "/employees",
    rule: anyOf("employee.view"),
  },
  {
    title: "Ausencias",
    href: "/absences",
    rule: anyOf(
      "absence.own.view",
      "absence.management.view",
      "absence.type.view"
    ),
  },
  {
    title: "Flota",
    href: "/fleet",
    rule: anyOf("fleet.vehicle.view"),
  },
]

export function getAccessibleNavigationItems(permissions: string[]) {
  return authorizedNavigationItems.filter((item) =>
    matchesPermissionRule(permissions, item.rule)
  )
}

export function getFirstAccessibleRoute(permissions: string[]) {
  return getAccessibleNavigationItems(permissions)[0]?.href ?? null
}
