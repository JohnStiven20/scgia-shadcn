import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import {
  Archive,
  ChevronDown,
  Funnel,
  Package,
  RotateCcw,
  UserRound,
  Warehouse,
} from "lucide-react"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { DatePicker } from "@/components/general"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { MovementTransaction } from "@/features/interface/traceability/types"
import { InventoryPageHeader } from "../../components"
import { useIsMobile } from "@/hooks/use-mobile"
import { TraceabilityEventDetailPanel } from "../components/TraceabilityEventDetailPanel"
import {
  TRACEABILITY_PAGE_SIZE_OPTIONS,
  type TraceabilityFilterValues,
  useTraceabilityPage,
} from "../hooks/useTraceabilityPage"
import { traceabilityEventStyles } from "../components/traceability-event-styles"

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
  const style = traceabilityEventStyles[transaction.inventoryMovementType]
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
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type TraceabilityFiltersProps = {
  values: TraceabilityFilterValues
  onApply: (filters: TraceabilityFilterValues) => void
  onReset: () => TraceabilityFilterValues
}

function TraceabilityFilters({
  values,
  onApply,
  onReset,
}: TraceabilityFiltersProps) {
  const [draft, setDraft] = useState(values)

  return (
    <section aria-label="Filtros de trazabilidad">
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(draft)
        }}
      >
        <DatePicker
          id="traceability-start-date"
          label="Fecha inicial"
          value={draft.startDate}
          maxDate={draft.endDate}
          onChange={(startDate) =>
            setDraft((current) => ({ ...current, startDate }))
          }
        />

        <DatePicker
          id="traceability-end-date"
          label="Fecha final"
          value={draft.endDate}
          minDate={draft.startDate}
          onChange={(endDate) =>
            setDraft((current) => ({ ...current, endDate }))
          }
        />

        <Field>
          <FieldLabel htmlFor="traceability-responsible">
            Responsable
          </FieldLabel>
          <Input
            id="traceability-responsible"
            name="performedByAccountUsername"
            placeholder="Nombre del responsable"
            value={draft.performedByAccountUsername}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                performedByAccountUsername: event.target.value,
              }))
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="traceability-warehouse">Almacén</FieldLabel>
          <Input
            id="traceability-warehouse"
            name="fromWarehouseName"
            placeholder="Nombre del almacén"
            value={draft.fromWarehouseName}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                fromWarehouseName: event.target.value,
              }))
            }
          />
        </Field>

        <div className="flex flex-wrap justify-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit">
            <Funnel />
            Aplicar filtros
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(onReset())
            }}
          >
            <RotateCcw />
            Limpiar
          </Button>
        </div>
      </form>
    </section>
  )
}

const columnHelper = createColumnHelper<
  DataTableFeatures,
  MovementTransaction
>()

function createTraceabilityColumns(
  isMobile: boolean,
  showModelsColumn: boolean
) {
  return columnHelper.columns([
    columnHelper.accessor("inventoryMovementType", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Evento"
          className="ml-0"
        />
      ),
      cell: ({ row }) => <EventCell transaction={row.original} />,
      size: 180,
      minSize: 160,
    }),
    columnHelper.display({
      id: "accounts",
      header: "Responsable / Asignado",
      cell: ({ row }) => <AccountsCell transaction={row.original} />,
      size: isMobile ? 340 : 220,
      minSize: isMobile ? 280 : 180,
    }),
    columnHelper.accessor("warehouseName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Almacén" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="px-2 py-1">
          <Warehouse />
          {row.original.warehouseName ??
            row.original.fromWarehouseName ??
            "Sin almacén"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "content",
      header: "Contenido",
      cell: ({ row }) => <ContentCell transaction={row.original} />,
    }),
    ...(showModelsColumn
      ? [
          columnHelper.display({
            id: "models",
            header: "Modelos",
            cell: ({ row }) => <ModelsCell transaction={row.original} />,
            size: 160,
            minSize: 140,
          }),
        ]
      : []),
  ])
}

export function TraceabilityPage() {
  const isMobile = useIsMobile()
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const traceabilityColumns = useMemo(
    () => createTraceabilityColumns(isMobile, selectedEventId === null),
    [isMobile, selectedEventId]
  )
  const { rows, isLoading, isFetching, isError, filters, pagination } =
    useTraceabilityPage()
  const selectedEvent =
    rows.find((event) => event.id === selectedEventId) ?? null

  const emptyMessage = isLoading
    ? "Cargando movimientos..."
    : isError
      ? "No se pudo cargar la trazabilidad."
      : "No hay movimientos durante los últimos siete días."

  return (
    <section className="flex flex-col gap-6" aria-label="Trazabilidad">
      <InventoryPageHeader
        title="Trazabilidad"
        description="Auditoría y trazabilidad de movimientos del inventario."
      />

      <TraceabilityFilters
        values={filters.values}
        onApply={(nextFilters) => {
          setSelectedEventId(null)
          filters.apply(nextFilters)
        }}
        onReset={() => {
          setSelectedEventId(null)
          return filters.reset()
        }}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {isFetching ? "Actualizando movimientos" : "Movimientos actualizados"}
      </p>

      <div
        className={`grid items-start gap-4 ${
          selectedEvent
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]"
            : "grid-cols-1"
        }`}
      >
        <section className="min-w-0" aria-label="Movimientos de inventario">
          <DataTable
            data={rows}
            columns={traceabilityColumns}
            isLoading={isLoading}
            getRowId={(transaction) => String(transaction.id)}
            selectedRowId={
              selectedEventId === null ? undefined : String(selectedEventId)
            }
            onRowClick={(transaction) => {
              setSelectedEventId((current) =>
                current === transaction.id ? null : transaction.id
              )
            }}
            serverPagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              totalPages: pagination.totalPages,
              totalElements: pagination.totalElements,
              onPageChange: (page) => {
                setSelectedEventId(null)
                pagination.setPage(page)
              },
              pageSizeOptions: TRACEABILITY_PAGE_SIZE_OPTIONS,
              onPageSizeChange: (pageSize) => {
                setSelectedEventId(null)
                pagination.setPageSize(pageSize)
              },
            }}
            ariaLabel="Trazabilidad de movimientos de inventario"
            emptyMessage={emptyMessage}
          />
        </section>

        <TraceabilityEventDetailPanel
          event={selectedEvent}
          open={selectedEvent !== null}
          onClose={() => setSelectedEventId(null)}
        />
      </div>
    </section>
  )
}
