

import { Outlet } from "react-router-dom"
import { layoutConfig } from "@/config/layout"
import { EmployeesTopNav } from "@/features/employees/layout/components/EmployeesTopNav"

export const InventoryLayout = () => {
  return (
    <>
      <EmployeesTopNav />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
