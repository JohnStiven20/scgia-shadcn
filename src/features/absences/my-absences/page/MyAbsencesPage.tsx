import { useMemo, useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { CalendarDays } from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useGetAbsenceRequestsByWorkerIdQuery } from "@/features/absences/api/absenceRequestApi"
import type { AbsenceRequestResponse } from "@/features/interface/absence-request/response/absence-request-response"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const columnHelper = createColumnHelper<
  DataTableFeatures,
  AbsenceRequestResponse
>()

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
}

const statusClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-600",
  PENDIENTE: "border-amber-200 bg-amber-50 text-amber-700",
  APROBADA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RECHAZADA: "border-red-200 bg-red-50 text-red-700",
  CANCELADA: "border-slate-200 bg-slate-50 text-slate-600",
}

function parseDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value?: string | null) {
  const date = parseDate(value)
  return date ? dateFormatter.format(date) : "-"
}

function formatDateTime(value?: string | null) {
  const date = parseDate(value)
  return date ? dateTimeFormatter.format(date) : "-"
}

function getAbsenceDays(request: AbsenceRequestResponse) {
  const start = parseDate(request.startDate)
  const end = parseDate(request.endDate)

  if (!start || !end) return null

  const startDay = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  )
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  const days = Math.floor((endDay - startDay) / 86_400_000) + 1

  return days > 0 ? days : null
}

function AbsenceTypeCell({ request }: { request: AbsenceRequestResponse }) {
  return (
    <div className="flex min-w-44 items-center gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
        style={
          request.calendarColor
            ? {
                backgroundColor: `${request.calendarColor}20`,
                borderColor: `${request.calendarColor}55`,
                color: request.calendarColor,
              }
            : undefined
        }
      >
        <CalendarDays className="size-4" />
      </span>
      <span className="grid min-w-0 gap-0.5">
        <strong className="truncate font-medium">
          {request.absenceTypeName ?? request.name ?? "Ausencia"}
        </strong>
        <span className="truncate text-xs text-muted-foreground">
          {request.description ?? "Sin descripción"}
        </span>
      </span>
    </div>
  )
}

function PeriodCell({ request }: { request: AbsenceRequestResponse }) {
  return (
    <div className="grid min-w-44 gap-0.5">
      <strong className="font-medium">
        {formatDate(request.startDate)} - {formatDate(request.endDate)}
      </strong>
      <span className="text-xs text-muted-foreground">
        {request.startDate && request.endDate
          ? `${parseDate(request.startDate)?.toLocaleDateString("es-ES", {
              weekday: "short",
            })} - ${parseDate(request.endDate)?.toLocaleDateString("es-ES", {
              weekday: "short",
            })}`
          : "-"}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalizedStatus = status?.toUpperCase() ?? ""

  return (
    <Badge
      variant="outline"
      className={statusClasses[normalizedStatus] ?? "text-muted-foreground"}
    >
      {statusLabels[normalizedStatus] ?? status ?? "Sin estado"}
    </Badge>
  )
}

const absenceColumns = columnHelper.columns([
  columnHelper.accessor(
    (request) => request.absenceTypeName ?? request.name ?? "",
    {
      id: "absenceType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo de ausencia" />
      ),
      cell: ({ row }) => <AbsenceTypeCell request={row.original} />,
      size: 250,
      minSize: 210,
    }
  ),
  columnHelper.display({
    id: "period",
    header: "Periodo",
    cell: ({ row }) => <PeriodCell request={row.original} />,
    size: 245,
    minSize: 210,
    enableSorting: false,
  }),
  columnHelper.display({
    id: "days",
    header: "Días",
    cell: ({ row }) => {
      const days = getAbsenceDays(row.original)
      return days ? `${days} ${days === 1 ? "día" : "días"}` : "-"
    },
    size: 100,
    minSize: 90,
    enableSorting: false,
  }),
  columnHelper.accessor((request) => request.status ?? "", {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    size: 145,
    minSize: 125,
  }),
  columnHelper.accessor(
    (request) => request.requestedAt ?? request.createdAt ?? "",
    {
      id: "requestedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Solicitada el" />
      ),
      cell: ({ row }) =>
        formatDateTime(row.original.requestedAt ?? row.original.createdAt),
      size: 175,
      minSize: 155,
    }
  ),
  columnHelper.accessor((request) => request.observation ?? "", {
    id: "observation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observación" />
    ),
    cell: ({ row }) => row.original.observation || "-",
    size: 220,
    minSize: 180,
  }),
])

export function MyAbsencesPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const {
    data: absenceRequestsPage,
    isLoading,
    isFetching,
    isError,
  } = useGetAbsenceRequestsByWorkerIdQuery({
    page,
    size: pageSize,
    sort: ["startDate,desc"],
  })

  const currentRows = absenceRequestsPage?.content ?? []
  const totalPages = Math.max(1, absenceRequestsPage?.totalPages ?? 1)
  const currentPage = Math.min(
    (absenceRequestsPage?.page ?? page) + 1,
    totalPages
  )
  const columns = useMemo(() => absenceColumns, [])

  return (
    <section className="flex flex-col gap-6" aria-label="Mis ausencias">
      <InventoryPageHeader
        title="Mis ausencias"
        description="Consulta y gestiona todas tus solicitudes de ausencia."
      />

      <Card>
        <CardContent className="p-3 sm:p-5">
          <p className="sr-only" role="status" aria-live="polite">
            {isFetching ? "Actualizando ausencias" : "Ausencias actualizadas"}
          </p>
          <DataTable
            data={currentRows}
            columns={columns}
            getRowId={(request) => String(request.id)}
            isLoading={isLoading}
            ariaLabel="Solicitudes de ausencia"
            emptyMessage={
              isError
                ? "No se pudieron cargar tus ausencias."
                : "Todavía no tienes solicitudes de ausencia."
            }
            serverPagination={{
              page: currentPage,
              pageSize,
              totalPages,
              totalElements: absenceRequestsPage?.totalElements ?? 0,
              onPageChange: (nextPage) => setPage(nextPage - 1),
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              onPageSizeChange: (nextPageSize) => {
                setPageSize(nextPageSize)
                setPage(0)
              },
            }}
          />
        </CardContent>
      </Card>
    </section>
  )
}
