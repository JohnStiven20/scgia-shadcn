import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ForbiddenPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-4">
      <Card className="w-[min(100%,34rem)] border-border/80 py-8 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-14 place-items-center rounded-xl border bg-red-50 text-red-600">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Acceso no autorizado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu cuenta no tiene permisos para acceder a esta seccion.
            </p>
          </div>
          <Link className={buttonVariants()} to="/">
            Volver al inicio
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
