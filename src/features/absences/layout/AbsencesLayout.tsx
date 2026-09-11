import { Outlet } from "react-router-dom"
import { layoutConfig } from "@/config/layout"
import { AbsencesTopBar } from "./AbsencesTopBar"

export function AbsencesLayout() {
  return (
    <>
      <AbsencesTopBar />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </>
  )
}
