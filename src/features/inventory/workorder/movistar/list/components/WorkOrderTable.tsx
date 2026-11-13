import { createColumnHelper } from "@tanstack/react-table"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import type { MovistarWorkOrderSummaryResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderSummaryResponse"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  MovistarWorkOrderSummaryResponse
>()
const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const statusStyles: Record<string, { label: string; className: string }> = {
  PROGRESSING: {
    label: "En proceso",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  BLOCKED: {
    label: "Bloqueada",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  FINISHED: {
    label: "Finalizada",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PENDING: {
    label: "Pendiente",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "index",
    header: "#",
    size: 60,
    minSize: 50,
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("externalOrderNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Nº orden"
        className="px-0"
      />
    ),
    size: 150,
    minSize: 130,
  }),
  columnHelper.accessor("taskType", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarea" className="px-0" />
    ),
    size: 180,
    minSize: 140,
  }),
  columnHelper.accessor((row) => `${row.workerName} ${row.surname}`.trim(), {
    id: "worker",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trabajador"
        className="px-0"
      />
    ),
    size: 190,
    minSize: 150,
    cell: ({ row }) =>
      row.original.workerName
        ? `${row.original.workerName} ${row.original.surname}`
        : "Sin asignar",
  }),
  columnHelper.accessor("fixedPhoneNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Cliente / teléfono"
        className="px-0"
      />
    ),
    size: 190,
    minSize: 150,
    cell: ({ row }) => row.original.fixedPhoneNumber || "—",
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" className="px-0" />
    ),
    size: 145,
    minSize: 125,
    cell: ({ row }) => {
      const status = statusStyles[row.original.status] ?? {
        label: "Sin estado",
        className: "border-slate-200 bg-slate-50 text-slate-700",
      }
      return (
        <Badge
          variant="outline"
          className={`h-6 px-2.5 text-xs ${status.className}`}
        >
          {status.label}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" className="px-0" />
    ),
    size: 180,
    minSize: 160,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <time dateTime={row.original.createdAt}>
          {Number.isNaN(date.getTime())
            ? row.original.createdAt
            : dateFormatter.format(date)}
        </time>
      )
    },
  }),
  columnHelper.accessor("notes", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notas" className="px-0" />
    ),
    size: 180,
    minSize: 160,
    cell: ({ row }) =>
      row.original.notes ? `${row.original.notes}` : "Sin notas",
  }),
])

type WorkOrderTableProps = {
  rows: MovistarWorkOrderSummaryResponse[]
  isLoading: boolean
  isError: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRowClick: (row: MovistarWorkOrderSummaryResponse) => void
  toolbar: React.ReactNode
}

export function WorkOrderTable({
  rows,
  isLoading,
  isError,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  toolbar,
}: WorkOrderTableProps) {
  return <DataTable
    columns={columns}
    data={rows}
    getRowId={(row) => String(row.id)}
    isLoading={isLoading}
    onRowClick={onRowClick}
    ariaLabel="Listado de órdenes de trabajo de Movistar"
    emptyMessage={
      isError
        ? "No se pudieron cargar las órdenes de trabajo."
        : "No hay órdenes que coincidan con los filtros."
    }
    renderToolbar={() => toolbar}
    serverPagination={{
      page: page + 1,
      pageSize,
      totalPages,
      totalElements,
      onPageChange: (nextPage) => onPageChange(nextPage - 1),
      pageSizeOptions: [10, 20, 50],
      onPageSizeChange,
    }}
  />
}
