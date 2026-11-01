import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"

type ProductionHeaderProps = {
  provider?: ProviderInventory
  filters: ReactNode
}

export function ProductionHeader({ provider, filters }: ProductionHeaderProps) {
  const navigate = useNavigate()
  const providerName = provider?.name ?? "Proveedor"

  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Migas de pan">
        <button
          type="button"
          className="transition-colors hover:text-foreground"
          onClick={() => navigate("/inventory/work-orders/new")}
        >
          Proveedores
        </button>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span>{providerName}</span>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="font-semibold text-foreground">Producción</span>
      </nav>

      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Producción {providerName}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Vista de rendimiento, tareas e importe generado para el periodo seleccionado.
          </p>
        </section>
        {filters}
      </header>
    </>
  )
}
