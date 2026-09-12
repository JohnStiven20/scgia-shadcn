import { Outlet } from "react-router-dom"

import { layoutConfig } from "@/config/layout"

import { AdminTopNav } from "./components/AdminTopNav"

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopNav />
      <main className={`${layoutConfig.content} min-w-0`}>
        <Outlet />
      </main>
    </div>
  )
}

