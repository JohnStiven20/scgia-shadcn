import { createBrowserRouter, Navigate } from "react-router-dom"
import { EmployeesLayout } from "@/features/employees/layout/EmployeesLayout"
import { AppLayout } from "@/layout/Layout"
import { EmployeesPage } from "@/features/employees/layout/page/EmployeesPage"
import { WorkerPage } from "@/features/employees/worker/page/WorkerPage"
import { TraceabilityPage } from "@/features/inventory/traceability/page/TraceabilityPage"
import { InventoryLayout } from "@/features/inventory/layout/InventoryLayout"
import { ModelsPage } from "@/features/inventory/models/page/ModesPage"
import { EntryPage } from "@/features/inventory/entry/page/EntryPage"
import { FleetLayout } from "@/features/fleet/layout/FleetLoyout"
import { VehiclesPage } from "@/features/fleet/vehicles/page/VehiclesPage"
import { VehiclePage } from "@/features/fleet/vehicle/page/VehiclePage"

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/employees" replace />,
            },
            {
                path: "employees",
                element: <EmployeesLayout />,
                children: [
                    {
                        index: true,
                        element: <EmployeesPage />,
                    },
                    {
                        path: "worker/:id",
                        element: <WorkerPage />,
                    },
                ],
            },
            {
                path: "inventory",
                element: <InventoryLayout />,
                children: [
                    {
                        index: true,
                        element: <TraceabilityPage />,
                    },
                    {
                        path: "models",
                        element: <ModelsPage/>
                    },
                    {
                        path: "entry",
                        element: <EntryPage/>
                    }
                ]
            },
            {
                path: "fleet",
                element: <FleetLayout />,
                children: [
                    {
                        index: true,
                        element: <VehiclesPage />,
                    },
                    {
                        path:"vehicle/:id",
                        element: <VehiclePage/>
                    }
                ]
            },
            {
                path: "*",
                element: <Navigate to="/employees" replace />,
            },

        ],
    }
])
