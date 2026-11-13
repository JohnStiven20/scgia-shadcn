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
import { WorkOrderListPage } from "@/features/inventory/workorder/movistar/list/page/WorkOrderListPage"
import { WorkOrderOperatorSelectionPage } from "../../features/inventory/workorders/page/ProviderWorkOrder"
import { WorkOrderDetailPage } from "@/features/inventory/workorder/movistar/detail/page/WorkOrderDetailPage"
import { ProductionPage } from "@/features/inventory/production/page/ProductionPage"
import { AssignedMaterialPage } from "@/features/inventory/assigned-material/page/AssignedMaterialPage"
import { WorkerAssignedMaterialPage } from "@/features/inventory/assigned-material/worker/page/WorkerAssignedMaterialPage"
import { OrangeWorkersProduction } from "@/features/inventory/production/provider/orange/worker/OrangeWorkersProduction"
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
const inventoryProductionRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.PRODUCTION_VIEW
)
const inventoryAssignedMaterialRule = anyInventoryPermission(
  INVENTORY_PERMISSIONS.ASSIGNED_MATERIAL_VIEW
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
      element: <WorkOrderListPage />,
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
      path: "production",
      element: (
        <PermissionRoute rule={inventoryProductionRule}>
          <ProductionPage />
        </PermissionRoute>
      ),
    },
    {
      path: "assigned-material",
      element: (
        <PermissionRoute rule={inventoryAssignedMaterialRule}>
          <AssignedMaterialPage />
        </PermissionRoute>
      ),
    },
    {
      path: "assigned-material/workers/:workerId",
      element: (
        <PermissionRoute rule={inventoryAssignedMaterialRule}>
          <WorkerAssignedMaterialPage />
        </PermissionRoute>
      ),
    },
    {
      path: "production/orange/workers/:workerId",
      element: (
        <PermissionRoute rule={inventoryProductionRule}>
          <OrangeWorkersProduction />
        </PermissionRoute>
      ),
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
