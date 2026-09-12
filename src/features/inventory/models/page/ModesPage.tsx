import { useState } from "react"
import { createColumnHelper, type ReactTable } from "@tanstack/react-table"
import { Check, ChevronRight, Plus, RotateCcw, Search, X } from "lucide-react"

import modelImage from "@/assets/hgu_wifi_5_f.png"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  IdentifierFormValues,
  ModelFormValues,
  ModelSort,
  ProviderResponse,
  SidePanelMode,
  TelecommunicationItemModelIdentifierResponse,
  TelecommunicationItemModelResponse,
} from "@/features/interface/models/types/model.types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InventoryPageHeader } from "../../components"
import {
  useCreateIdentifierMutation,
  useCreateModelMutation,
  useDeleteIdentifierMutation,
  useDeleteModelMutation,
  useGetModelCatalogQuery,
  useGetModelIdentifiersQuery,
  useGetProvidersQuery,
  usePartialUpdateModelMutation,
  useUpdateIdentifierMutation,
  useUpdateModelMutation,
} from "../../api/modelsApi"
import { ModelSidePanel } from "../components/ModelSidePanel"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  TelecommunicationItemModelResponse
>()

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

function formatCreatedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function getProviderBadgeClassName(providerName: string) {
  switch (providerName.trim().toLowerCase()) {
    case "movistar":
      return "bg-[#EAF5FF] text-[#0066B3] hover:bg-[#EAF5FF]"
    default:
      return "bg-muted text-muted-foreground hover:bg-muted"
  }
}

function ModelStatusBadge({ active }: { active: boolean }) {
  const StatusIcon = active ? Check : X

  return (
    <Badge
      variant="outline"
      className="h-5 rounded-full px-1.5 text-[0.65rem] font-normal text-muted-foreground"
    >
      <span
        className={`flex size-2.5 items-center justify-center rounded-full text-white ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        <StatusIcon className="size-1.5" strokeWidth={2} />
      </span>
      {active ? "Activo" : "Inactivo"}
    </Badge>
  )
}

const modelColumns = columnHelper.columns([
  columnHelper.accessor((model) => `${model.name} ${model.description ?? ""}`, {
    id: "model",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo" className="px-0" />
    ),
    size: 350,
    minSize: 260,
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <AspectRatio
          ratio={4 / 3}
          className="w-12 shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <img
            src={modelImage}
            alt="Imagen del modelo"
            className="absolute inset-0 size-full object-contain"
          />
        </AspectRatio>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.description ? (
            <p className="truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          ) : null}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor((model) => model.provider?.name ?? "", {
    id: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Proveedor"
        className="px-0"
      />
    ),
    size: 155,
    minSize: 125,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: ({ row }) =>
      row.original.provider ? (
        <Badge
          variant="secondary"
          className={getProviderBadgeClassName(row.original.provider.name)}
        >
          {row.original.provider.name}
        </Badge>
      ) : (
        "Sin proveedor"
      ),
  }),
  columnHelper.accessor("telecommunicationItemType", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tipo de modelo"
        className="px-0"
      />
    ),
    size: 150,
    minSize: 130,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: ({ row }) =>
      row.original.telecommunicationItemType === "SPECIFIC"
        ? "Específico"
        : "Genérico",
  }),
  columnHelper.accessor("identifierCount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Identificadores"
        className="px-0"
      />
    ),
    size: 165,
    minSize: 130,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const count = row.original.identifierCount ?? 0
      return `${count} ${count === 1 ? "identificador" : "identificadores"}`
    },
  }),
  columnHelper.accessor((model) => (model.active ? "ACTIVE" : "INACTIVE"), {
    id: "active",
    header: "Estado de uso",
    size: 140,
    minSize: 110,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: ({ row }) => <ModelStatusBadge active={row.original.active} />,
  }),
  columnHelper.accessor("createdDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" className="px-0" />
    ),
    size: 145,
    minSize: 130,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <time dateTime={row.original.createdDate}>
        {formatCreatedDate(row.original.createdDate)}
      </time>
    ),
  }),
  columnHelper.display({
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

type ModelsTable = ReactTable<
  DataTableFeatures,
  TelecommunicationItemModelResponse
>

type ModelsToolbarProps = {
  table: ModelsTable
  providers: ProviderResponse[]
  compact: boolean
  onCreate: () => void
}

const sortLabels: Record<ModelSort, string> = {
  RECENT: "Más recientes",
  OLDEST: "Más antiguos",
  NAME_ASC: "Nombre A-Z",
  NAME_DESC: "Nombre Z-A",
}

function ModelsToolbar({
  table,
  providers,
  compact,
  onCreate,
}: ModelsToolbarProps) {
  const globalFilter = String(table.state.globalFilter ?? "")
  const getFilterValue = (columnId: string) =>
    String(table.getColumn(columnId)?.getFilterValue() ?? "ALL")
  const providerFilter = getFilterValue("provider")
  const typeFilter = getFilterValue("telecommunicationItemType")
  const statusFilter = getFilterValue("active")

  const applyFilter = (columnId: string, value: string) => {
    table
      .getColumn(columnId)
      ?.setFilterValue(value === "ALL" ? undefined : value)
    table.setPageIndex(0)
  }

  const currentSort = (() => {
    const sort = table.state.sorting[0]
    if (!sort) return "RECENT" satisfies ModelSort
    if (sort.id === "createdDate") return sort.desc ? "RECENT" : "OLDEST"
    return sort.desc ? "NAME_DESC" : "NAME_ASC"
  })()

  const applySort = (sort: ModelSort) => {
    table.setSorting(
      sort === "RECENT"
        ? [{ id: "createdDate", desc: true }]
        : sort === "OLDEST"
          ? [{ id: "createdDate", desc: false }]
          : [{ id: "model", desc: sort === "NAME_DESC" }]
    )
    table.setPageIndex(0)
  }

  const clearFilters = () => {
    table.setGlobalFilter("")
    table.setColumnFilters([])
    table.setSorting([{ id: "createdDate", desc: true }])
    table.setPageIndex(0)
  }

  return (
    <section className="grid gap-2" aria-label="Filtros de modelos">
      <div
        className={
          compact
            ? "grid gap-2 lg:grid-cols-3"
            : "grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_repeat(3,minmax(9rem,0.35fr))]"
        }
      >
        <div
          className={
            compact
              ? "relative grid gap-1 lg:col-span-3"
              : "relative grid gap-1"
          }
        >
          <Label htmlFor="model-search">Buscar</Label>
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              id="model-search"
              value={globalFilter}
              placeholder="Buscar por nombre o descripción..."
              aria-label="Buscar modelos"
              onChange={(event) => {
                table.setGlobalFilter(event.target.value)
                table.setPageIndex(0)
              }}
            />
          </InputGroup>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="model-provider">Proveedor</Label>
          <Select
            value={providerFilter}
            onValueChange={(value) => value && applyFilter("provider", value)}
          >
            <SelectTrigger
              id="model-provider"
              className="w-full"
              aria-label="Filtrar por proveedor"
            >
              <SelectValue>
                {providerFilter === "ALL"
                  ? "Todos los proveedores"
                  : providerFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los proveedores</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.name}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="model-type">Tipo</Label>
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              value && applyFilter("telecommunicationItemType", value)
            }
          >
            <SelectTrigger
              id="model-type"
              className="w-full"
              aria-label="Filtrar por tipo de modelo"
            >
              <SelectValue>
                {typeFilter === "SPECIFIC"
                  ? "Específicos"
                  : typeFilter === "GENERIC"
                    ? "Genéricos"
                    : "Todos los tipos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="SPECIFIC">Específicos</SelectItem>
              <SelectItem value="GENERIC">Genéricos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="model-status">Estado</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => value && applyFilter("active", value)}
          >
            <SelectTrigger
              id="model-status"
              className="w-full"
              aria-label="Filtrar por estado"
            >
              <SelectValue>
                {statusFilter === "ACTIVE"
                  ? "Activos"
                  : statusFilter === "INACTIVE"
                    ? "Inactivos"
                    : "Todos los estados"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="INACTIVE">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-1">
          <Label htmlFor="model-sort">Ordenar por</Label>
          <Select
            value={currentSort}
            onValueChange={(value) => value && applySort(value as ModelSort)}
          >
            <SelectTrigger
              id="model-sort"
              className="w-48"
              aria-label="Ordenar modelos"
            >
              <SelectValue>{sortLabels[currentSort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENT">Más recientes</SelectItem>
              <SelectItem value="OLDEST">Más antiguos</SelectItem>
              <SelectItem value="NAME_ASC">Nombre A-Z</SelectItem>
              <SelectItem value="NAME_DESC">Nombre Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={clearFilters}>
            <RotateCcw />
            Limpiar
          </Button>
          <Button type="button" onClick={onCreate}>
            <Plus />
            Nuevo modelo
          </Button>
        </div>
      </div>
    </section>
  )
}

function getApiErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "No se pudo completar la operación."
  }

  if ("data" in error) {
    const data = error.data
    if (typeof data === "string") return data
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message
      if (typeof message === "string") return message
    }
  }

  if ("error" in error && typeof error.error === "string") return error.error
  return "No se pudo completar la operación."
}

export const ModelsPage = () => {
  const notifications = useNotifications()
  const desktop = useMediaQuery("(min-width: 1024px)")
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [panelMode, setPanelMode] = useState<SidePanelMode>("CLOSED")
  const [editingIdentifier, setEditingIdentifier] =
    useState<TelecommunicationItemModelIdentifierResponse | null>(null)
  const [identifierToDelete, setIdentifierToDelete] =
    useState<TelecommunicationItemModelIdentifierResponse | null>(null)
  const [panelError, setPanelError] = useState<string | null>(null)

  const { data: models = [], isLoading, isError } = useGetModelCatalogQuery()
  const { data: providers = [] } = useGetProvidersQuery()
  const selectedModel =
    selectedModelId === null
      ? null
      : (models.find((model) => model.id === selectedModelId) ?? null)
  const { data: identifiers = [], isLoading: isLoadingIdentifiers } =
    useGetModelIdentifiersQuery(selectedModelId ?? 0, {
      skip: selectedModelId === null,
    })

  const [createModel, createModelState] = useCreateModelMutation()
  const [updateModel, updateModelState] = useUpdateModelMutation()
  const [partialUpdateModel, partialUpdateModelState] =
    usePartialUpdateModelMutation()
  const [deleteModel, deleteModelState] = useDeleteModelMutation()
  const [createIdentifier, createIdentifierState] =
    useCreateIdentifierMutation()
  const [updateIdentifier, updateIdentifierState] =
    useUpdateIdentifierMutation()
  const [deleteIdentifier, deleteIdentifierState] =
    useDeleteIdentifierMutation()
  const isSubmitting =
    createModelState.isLoading ||
    updateModelState.isLoading ||
    partialUpdateModelState.isLoading ||
    deleteModelState.isLoading ||
    createIdentifierState.isLoading ||
    updateIdentifierState.isLoading ||
    deleteIdentifierState.isLoading

  const resetTransientState = () => {
    setPanelError(null)
    setEditingIdentifier(null)
    setIdentifierToDelete(null)
  }

  const closePanel = () => {
    resetTransientState()
    setSelectedModelId(null)
    setPanelMode("CLOSED")
  }

  const backToDetail = () => {
    resetTransientState()
    setPanelMode(selectedModel ? "DETAIL" : "CLOSED")
  }

  const handleFailure = (error: unknown) => {
    const message = getApiErrorMessage(error)
    setPanelError(message)
    notifications.error(message)
  }

  const handleSaveModel = async (values: ModelFormValues) => {
    setPanelError(null)

    try {
      if (!selectedModel || panelMode === "CREATE_MODEL") {
        await createModel({
          ...values,
          description: values.description || null,
        }).unwrap()
        notifications.success("Modelo creado correctamente.")
        closePanel()
        return true
      }

      if (selectedModel.editable) {
        await partialUpdateModel({
          id: selectedModel.id,
          request: {
            description: values.description || null,
            active: values.active,
          },
        }).unwrap()
      } else {
        await updateModel({
          id: selectedModel.id,
          request: {
            ...values,
            description: values.description || null,
          },
        }).unwrap()
      }

      notifications.success("Modelo actualizado correctamente.")
      setPanelMode("DETAIL")
      return true
    } catch (error) {
      handleFailure(error)
      return false
    }
  }

  const handleSaveIdentifier = async (values: IdentifierFormValues) => {
    if (!selectedModel) return false
    setPanelError(null)

    try {
      if (panelMode === "EDIT_IDENTIFIER" && editingIdentifier) {
        await updateIdentifier({
          id: editingIdentifier.id,
          modelId: selectedModel.id,
          request: values,
        }).unwrap()
        notifications.success("Identificador actualizado correctamente.")
        setPanelMode("DETAIL")
        setEditingIdentifier(null)
      } else {
        await createIdentifier({
          ...values,
          telecommunicationItemModelId: selectedModel.id,
        }).unwrap()
        notifications.success("Identificador creado correctamente.")
      }
      return true
    } catch (error) {
      handleFailure(error)
      return false
    }
  }

  const handleConfirmModelDelete = async () => {
    if (!selectedModel || !selectedModel.editable || !selectedModel.deletable)
      return
    setPanelError(null)

    try {
      await deleteModel(selectedModel.id).unwrap()
      notifications.success("Modelo eliminado correctamente.")
      closePanel()
    } catch (error) {
      handleFailure(error)
    }
  }

  const handleConfirmIdentifierDelete = async () => {
    if (!selectedModel || !identifierToDelete?.mutable) return
    setPanelError(null)

    try {
      await deleteIdentifier({
        id: identifierToDelete.id,
        modelId: selectedModel.id,
      }).unwrap()
      notifications.success("Identificador eliminado correctamente.")
      backToDetail()
    } catch (error) {
      handleFailure(error)
    }
  }

  const panelOpen = panelMode !== "CLOSED"

  return (
    <section className="flex flex-col gap-6" aria-label="Modelos">
      <InventoryPageHeader
        title="Modelos"
        description="Gestiona los modelos de inventario específicos y genéricos."
      />

      <div
        className={
          desktop && panelOpen
            ? "grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_clamp(22rem,30vw,28rem)]"
            : "min-w-0"
        }
      >
        <section className="min-w-0" aria-label="Listado de modelos">
          <DataTable
            columns={modelColumns}
            data={models}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
            initialSorting={[{ id: "createdDate", desc: true }]}
            isLoading={isLoading}
            getRowId={(model) => String(model.id)}
            selectedRowId={
              selectedModelId === null ? undefined : String(selectedModelId)
            }
            onRowClick={(model) => {
              resetTransientState()
              setSelectedModelId(model.id)
              setPanelMode("DETAIL")
            }}
            renderToolbar={(table) => (
              <ModelsToolbar
                table={table}
                providers={providers}
                compact={panelOpen}
                onCreate={() => {
                  resetTransientState()
                  setSelectedModelId(null)
                  setPanelMode("CREATE_MODEL")
                }}
              />
            )}
            ariaLabel="Listado de modelos"
            emptyMessage={
              isError
                ? "No se pudieron cargar los modelos."
                : isLoading
                  ? "Cargando modelos..."
                  : "No hay modelos que coincidan con los filtros."
            }
          />
        </section>

        <ModelSidePanel
          desktop={desktop}
          mode={panelMode}
          model={selectedModel}
          providers={providers}
          identifiers={identifiers}
          editingIdentifier={editingIdentifier}
          identifierToDelete={identifierToDelete}
          isLoadingIdentifiers={isLoadingIdentifiers}
          isSubmitting={isSubmitting}
          error={panelError}
          onClose={closePanel}
          onBackToDetail={backToDetail}
          onCreateIdentifier={() => {
            resetTransientState()
            setPanelMode("CREATE_IDENTIFIER")
          }}
          onEditModel={() => {
            resetTransientState()
            setPanelMode("EDIT_MODEL")
          }}
          onDeleteModel={() => {
            resetTransientState()
            setPanelMode("CONFIRM_MODEL_DELETE")
          }}
          onEditIdentifier={(identifier) => {
            if (!identifier.mutable) return
            setPanelError(null)
            setIdentifierToDelete(null)
            setEditingIdentifier(identifier)
            setPanelMode("EDIT_IDENTIFIER")
          }}
          onDeleteIdentifier={(identifier) => {
            if (!identifier.mutable) return
            setPanelError(null)
            setEditingIdentifier(null)
            setIdentifierToDelete(identifier)
            setPanelMode("CONFIRM_IDENTIFIER_DELETE")
          }}
          onSaveModel={handleSaveModel}
          onSaveIdentifier={handleSaveIdentifier}
          onConfirmModelDelete={handleConfirmModelDelete}
          onConfirmIdentifierDelete={handleConfirmIdentifierDelete}
        />
      </div>
    </section>
  )
}
