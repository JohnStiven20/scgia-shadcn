import { useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { useNavigate } from "react-router-dom"

import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"
import { useGetProviderQuery } from "@/features/inventory/api/provider.inventory"
import { ProductionEmptyState } from "../components/ProductionEmptyState"
import { ProductionFilters } from "../components/ProductionFilters"
import { ProductionHeader } from "../components/ProductionHeader"
import { OrangeProductionDashboard } from "../provider/orange/OrangeProductionDashboard"

function getInitialDateRange() {
  const endDate = new Date()

  return {
    startDate: subDays(endDate, 7),
    endDate,
  }
}

function isOrange(provider?: ProviderInventory) {
  return provider?.name.trim().toLowerCase() === "orange"
}

export function ProductionPage() {
  const navigate = useNavigate()
  const { data: providers = [], isLoading, isError } = useGetProviderQuery()
  const [providerId, setProviderId] = useState("")
  const [dateRange, setDateRange] = useState(getInitialDateRange)
  const [refreshToken, setRefreshToken] = useState(0)

  const activeProviders = useMemo(() => providers.filter((provider) => provider.active), [providers])
  const orangeProvider = activeProviders.find(isOrange)
  const resolvedProviderId =
    providerId && activeProviders.some((provider) => String(provider.id) === providerId)
      ? providerId
      : orangeProvider
        ? String(orangeProvider.id)
        : activeProviders[0]
          ? String(activeProviders[0].id)
          : ""
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === resolvedProviderId
  )

  const startDate = format(dateRange.startDate, "yyyy-MM-dd")
  const endDate = format(dateRange.endDate, "yyyy-MM-dd")

  return (
    <section className="flex flex-col gap-5" aria-label="Producción">
      <ProductionHeader
        provider={selectedProvider}
        filters={
          <ProductionFilters
            providers={activeProviders}
            providerId={resolvedProviderId}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            isLoading={isLoading}
            isRefreshing={false}
            onProviderChange={setProviderId}
            onStartDateChange={(date) =>
              setDateRange((current) => ({ ...current, startDate: date }))
            }
            onEndDateChange={(date) =>
              setDateRange((current) => ({ ...current, endDate: date }))
            }
            onRefresh={() => setRefreshToken((value) => value + 1)}
          />
        }
      />

      {isError ? (
        <ProductionEmptyState
          title="No se pudieron cargar los proveedores"
          description="Comprueba la conexión con la API e inténtalo de nuevo."
          isError
        />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Cargando producción">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border bg-muted" />)}
        </div>
      ) : !selectedProvider ? (
        <ProductionEmptyState
          title="No hay proveedores activos"
          description="Activa un proveedor para consultar su producción."
        />
      ) : isOrange(selectedProvider) ? (
        <OrangeProductionDashboard
          providerId={selectedProvider.id}
          startDate={startDate}
          endDate={endDate}
          refreshToken={refreshToken}
          onWorkerClick={(providerId, worker) =>
            navigate(`/inventory/production/orange/workers/${worker.id}`, {
              state: {
                providerId,
                providerName: selectedProvider.name,
                workerId: worker.id,
                workerName: [worker.firstName, worker.surname]
                  .filter(Boolean)
                  .join(" "),
              },
            })
          }
        />
      ) : (
        <ProductionEmptyState
          title={`${selectedProvider.name}: proveedor en desarrollo`}
          description="La vista de producción para este proveedor todavía no está disponible. Orange es el proveedor soportado actualmente."
        />
      )}
    </section>
  )
}
