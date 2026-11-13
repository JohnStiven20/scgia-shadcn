

import { useNavigate, useLocation } from "react-router-dom"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useGetAssignableWorkersQuery } from "@/features/inventory/assignment/api/assignmentApi"
import { useGetMovistarWorkOrderTaskTypesQuery } from "../api/workOrderListApi"
import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"
import { WorkOrderFilters } from "../components/WorkOrderFilters"
import { WorkOrderTable } from "../components/WorkOrderTable"
import { useWorkOrderFilters } from "../hooks/useWorkOrderFilters"

export function WorkOrderListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const provider = (location.state as { provider?: ProviderInventory } | null)?.provider
  const workOrders = useWorkOrderFilters(provider?.id)
  const { data: workers = [], isLoading: isLoadingWorkers } = useGetAssignableWorkersQuery()
  const { data: taskTypes = [], isLoading: isLoadingTaskTypes } = useGetMovistarWorkOrderTaskTypesQuery()

  const visibleRows = workOrders.rows.filter((row) => {
    const search = workOrders.filters.search.trim().toLowerCase()
    const phone = workOrders.filters.phone.trim().toLowerCase()
    const matchesSearch = !search || [row.externalOrderNumber, row.taskType, row.workerName, row.surname].some((value) => value?.toLowerCase().includes(search))
    const matchesPhone = !phone || row.fixedPhoneNumber?.toLowerCase().includes(phone)
    return matchesSearch && matchesPhone
  }).filter((row) => workOrders.filters.status === "ALL" || row.status === workOrders.filters.status)

  return (
    <section className="flex flex-col gap-6" aria-label="Órdenes de trabajo">
      <InventoryPageHeader
        title={provider ? `Órdenes de trabajo · ${provider.name}` : "Órdenes de trabajo"}
        description="Consulta y gestiona las órdenes registradas en el sistema."
        action={<Button type="button" onClick={() => navigate("/inventory/work-orders/new")}><Plus /> Nueva orden</Button>}
      />
      <div className="grid grid-cols-2 gap-2 rounded-xl border bg-card p-3 shadow-sm md:grid-cols-5">
        {[
          ["Total", workOrders.totalElements, "bg-slate-50 text-slate-900"],
          ["En proceso", workOrders.rows.filter((row) => row.status === "PROGRESSING").length, "bg-blue-50 text-blue-700"],
          ["Finalizadas", workOrders.rows.filter((row) => row.status === "FINISHED").length, "bg-emerald-50 text-emerald-700"],
          ["Bloqueadas", workOrders.rows.filter((row) => row.status === "BLOCKED").length, "bg-amber-50 text-amber-700"],
          ["Mostradas", visibleRows.length, "bg-violet-50 text-violet-700"],
        ].map(([label, value, color]) => <div key={String(label)} className={`flex flex-col items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-center ${color} first:col-span-2 md:first:col-span-1`}><span className="text-sm font-medium opacity-80">{label}</span><strong className="text-2xl">{value}</strong></div>)}
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <WorkOrderFilters
          values={workOrders.filters}
          workers={workers}
          taskTypes={taskTypes}
          isLoadingWorkers={isLoadingWorkers}
          isLoadingTaskTypes={isLoadingTaskTypes}
          onApply={workOrders.applyFilters}
          onReset={workOrders.resetFilters}
        />
      </div>
        <WorkOrderTable
          rows={visibleRows}
          isLoading={workOrders.query.isLoading || workOrders.query.isFetching}
          isError={workOrders.query.isError}
          page={workOrders.page}
          pageSize={workOrders.pageSize}
          totalPages={workOrders.totalPages}
          totalElements={workOrders.totalElements}
          onPageChange={workOrders.setPage}
          onPageSizeChange={workOrders.setPageSize}
          onRowClick={(row) => navigate(`/inventory/work-orders/${row.id}`, { state: { provider, workOrder: row } })}
          toolbar={null}
        />

    </section>
  )
}
