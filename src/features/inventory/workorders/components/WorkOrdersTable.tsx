import { createColumnHelper } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { AlertTriangle, Box } from "lucide-react"

// import {
//   DataTable,
//   DataTableColumnHeader,
// } from "src/components/data-table/data-table"
// import type { DataTableFeatures } from "src/components/data-table/data-table-features"
// import type { WorkOrderListResponse } from "src/features/interface/work-orders/types"
import { WORK_ORDER_PAGE_SIZE_OPTIONS } from "../hooks/useWorkOrdersPage"
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import type { WorkOrderListResponse } from "@/features/interface/work-orders/types"
import { DataTable, DataTableColumnHeader } from "@/components/data-table/data-table"

const columnHelper = createColumnHelper<DataTableFeatures, WorkOrderListResponse>()

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDateTime(value: string | null) {
  if (!value) return "-"

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

const workOrderColumns = columnHelper.columns([
  columnHelper.accessor("externalOrderNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="N externo"
        className="px-0"
      />
    ),
    size: 180,
    minSize: 150,
    enableSorting: false,
  }),
  columnHelper.accessor("fixedPhoneNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="N fijo cliente"
        className="px-0"
      />
    ),
    size: 165,
    minSize: 145,
    enableSorting: false,
  }),
  // Columna de dirección ocultada temporalmente.
  // columnHelper.accessor("address", {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       column={column}
  //       title="Direccion"
  //       className="px-0"
  //     />
  //   ),
  //   size: 380,
  //   minSize: 280,
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <span className="block max-w-[32rem] truncate">
  //       {row.original.address}
  //     </span>
  //   ),
  // }),
  columnHelper.accessor("workerName", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trabajador"
        className="px-0"
      />
    ),
    size: 220,
    minSize: 170,
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" className="px-0" />
    ),
    size: 165,
    minSize: 135,
    enableSorting: false,
    cell: ({ row }) => <WorkOrderStatusBadge status={row.original.status} />,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Fecha creacion"
        className="px-0"
      />
    ),
    size: 220,
    minSize: 170,
    enableSorting: false,
    cell: ({ row }) => (
      <time dateTime={row.original.createdAt}>
        {formatDateTime(row.original.createdAt)}
      </time>
    ),
  }),
  columnHelper.accessor("productCount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Productos"
        className="px-0"
      />
    ),
    size: 130,
    minSize: 100,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600">
        <Box className="size-4" />
        {row.original.productCount}
      </span>
    ),
  }),
  columnHelper.accessor("incidentCount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Incidencias"
        className="px-0"
      />
    ),
    size: 140,
    minSize: 105,
    enableSorting: false,
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold ${
          row.original.incidentCount > 0 ? "text-red-600" : "text-amber-500"
        }`}
      >
        <AlertTriangle className="size-4" />
        {row.original.incidentCount}
      </span>
    ),
  }),
])

type WorkOrdersTableProps = {
  rows: WorkOrderListResponse[]
  isLoading: boolean
  isError: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRowClick?: (row: WorkOrderListResponse) => void
  toolbar: ReactNode
}

export function WorkOrdersTable({
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
}: WorkOrdersTableProps) {
  return (
    <DataTable
      columns={workOrderColumns}
      data={rows}
      getRowId={(row) => String(row.id)}
      isLoading={isLoading}
      pageSize={pageSize}
      pageSizeOptions={WORK_ORDER_PAGE_SIZE_OPTIONS}
      ariaLabel="Listado de ordenes de trabajo"
      emptyMessage={
        isError
          ? "No se pudieron cargar las ordenes de trabajo."
          : "No hay ordenes que coincidan con los filtros."
      }
      onRowClick={onRowClick}
      renderToolbar={() => toolbar}
      serverPagination={{
        page,
        pageSize,
        totalPages,
        totalElements,
        onPageChange,
        pageSizeOptions: WORK_ORDER_PAGE_SIZE_OPTIONS,
        onPageSizeChange,
      }}
    />
  )
}
