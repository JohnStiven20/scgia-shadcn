import { useState, type ReactNode } from "react"
import { LogOut } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { SidebarTrigger, useSidebar } from "./ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { cn } from "cn"

export const TopBar = ({ children }: { children?: ReactNode }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { isMobile, state } = useSidebar()
  const logout = useLogout()

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-40 flex h-14 min-w-0 flex-nowrap items-center gap-2 overflow-hidden border-b bg-background px-4 transition-[left] duration-200 ease-linear md:left-(--sidebar-width)",
          !isMobile &&
            state === "collapsed" &&
            "md:left-[calc(var(--sidebar-width-icon)+1rem)]"
        )}
      >
        <SidebarTrigger className="shrink-0" />
        <div className="h-4 w-px shrink-0 bg-border" />
        <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          {children}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AlertDialog
            open={logoutDialogOpen}
            onOpenChange={setLogoutDialogOpen}
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Cerrar sesión"
                    onClick={() => setLogoutDialogOpen(true)}
                  />
                }
              >
                <LogOut />
              </TooltipTrigger>
              <TooltipContent>Cerrar sesión</TooltipContent>
            </Tooltip>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Seguro que quieres cerrar la sesión?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={logout}>
                  <LogOut />
                  Cerrar sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>
      <div aria-hidden="true" className="h-14 shrink-0" />
    </>
  )
}
