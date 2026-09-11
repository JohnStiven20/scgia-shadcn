import type { RouteObject } from "react-router-dom"
import { EmployeesLayout } from "@/features/employees/layout/EmployeesLayout"
import { EmployeesPage } from "@/features/employees/layout/page/EmployeesPage"
import { WorkerPage } from "@/features/employees/worker/page/WorkerPage"



export const employeesRoutes: RouteObject = {
  path: "employees",
  element: <EmployeesLayout />,
  children: [
    { index: true, element: <EmployeesPage /> },
    { path: "worker/:id", element: <WorkerPage /> },
  ],
}
