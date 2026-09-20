import type { RouteObject } from "react-router-dom"
import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { FleetLayout } from "@/features/fleet/layout/FleetLoyout"
import { VehiclesPage } from "@/features/fleet/vehicles/page/VehiclesPage"
import { VehiclePage } from "@/features/fleet/vehicle/page/VehiclePage"

const fleetVehicleViewRule = {
  mode: "any" as const,
  permissions: ["fleet.vehicle.view"],
}

export const fleetRoutes: RouteObject = {
  path: "fleet",
  element: (
    <PermissionRoute rule={fleetVehicleViewRule}>
      <FleetLayout />
    </PermissionRoute>
  ),
  children: [
    { index: true, element: <VehiclesPage /> },
    { path: "vehicle/:id", element: <VehiclePage /> },
  ],
}
