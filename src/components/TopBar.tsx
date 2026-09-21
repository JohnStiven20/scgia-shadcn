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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "./ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import { useLogout } from "@/features/auth/hooks/useLogout"

function getAccountInitials(username?: string) {
  if (!username) return "U"

  return username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

export const TopBar = ({ children }: { children?: ReactNode }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { currentAccount } = useAuthAccess()
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-40 flex h-14 min-w-0 flex-nowrap items-center gap-2 overflow-hidden border-b bg-background px-4">
      <SidebarTrigger className="shrink-0" />
      <div className="h-4 w-px shrink-0 bg-border" />
      <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
        {children}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Avatar size="sm" aria-label={currentAccount?.username ?? "Usuario"}>
          <AvatarFallback>
            {getAccountInitials(currentAccount?.username)}
          </AvatarFallback>
        </Avatar>

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
  )
}
