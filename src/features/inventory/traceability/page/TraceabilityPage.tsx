import { createColumnHelper } from "@tanstack/react-table"
import {
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  ClipboardCheck,
  Package,
  RotateCcw,
  UserRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type {
  InventoryMovementType,
  MovementTransaction,
} from "@/features/interface/traceability/types"
import { InventoryPageHeader } from "../../components"
import {
  TRACEABILITY_PAGE_SIZE_OPTIONS,
  useTraceabilityPage,
} from "../hooks/useTraceabilityPage"

type EventStyle = {
  label: string
  icon: LucideIcon
  badgeClassName: string
  iconClassName: string
}

const eventStyles: Record<InventoryMovementType, EventStyle> = {
  ENTRY: {
    label: "Entrada",
    icon: ArrowDownToLine,
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  ASSIGNMENT: {
    label: "Asignación",
    icon: ClipboardCheck,
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "bg-blue-100 text-blue-700",
  },
  RETURN: {
    label: "Devolución",
    icon: RotateCcw,
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "bg-amber-100 text-amber-700",
  },
  EXIT: {
    label: "Salida",
    icon: ArrowUpFromLine,
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
    iconClassName: "bg-red-100 text-red-700",
  },
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatMovementDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function EventCell({ transaction }: { transaction: MovementTransaction }) {
  const style = eventStyles[transaction.inventoryMovementType]
  const EventIcon = style.icon

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${style.iconClassName}`}
      >
        <EventIcon className="size-4" />
      </span>
      <div className="grid gap-1">
        <Badge variant="outline" className={style.badgeClassName}>
          {style.label}
        </Badge>
        <time
          dateTime={transaction.movementDate}
          className="text-muted-foreground"
        >
          {formatMovementDate(transaction.movementDate)}
        </time>
      </div>
    </div>
  )
}

function AccountBadge({
  label,
  username,
}: {
  label: string
  username: string
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <UserRound className="size-3.5 shrink-0" />
      <span className="truncate">
        <strong>{label}:</strong> {username}
      </span>
    </span>
  )
}

function AccountsCell({ transaction }: { transaction: MovementTransaction }) {
  const responsible = transaction.performedByAccountUsername
  const secondary = transaction.toAccountUsername
    ? { label: "Asignado a", username: transaction.toAccountUsername }
    : transaction.fromAccountUsername
      ? { label: "Origen", username: transaction.fromAccountUsername }
      : null
  const showSecondary = Boolean(responsible && secondary?.username)

  if (!responsible) {
    return <span className="text-muted-foreground">Sin responsable</span>
  }

  return (
    <div className="grid min-w-0 gap-1">
      <AccountBadge label="Responsable" username={responsible} />
      {showSecondary && secondary ? (
        <AccountBadge label={secondary.label} username={secondary.username} />
      ) : null}
    </div>
  )
}

function ContentCell({ transaction }: { transaction: MovementTransaction }) {
  const hasSpecifics =
    transaction.specificItemCount !== null && transaction.specificItemCount > 0
  const hasGenerics =
    transaction.genericQuantity !== null && transaction.genericQuantity > 0

  if (!hasSpecifics && !hasGenerics) {
    return <span className="text-muted-foreground">Sin contenido</span>
  }

  return (
    <div className="flex items-center gap-2">
      {hasSpecifics ? (
        <span className="inline-flex items-center gap-1.5">
          <Archive className="size-4 text-muted-foreground" />
          {transaction.specificItemCount} específicos
        </span>
      ) : null}
      {hasSpecifics && hasGenerics ? (
        <Separator orientation="vertical" className="h-5" />
      ) : null}
      {hasGenerics ? (
        <span className="inline-flex items-center gap-1.5">
          <Package className="size-4 text-muted-foreground" />
          {transaction.genericQuantity} genéricos
        </span>
      ) : null}
    </div>
  )
}

function getTransactionModels(transaction: MovementTransaction) {
  const models = new Map<string, string | null>()

  transaction.detailsMovements?.forEach((resourceGroup) => {
    resourceGroup.models?.forEach((model) => {
      models.set(model.modelName, model.providerName ?? null)
    })
  })

  transaction.modelNames?.forEach((modelName) => {
    if (!models.has(modelName)) models.set(modelName, null)
  })

  return Array.from(models, ([name, provider]) => ({ name, provider }))
}

function ModelsCell({ transaction }: { transaction: MovementTransaction }) {
  const models = getTransactionModels(transaction)

  if (models.length === 0) {
    return <span className="text-muted-foreground">Sin modelos</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        {models.length} {models.length === 1 ? "modelo" : "modelos"}
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Modelos asociados</DropdownMenuLabel>
        {models.map((model) => (
          <DropdownMenuItem key={model.name} className="items-start">
            <Package className="mt-0.5" />
            <span className="grid min-w-0 gap-0.5">
              <strong className="truncate font-medium">{model.name}</strong>
              <span className="truncate text-muted-foreground">
                {model.provider ?? "Proveedor no disponible"}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columnHelper = createColumnHelper<
  DataTableFeatures,
  MovementTransaction
>()

const traceabilityColumns = columnHelper.columns([
  columnHelper.accessor("inventoryMovementType", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Evento" />
    ),
    cell: ({ row }) => <EventCell transaction={row.original} />,
    size: 220,
    minSize: 200,
  }),
  columnHelper.display({
    id: "accounts",
    header: "Responsable / Asignado",
    cell: ({ row }) => <AccountsCell transaction={row.original} />,
    size: 390,
    minSize: 300,
  }),
  columnHelper.accessor("warehouseName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Almacén" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        <Warehouse />
        {row.original.warehouseName ??
          row.original.fromWarehouseName ??
          "Sin almacén"}
      </Badge>
    ),
    size: 220,
    minSize: 180,
  }),
  columnHelper.display({
    id: "content",
    header: "Contenido",
    cell: ({ row }) => <ContentCell transaction={row.original} />,
    size: 260,
    minSize: 210,
  }),
  columnHelper.display({
    id: "models",
    header: "Modelos",
    cell: ({ row }) => <ModelsCell transaction={row.original} />,
    size: 160,
    minSize: 140,
  }),
])

export function TraceabilityPage() {
  const { rows, isLoading, isFetching, isError, pagination } =
    useTraceabilityPage()

  const emptyMessage = isLoading
    ? "Cargando movimientos..."
    : isError
      ? "No se pudo cargar la trazabilidad."
      : "No hay movimientos durante los últimos siete días."

  return (
    <section className="flex flex-col gap-6" aria-label="Trazabilidad">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/inventory" />}>
              Inventario
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Trazabilidad</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <InventoryPageHeader
        title="Trazabilidad"
        description="Auditoría y trazabilidad de movimientos del inventario."
      />

      <p className="sr-only" role="status" aria-live="polite">
        {isFetching ? "Actualizando movimientos" : "Movimientos actualizados"}
      </p>

      <section aria-label="Movimientos de inventario">
        <DataTable
          data={rows}
          columns={traceabilityColumns}
          getRowId={(transaction) => String(transaction.id)}
          serverPagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            onPageChange: pagination.setPage,
            pageSizeOptions: TRACEABILITY_PAGE_SIZE_OPTIONS,
            onPageSizeChange: pagination.setPageSize,
          }}
          ariaLabel="Trazabilidad de movimientos de inventario"
          emptyMessage={emptyMessage}
        />
      </section>
    </section>
  )
}
