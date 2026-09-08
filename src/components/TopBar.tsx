import type { ReactNode } from "react"
import { SidebarTrigger } from "./ui/sidebar"


export const TopBar = ({ children}: { children?: ReactNode }) => {
    return (
        <header className="sticky top-0 z-40 flex h-14 min-w-0 flex-nowrap items-center gap-2 overflow-x-auto border-b bg-background px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            {children}
        </header>
    )
}