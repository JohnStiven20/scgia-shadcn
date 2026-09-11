import { Outlet} from "react-router-dom"
import { EmployeesTopNav } from "./components/EmployeesTopNav"
import { layoutConfig } from "@/config/layout"

export const EmployeesLayout = () => {
  

  const contentClass = layoutConfig.content

  return (
    <>
      <EmployeesTopNav />
      <main className={`${contentClass} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
