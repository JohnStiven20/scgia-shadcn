import { createColumnHelper } from "@tanstack/react-table"
import { skipToken } from "@reduxjs/toolkit/query"
import { useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Archive,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Filter,
  RotateCcw,
  Search,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import modelImage from "@/assets/hgu_wifi_5_f.png"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { DatePicker } from "@/components/general"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TelecommunicationSpecificModelInventorySummaryResponse } from "@/features/interface/products/products.type"
import type {
  TelecommunicationItemStatus,
  TelecommunicationSpecificItemInventoryResponse,
} from "@/features/interface/products/telecommunicationSpecificItemInventory"
import { useGetSpecificModelInventorySummaryQuery } from "../../api/products.service"
import {
  useGetSpecificModelItemsQuery,
  type GetSpecificModelItemsParams,
} from "../../api/specificModelItemsApi"
import { InventoryPageHeader } from "../../components"
import { useLazyGetTelecommunicationSpecificItemHistoryQuery } from "../../api/telecommunicationSpecificItemHistoryApi"
import { ProductUnitDetailPanel } from "../components/ProductUnitDetailPanel"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

type ItemTableRow = TelecommunicationSpecificItemInventoryResponse
type ItemStatusFilter = TelecommunicationItemStatus | "ALL"
type ItemQueryFilters = NonNullable<GetSpecificModelItemsParams["filters"]>

type FilterDraft = {
  search: string
  worker: string
  status: ItemStatusFilter
  createdFrom?: Date
  createdTo?: Date
  sortOrder: "ASC" | "DESC"
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const statusStyles: Record<
  TelecommunicationItemStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  AVAILABLE: {
    label: "Disponible",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  ASSIGNED: {
    label: "Asignado",
    icon: UserRound,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
  },
  IN_REPAIR: {
    label: "En reparación",
    icon: Wrench,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
  },
  RETIRED: {
    label: "Retirado",
    icon: Archive,
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  },
}

const itemColumnHelper = createColumnHelper<DataTableFeatures, ItemTableRow>()

function getDefaultFilters(): FilterDraft {
  return {
    search: "",
    worker: "",
    status: "ALL",
    createdFrom: undefined,
    createdTo: undefined,
    sortOrder: "DESC",
  }
}

function toUtcBoundary(date: Date | undefined, endOfDay: boolean) {
  if (!date) return undefined

  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    )
  ).toISOString()
}

function formatCreatedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function StatusBadge({ status }: { status: TelecommunicationItemStatus }) {
  const style = statusStyles[status]
  const StatusIcon = style.icon

  return (
    <Badge
      variant="outline"
      className={`h-6 gap-1.5 px-2.5 text-xs [&>svg]:size-3! ${style.className}`}
    >
      <StatusIcon aria-hidden="true" />
      {style.label}
    </Badge>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon
  label: string
  value: number
  className: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-md border px-2 py-2 text-center sm:px-3 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:first:border-l-0">
      <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <strong className={`text-base font-semibold ${className}`}>
        {value.toLocaleString("es-ES")}
      </strong>
    </div>
  )
}

function ModelSummaryCard({
  model,
}: {
  model: TelecommunicationSpecificModelInventorySummaryResponse
}) {
  return (
    <article className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={modelImage}
            alt=""
            className="size-full object-contain p-1"
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">
            {model.modelName || "Modelo sin nombre"}
          </h2>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
        <Metric
          icon={Archive}
          label="Total registrado"
          value={model.totalRegistered}
          className="text-slate-700 dark:text-slate-300"
        />
        <Metric
          icon={CheckCircle2}
          label="Activas"
          value={model.activeQuantity}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <Metric
          icon={UserRound}
          label="Asignadas"
          value={model.assignedQuantity}
          className="text-blue-600 dark:text-blue-400"
        />
        <Metric
          icon={CircleAlert}
          label="Rotas"
          value={model.brokenQuantity}
          className="text-red-600 dark:text-red-400"
        />
        <Metric
          icon={Wrench}
          label="Instaladas"
          value={model.installedQuantity}
          className="text-violet-600 dark:text-violet-400"
        />
      </div>
    </article>
  )
}

const itemColumns = itemColumnHelper.columns([
  itemColumnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="#" className="px-0" />
    ),
    size: 80,
    minSize: 70,
    enableSorting: false,
    enableGlobalFilter: false,
  }),
  itemColumnHelper.accessor("uniqueCode", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="MAC / Serial"
        className="px-0"
      />
    ),
    size: 220,
    minSize: 180,
    enableSorting: false,
    enableGlobalFilter: false,
  }),
  itemColumnHelper.accessor("identifierCode", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" className="px-0" />
    ),
    size: 190,
    minSize: 150,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => row.original.identifierCode || "—",
  }),
  itemColumnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" className="px-0" />
    ),
    size: 170,
    minSize: 145,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  itemColumnHelper.accessor("workerName", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trabajador / ubicación"
        className="px-0"
      />
    ),
    size: 240,
    minSize: 190,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => row.original.workerName || "Sin asignar",
  }),
  itemColumnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" className="px-0" />
    ),
    size: 180,
    minSize: 160,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <time dateTime={row.original.createdAt}>
        {formatCreatedAt(row.original.createdAt)}
      </time>
    ),
  }),
  itemColumnHelper.display({
    id: "open",
    header: () => null,
    size: 42,
    minSize: 38,
    enableSorting: false,
    cell: () => (
      <ChevronRight className="size-4 text-primary" aria-hidden="true" />
    ),
  }),
])

function ModelItemsFilters({
  values,
  onApply,
  onReset,
}: {
  values: FilterDraft
  onApply: (filters: FilterDraft) => void
  onReset: () => void
}) {
  const [draft, setDraft] = useState(values)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(draft)
  }

  function handleReset() {
    setDraft(getDefaultFilters())
    onReset()
  }

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={handleSubmit}
    >
      <Field>
        <FieldLabel htmlFor="specific-item-search">Buscar</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            id="specific-item-search"
            placeholder="MAC o código..."
            value={draft.search}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </InputGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="specific-item-worker">Trabajador</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <UserRound />
          </InputGroupAddon>
          <InputGroupInput
            id="specific-item-worker"
            placeholder="Nombre del trabajador..."
            value={draft.worker}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                worker: event.target.value,
              }))
            }
          />
        </InputGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="specific-item-status">Estado</FieldLabel>
        <Select
          value={draft.status}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              status: value as ItemStatusFilter,
            }))
          }
        >
          <SelectTrigger id="specific-item-status" className="w-full">
            <SelectValue>
              {draft.status === "ALL"
                ? "Todos los estados"
                : statusStyles[draft.status].label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="AVAILABLE">Disponible</SelectItem>
              <SelectItem value="ASSIGNED">Asignado</SelectItem>
              <SelectItem value="IN_REPAIR">En reparación</SelectItem>
              <SelectItem value="RETIRED">Retirado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="specific-item-order">Ordenar</FieldLabel>
        <Select
          value={draft.sortOrder}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              sortOrder: value as FilterDraft["sortOrder"],
            }))
          }
        >
          <SelectTrigger id="specific-item-order" className="w-full">
            <SelectValue>
              {draft.sortOrder === "DESC" ? "Más recientes" : "Más antiguos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="DESC">Más recientes</SelectItem>
              <SelectItem value="ASC">Más antiguos</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <DatePicker
        id="specific-item-created-from"
        label="Creado desde"
        value={draft.createdFrom}
        maxDate={draft.createdTo}
        onChange={(createdFrom) =>
          setDraft((current) => ({ ...current, createdFrom }))
        }
      />
      <DatePicker
        id="specific-item-created-to"
        label="Creado hasta"
        value={draft.createdTo}
        minDate={draft.createdFrom}
        onChange={(createdTo) =>
          setDraft((current) => ({ ...current, createdTo }))
        }
      />

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
        <Button type="submit" className="gap-2">
          <Filter />
          Aplicar filtros
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw />
          Limpiar
        </Button>
      </div>
    </form>
  )
}

export function SpecificModelItemsPage() {
  const navigate = useNavigate()
  const { modelId: modelIdParam } = useParams<{ modelId: string }>()
  const parsedModelId = Number(modelIdParam)
  const modelId =
    Number.isInteger(parsedModelId) && parsedModelId > 0 ? parsedModelId : null
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [appliedFilters, setAppliedFilters] = useState(getDefaultFilters)
  const [selectedUnitCode, setSelectedUnitCode] = useState<string | null>(null)

  const {
    data: models = [],
    isLoading: isLoadingModels,
    isError: isModelsError,
  } = useGetSpecificModelInventorySummaryQuery()
  const model = useMemo(
    () => models.find((item) => item.modelId === modelId),
    [modelId, models]
  )
  const request = useMemo(() => {
    const filters: ItemQueryFilters = {}

    if (appliedFilters.search.trim()) {
      filters.search = appliedFilters.search.trim()
    }
    if (appliedFilters.worker.trim()) {
      filters.worker = appliedFilters.worker.trim()
    }
    if (appliedFilters.status !== "ALL") {
      filters.status = appliedFilters.status
    }

    const createdFrom = toUtcBoundary(appliedFilters.createdFrom, false)
    const createdTo = toUtcBoundary(appliedFilters.createdTo, true)
    if (createdFrom) filters.createdFrom = createdFrom
    if (createdTo) filters.createdTo = createdTo

    return {
      modelId: modelId ?? 0,
      pageNumber: page - 1,
      pageSize,
      sortBy: "createdAt",
      sortOrder: appliedFilters.sortOrder,
      filters,
    } satisfies GetSpecificModelItemsParams
  }, [appliedFilters, modelId, page, pageSize])
  const {
    data: itemsResponse,
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
    isError: isItemsError,
  } = useGetSpecificModelItemsQuery(modelId ? request : skipToken)
  const [getUnitHistory, unitHistoryQuery] =
    useLazyGetTelecommunicationSpecificItemHistoryQuery()

  function applyFilters(nextFilters: FilterDraft) {
    setAppliedFilters(nextFilters)
    setPage(1)
    setSelectedUnitCode(null)
  }

  function resetFilters() {
    setAppliedFilters(getDefaultFilters())
    setPage(1)
    setSelectedUnitCode(null)
  }

  function handleItemRowClick(item: ItemTableRow) {
    setSelectedUnitCode(item.uniqueCode)
    void getUnitHistory(item.uniqueCode)
  }

  if (!modelId) {
    return <ModelNotFound />
  }

  if (isLoadingModels) {
    return (
      <section className="flex flex-col gap-6" aria-label="Detalle del modelo">
        <InventoryPageHeader
          title="Detalle del modelo"
          description="Cargando la información del modelo..."
        />
        <div className="h-44 animate-pulse rounded-lg border bg-muted" />
      </section>
    )
  }

  if (isModelsError || !model) {
    return <ModelNotFound />
  }

  const totalPages = Math.max(1, itemsResponse?.totalPages ?? 1)
  const currentPage = Math.min(
    (itemsResponse?.page ?? page - 1) + 1,
    totalPages
  )

  return (
    <section className="flex flex-col gap-6" aria-label="Detalle del modelo">
      <InventoryPageHeader
        title="Detalle del modelo"
        description="Consulta las unidades asociadas a este modelo."
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/inventory/products" />}>
              Productos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{model.modelName || "Modelo"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModelSummaryCard model={model} />

      <div
        className={`grid items-start gap-4 ${
          selectedUnitCode
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]"
            : "grid-cols-1"
        }`}
      >
        <section className="min-w-0" aria-label="Unidades del modelo">
          <DataTable
            columns={itemColumns}
            data={itemsResponse?.content ?? []}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            getRowId={(item) => String(item.id)}
            selectedRowId={
              selectedUnitCode
                ? String(
                    itemsResponse?.content.find(
                      (item) => item.uniqueCode === selectedUnitCode
                    )?.id ?? ""
                  )
                : undefined
            }
            onRowClick={handleItemRowClick}
            isLoading={isLoadingItems || isFetchingItems}
            ariaLabel="Unidades asociadas al modelo"
            emptyMessage={
              isItemsError
                ? "No se pudieron cargar las unidades."
                : "No hay unidades que coincidan con los filtros."
            }
            renderToolbar={() => (
              <ModelItemsFilters
                values={appliedFilters}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            )}
            serverPagination={{
              page: currentPage,
              pageSize,
              totalPages,
              totalElements: itemsResponse?.totalElements ?? 0,
              onPageChange: (nextPage) => {
                setSelectedUnitCode(null)
                setPage(nextPage)
              },
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              onPageSizeChange: (nextPageSize) => {
                setSelectedUnitCode(null)
                setPageSize(nextPageSize)
                setPage(1)
              },
            }}
          />
        </section>

        <ProductUnitDetailPanel
          open={selectedUnitCode !== null}
          response={unitHistoryQuery.data}
          isLoading={unitHistoryQuery.isLoading || unitHistoryQuery.isFetching}
          isError={unitHistoryQuery.isError}
          onClose={() => setSelectedUnitCode(null)}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => navigate("/inventory/products")}
      >
        Volver a productos
      </Button>
    </section>
  )
}

function ModelNotFound() {
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo no encontrado">
      <InventoryPageHeader
        title="Modelo no encontrado"
        description="No existe un modelo válido para mostrar."
      />
      <Button render={<Link to="/inventory/products" />}>
        Volver a productos
      </Button>
    </section>
  )
}
