import type { RouteObject } from "react-router-dom"
import { FleetLayout } from "@/features/fleet/layout/FleetLoyout"
import { VehiclesPage } from "@/features/fleet/vehicles/page/VehiclesPage"
import { VehiclePage } from "@/features/fleet/vehicle/page/VehiclePage"


export const fleetRoutes: RouteObject = {
  path: "fleet",
  element: <FleetLayout />,
  children: [
    { index: true, element: <VehiclesPage /> },
    { path: "vehicle/:id", element: <VehiclePage /> },
  ],
}
