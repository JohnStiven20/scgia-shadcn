import { Outlet } from "react-router-dom"
import { FleetTopBar } from "./top-Bar/FleetTopBar"
import { layoutConfig } from "@/config/layout"




export const FleetLayout = () => {
  return (
    <>
      <FleetTopBar />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
