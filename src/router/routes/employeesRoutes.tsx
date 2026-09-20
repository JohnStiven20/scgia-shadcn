import type { RouteObject } from "react-router-dom"
import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { EmployeesLayout } from "@/features/employees/layout/EmployeesLayout"
import { EmployeesPage } from "@/features/employees/layout/page/EmployeesPage"
import { WorkerPage } from "@/features/employees/worker/page/WorkerPage"

const employeeViewRule = {
  mode: "any" as const,
  permissions: ["employee.view"],
}

export const employeesRoutes: RouteObject = {
  path: "employees",
  element: (
    <PermissionRoute rule={employeeViewRule}>
      <EmployeesLayout />
    </PermissionRoute>
  ),
  children: [
    { index: true, element: <EmployeesPage /> },
    { path: "worker/:id", element: <WorkerPage /> },
  ],
}
