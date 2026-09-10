import type { ReactNode } from "react"
import { SidebarTrigger } from "./ui/sidebar"

export const TopBar = ({ children }: { children?: ReactNode }) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 min-w-0 flex-nowrap items-center gap-2 overflow-hidden border-b bg-background px-4">
      <SidebarTrigger className="shrink-0" />
      <div className="h-4 w-px shrink-0 bg-border" />
      <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
        {children}
      </div>
    </header>
  )
}
