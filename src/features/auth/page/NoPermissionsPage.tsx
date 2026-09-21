import { LogOut, RotateCw, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { Navigate } from "react-router-dom"

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
import { Card, CardContent } from "@/components/ui/card"
import { useLazyMeQuery } from "../api/authApi"
import { useAuthAccess } from "../hooks/useAuthAccess"
import { useLogout } from "../hooks/useLogout"
import { getFirstAccessibleRoute } from "../utils/authorized-navigation"

export function NoPermissionsPage() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const logout = useLogout()
  const { permissions } = useAuthAccess()
  const [retryPermissions, { isFetching }] = useLazyMeQuery()
  const firstAccessibleRoute = getFirstAccessibleRoute(permissions)

  if (firstAccessibleRoute) {
    return <Navigate to={firstAccessibleRoute} replace />
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background p-4">
      <Card className="w-[min(100%,34rem)] border-border/80 py-8 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-14 place-items-center rounded-xl border bg-muted text-muted-foreground">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Cuenta sin permisos
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tu sesión está activa, pero tu cuenta todavía no tiene permisos
              asignados. Contacta con un administrador para solicitar acceso.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => retryPermissions()}
              disabled={isFetching}
            >
              <RotateCw className={isFetching ? "animate-spin" : undefined} />
              Volver a intentar
            </Button>
            <AlertDialog
              open={logoutDialogOpen}
              onOpenChange={setLogoutDialogOpen}
            >
              <Button type="button" onClick={() => setLogoutDialogOpen(true)}>
                <LogOut />
                Cerrar sesión
              </Button>
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
        </CardContent>
      </Card>
    </main>
  )
}
