import { Outlet, useLocation } from "react-router-dom"
import { EmployeesTopNav } from "./components/EmployeesTopNav"
import { layoutConfig } from "@/config/layout"

export const EmployeesLayout = () => {
  const { pathname } = useLocation()
  const contentClass = pathname.startsWith("/employees/worker/")
    ? layoutConfig.wide
    : layoutConfig.content

  return (
    <>
      <EmployeesTopNav />
      <main className={`${contentClass} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
