import { ArrowRight, Building2, LoaderCircle, TriangleAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useGetProviderQuery } from "@/features/inventory/api/provider.inventory.ts"

const providerDetails: Record<string, { description: string; className: string }> = {
  movistar: { description: "Gestión de instalaciones y materiales de Movistar.", className: "bg-[#e8f3ff] text-[#0789ef]" },
  orange: { description: "Gestión de instalaciones y materiales de Orange.", className: "bg-[#ff7100] text-white" },
  vodafone: { description: "Gestión de instalaciones y materiales de Vodafone.", className: "bg-[#e60000] text-white" },
  masmovil: { description: "Gestión de instalaciones y materiales de Masmovil.", className: "bg-[#ffd900] text-[#171717]" },
}

function getProviderDetails(name: string) {
  return providerDetails[name.trim().toLowerCase()] ?? {
    description: "Gestión de instalaciones y materiales del proveedor.",
    className: "bg-primary/10 text-primary",
  }
}

function ProviderLogo({ name }: { name: string }) {
  const details = getProviderDetails(name)
  const provider = name.trim().toLowerCase()

  return (
    <span className={cn("grid size-16 shrink-0 place-items-center rounded-xl shadow-sm", details.className)} aria-hidden="true">
      {provider === "movistar" ? (
        <svg viewBox="0 0 48 48" className="size-11" fill="none">
          <path d="M7 28c3.5 0 4-14 9-14 4.5 0 4 14 8.5 14S28 14 33 14c5 0 4.5 14 8 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        </svg>
      ) : provider === "vodafone" ? (
        <svg viewBox="0 0 48 48" className="size-10" fill="none">
          <circle cx="24" cy="24" r="17" fill="currentColor" />
          <path d="M18 18c9-4 16 2 13 9-2 5-8 7-12 3-4-4-1-9 5-10 3 0 5 1 7 3" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      ) : provider === "orange" ? (
        <span className="text-xl font-bold lowercase tracking-tight">orange</span>
      ) : provider === "masmovil" ? (
        <span className="text-center text-[11px] font-black leading-3 tracking-tight">mas<br />móvil</span>
      ) : (
        <Building2 className="size-8" />
      )}
    </span>
  )
}

export function WorkOrderOperatorSelectionPage() {
  const navigate = useNavigate()
  const { data: providers = [], isLoading, isError } = useGetProviderQuery()
  const activeProviders = providers.filter((provider) => provider.active)


  return (
    <section className="flex flex-col gap-6 py-2 sm:py-4" aria-labelledby="work-order-title">
      <header className="max-w-3xl">
        <h1 id="work-order-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Selecciona un proveedor
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-6 text-muted-foreground">
          Elige el proveedor para continuar con la gestión de la orden de trabajo.
          <br className="hidden sm:block" /> Los proveedores se cargan automáticamente desde la base de datos.
        </p>
      </header>

      {isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>No se pudieron cargar los proveedores</AlertTitle>
          <AlertDescription>
            Revisa la conexión con el servicio e inténtalo de nuevo.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border bg-card">
          <LoaderCircle className="size-6 animate-spin text-primary" aria-label="Cargando proveedores" />
        </div>
      ) : activeProviders.length === 0 ? (
        <Alert>
          <TriangleAlert />
          <AlertTitle>No hay proveedores activos</AlertTitle>
          <AlertDescription>
            Activa un proveedor para poder crear órdenes de trabajo.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid max-w-6xl gap-4 md:grid-cols-2">
          {activeProviders.map((provider) => (
            <Card
              key={provider.id}
              className="group cursor-pointer rounded-xl border border-border/70 py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate("/inventory/work-orders", {
                  state: { provider },
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  event.currentTarget.click()
                }
              }}
              aria-label={`Seleccionar proveedor ${provider.name}`}
            >
              <CardContent className="flex min-h-28 items-center gap-4 p-4 sm:p-5">
                <ProviderLogo name={provider.name} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">{provider.name}</h2>
                  <p className="mt-1 max-w-xs text-sm leading-5 text-muted-foreground">{getProviderDetails(provider.name).description}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-900 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <ArrowRight className="size-5" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          )) }
        </div>
      )}
    </section>
  )
}
