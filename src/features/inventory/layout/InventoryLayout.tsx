import { Outlet } from "react-router-dom"
import { layoutConfig } from "@/config/layout"
import { InventoryTopNav } from "./InventoryTopNav"

export const InventoryLayout = () => {
  return (
    <>
      <InventoryTopNav />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
