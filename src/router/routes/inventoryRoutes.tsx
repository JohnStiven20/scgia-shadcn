import type { RouteObject } from "react-router-dom"
import { InventoryLayout } from "@/features/inventory/layout/InventoryLayout"
import { TraceabilityPage } from "@/features/inventory/traceability/page/TraceabilityPage"
import { ModelsPage } from "@/features/inventory/models/page/ModesPage"
import { EntryPage } from "@/features/inventory/entry/page/EntryPage"
import { OutPage } from "@/features/inventory/out/page/OutPage"
import { AssignmentPage } from "@/features/inventory/assignment/page/AssignmentPage"
import { ReturnPage } from "@/features/inventory/return/page/ReturnPage"
import { ProductsPage } from "@/features/inventory/products/page/ProductsPage"
import { SpecificModelItemsPage } from "@/features/inventory/products/page/SpecificModelItemsPage"

export const inventoryRoutes: RouteObject = {
  path: "inventory",
  element: <InventoryLayout />,
  children: [
    { index: true, element: <TraceabilityPage /> },
    { path: "models", element: <ModelsPage /> },
    { path: "products", element: <ProductsPage /> },
    { path: "products/:modelId", element: <SpecificModelItemsPage /> },
    { path: "entry", element: <EntryPage /> },
    { path: "out", element: <OutPage /> },
    { path: "assignment", element: <AssignmentPage /> },
    { path: "return", element: <ReturnPage /> },
  ],
}
