import { Outlet } from "react-router-dom"
import { EmployeesTopNav } from "./components/EmployeesTopNav"
import { layoutConfig } from "@/config/layout"

export const EmployeesLayout = () => {
  return (
    <>
      <EmployeesTopNav />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
