import type { RouteObject } from "react-router-dom"
import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { InventoryLayout } from "@/features/inventory/layout/InventoryLayout"
import { InventoryIndexRedirect } from "@/features/inventory/layout/InventoryIndexRedirect"
import { TraceabilityPage } from "@/features/inventory/traceability/page/TraceabilityPage"
import { ModelsPage } from "@/features/inventory/models/page/ModesPage"
import { EntryPage } from "@/features/inventory/entry/page/EntryPage"
import { OutPage } from "@/features/inventory/out/page/OutPage"
import { AssignmentPage } from "@/features/inventory/assignment/page/AssignmentPage"
import { ReturnPage } from "@/features/inventory/return/page/ReturnPage"
import { ProductsPage } from "@/features/inventory/products/page/ProductsPage"
import { SpecificModelItemsPage } from "@/features/inventory/products/page/SpecificModelItemsPage"
import { WorkorderPage } from "../../features/inventory/workorders/page/WorkorderPage"
import { WorkOrderOperatorSelectionPage } from "../../features/inventory/workorders/page/ProviderWorkOrder"
import { WorkOrderDetailPage } from "@/features/inventory/workorder/page/WorkOrderDetailPage"
import {
  anyInventoryPermission,
  INVENTORY_PERMISSIONS,
} from "@/features/inventory/permissions"

const inventoryEntryRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.ENTRY_CREATE
)
const inventoryAssignmentRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.ASSIGNMENT_CREATE
)
const inventoryReturnRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.RETURN_CREATE
)
const inventoryExitRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.EXIT_CREATE
)
const inventoryModelViewRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.MODEL_VIEW
)
const inventoryProductViewRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.PRODUCT_VIEW
)
const inventoryTraceabilityRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.TRACEABILITY_VIEW
)

export const inventoryRoutes: RouteObject = {
  path: "inventory",
  element: <InventoryLayout />,
  children: [
    { index: true, element: <InventoryIndexRedirect /> },
    {
      path: "traceability",
      element: (
        <PermissionRoute rule={inventoryTraceabilityRule}>
          <TraceabilityPage />
        </PermissionRoute>
      ),
    },
    {
      path: "models",
      element: (
        <PermissionRoute rule={inventoryModelViewRule}>
          <ModelsPage />
        </PermissionRoute>
      ),
    },
    {
      path: "products",
      element: (
        <PermissionRoute rule={inventoryProductViewRule}>
          <ProductsPage />
        </PermissionRoute>
      ),
    },
    {
      path: "products/:modelId",
      element: (
        <PermissionRoute rule={inventoryProductViewRule}>
          <SpecificModelItemsPage />
        </PermissionRoute>
      ),
    },
    {
      path: "work-orders",
      element: <WorkorderPage />,
    },
    {
      path: "work-orders/new",
      element: <WorkOrderOperatorSelectionPage />,
    },
    {
      path: "work-orders/:workOrderId",
      element: <WorkOrderDetailPage />,
    },
    {
      path: "entry",
      element: (
        <PermissionRoute rule={inventoryEntryRule}>
          <EntryPage />
        </PermissionRoute>
      ),
    },
    {
      path: "out",
      element: (
        <PermissionRoute rule={inventoryExitRule}>
          <OutPage />
        </PermissionRoute>
      ),
    },
    {
      path: "assignment",
      element: (
        <PermissionRoute rule={inventoryAssignmentRule}>
          <AssignmentPage />
        </PermissionRoute>
      ),
    },
    {
      path: "return",
      element: (
        <PermissionRoute rule={inventoryReturnRule}>
          <ReturnPage />
        </PermissionRoute>
      ),
    },
  ],
}
