import type { PermissionRule } from "@/features/auth/utils/permission.utils"

export const INVENTORY_PERMISSIONS = {
  ENTRY_CREATE: "inventory.entry.create",
  ASSIGNMENT_CREATE: "inventory.assignment.create",
  RETURN_CREATE: "inventory.return.create",
  EXIT_CREATE: "inventory.exit.create",
  MODEL_VIEW: "inventory.model.view",
  MODEL_CREATE: "inventory.model.create",
  MODEL_UPDATE: "inventory.model.update",
  MODEL_DELETE: "inventory.model.delete",
  PRODUCT_VIEW: "inventory.product.view",
  TRACEABILITY_VIEW: "inventory.traceability.view",
} as const

export const inventoryPermissionCodes = Object.values(INVENTORY_PERMISSIONS)

export const anyInventoryPermission = (
  ...permissions: string[]
): PermissionRule => ({
  mode: "any",
  permissions,
})
