import { Plus } from "lucide-react"

import { WorkOrdersFilters } from "../components/WorkOrdersFilters"
import { WorkOrdersTable } from "../components/WorkOrdersTable"
import { useWorkOrdersPage } from "../hooks/useWorkOrdersPage"
import { useGetAssignableWorkersQuery } from "../../assignment/api/assignmentApi"
import { InventoryPageHeader } from "../../components"
import { Button } from "@/components/ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"

export const WorkorderPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const provider = (location.state as { provider?: ProviderInventory } | null)   ?.provider
  const workOrdersPage = useWorkOrdersPage({ provider })
  const { data: workers = [], isLoading: isLoadingWorkers } =  useGetAssignableWorkersQuery()

  return (
    <section className="flex flex-col gap-6" aria-label="Ordenes de trabajo">
      <nav
        className="flex items-center gap-3 text-sm text-muted-foreground"
        aria-label="Migas de pan"
      >
        <button
          type="button"
          className="transition-colors hover:text-foreground"
          onClick={() => navigate("/inventory/work-orders/new")}
        >
          Órdenes de trabajo
        </button>
        {provider ? (
          <>
            <span aria-hidden="true" className="text-lg">
              ›
            </span>
            <span className="font-semibold text-foreground">
              {provider.name}
            </span>
          </>
        ) : null}
      </nav>
      <InventoryPageHeader
        title={
          provider
            ? `Órdenes de trabajo · ${provider.name}`
            : "Órdenes de trabajo"
        }
        description={
          provider
            ? "Consulta sus órdenes, estados, productos e incidencias."
            : "Consulta órdenes, estados, productos e incidencias del inventario."
        }
        action={
          <Button
            type="button"
            onClick={() => navigate("/inventory/work-orders/new")}
          >
            <Plus />
            Nueva orden
          </Button>
        }
      />

      <p className="sr-only" role="status" aria-live="polite">
        {workOrdersPage.isFetching
          ? "Actualizando ordenes"
          : "Ordenes actualizadas"}
      </p>

      <WorkOrdersTable
        rows={workOrdersPage.rows}
        isLoading={workOrdersPage.isLoading || workOrdersPage.isFetching}
        isError={workOrdersPage.isError}
        page={workOrdersPage.pagination.page}
        pageSize={workOrdersPage.pagination.pageSize}
        totalPages={workOrdersPage.pagination.totalPages}
        totalElements={workOrdersPage.pagination.totalElements}
        onPageChange={workOrdersPage.pagination.setPage}
        onPageSizeChange={workOrdersPage.pagination.setPageSize}
        onRowClick={(row) => navigate(`/inventory/work-orders/${row.id}`)}
        toolbar={
          <WorkOrdersFilters
            values={workOrdersPage.filters.values}
            workers={workers}
            isLoadingWorkers={isLoadingWorkers}
            onApply={workOrdersPage.filters.apply}
            onReset={workOrdersPage.filters.reset}
          />
        }
      />
    </section>
  )
}
