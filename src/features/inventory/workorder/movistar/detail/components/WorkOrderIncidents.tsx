import { createColumnHelper } from "@tanstack/react-table"
import { AlertTriangle, Search } from "lucide-react"
import { useState } from "react"

import { DataTable, DataTableColumnHeader } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { WorkOrderIncidentResponse } from "@/features/interface/work-orders/movistar/indicents/WorkOrderIncidentResponse"

const columnHelper = createColumnHelper<DataTableFeatures, WorkOrderIncidentResponse>()
const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
const statusConfig: Record<string, { label: string; className: string }> = {
  RESOLVED: { label: "Resuelta", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  FINISHED: { label: "Resuelta", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PROGRESSING: { label: "En revisión", className: "border-blue-200 bg-blue-50 text-blue-700" },
  PENDING: { label: "Pendiente", className: "border-amber-200 bg-amber-50 text-amber-700" },
}
const columns = columnHelper.columns([
  columnHelper.display({ id: "index", header: "#", size: 55, minSize: 45, cell: ({ row }) => row.index + 1 }),
  columnHelper.accessor("id", { header: ({ column }) => <DataTableColumnHeader column={column} title="Incidencia" className="px-0" />, size: 110, minSize: 90 }),
  columnHelper.accessor("description", { header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" className="px-0" />, size: 430, minSize: 260 }),
  columnHelper.accessor("status", { header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" className="px-0" />, size: 150, minSize: 120, cell: ({ row }) => { const status = statusConfig[row.original.status] ?? { label: row.original.status || "Sin estado", className: "border-slate-200 bg-slate-50 text-slate-700" }; return <Badge variant="outline" className={`h-6 px-2.5 text-xs ${status.className}`}>{status.label}</Badge> } }),
  columnHelper.accessor("createdAt", { header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" className="px-0" />, size: 180, minSize: 160, cell: ({ row }) => { const date = new Date(row.original.createdAt); return Number.isNaN(date.getTime()) ? row.original.createdAt : dateFormatter.format(date) } }),
])

export function WorkOrderIncidents({ incidents, isLoading }: { incidents: WorkOrderIncidentResponse[]; isLoading: boolean }) {
  const [search, setSearch] = useState("")
  const visibleIncidents = incidents.filter((incident) => [incident.description, incident.status].some((value) => value?.toLowerCase().includes(search.toLowerCase())))

  return <DataTable columns={columns} data={visibleIncidents} getRowId={(row) => String(row.id)} isLoading={isLoading} pageSize={10} pageSizeOptions={[10, 20, 50]} ariaLabel="Incidencias de la orden de trabajo" emptyMessage="No hay incidencias asociadas a esta orden." renderToolbar={() => <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-amber-600" aria-hidden="true" /><span className="font-semibold">Incidencias ({incidents.length})</span><InputGroup className="ml-auto max-w-sm"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput value={search} placeholder="Buscar por descripción o estado..." onChange={(event) => setSearch(event.target.value)} /></InputGroup></div>} />
}
