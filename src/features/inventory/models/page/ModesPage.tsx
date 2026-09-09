import { createColumnHelper } from "@tanstack/react-table"
import { Check, X } from "lucide-react"
import modelImage from "@/assets/hgu_wifi_5_f.png"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import type { TelecommunicationItemModelResponse } from "@/features/interface/models/types/model.types"
import { InventoryPageHeader } from "../../components"
import { useGetModelCatalogQuery } from "../api/modelsApi"

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
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo" />
    ),
    size: 370,
    minSize: 260,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <AspectRatio
          ratio={4 / 3}
          className="w-12 shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <img
            src={modelImage}
            alt="Roseta de fibra"
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
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    size: 185,
    minSize: 150,
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
  columnHelper.accessor("identifierCount", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Identificadores" />
    ),
    size: 185,
    minSize: 130,
    cell: ({ row }) => {
      const count = row.original.identifierCount
      return `${count} ${count === 1 ? "identificador" : "identificadores"}`
    },
  }),
  columnHelper.accessor("active", {
    header: "Estado de uso",
    size: 170,
    minSize: 110,
    enableSorting: false,
    cell: ({ row }) => <ModelStatusBadge active={row.original.active} />,
  }),
  columnHelper.accessor("createdDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    size: 150,
    minSize: 135,
    cell: ({ row }) => (
      <time dateTime={row.original.createdDate}>
        {formatCreatedDate(row.original.createdDate)}
      </time>
    ),
  }),
])

export const ModelsPage = () => {
  const {
    data: models = [],
    isLoading,
    isError,
  } = useGetModelCatalogQuery()

  return (
    <section className="flex flex-col gap-6" aria-label="Modelos">
      <InventoryPageHeader
        title="Modelos"
        description="Gestiona los modelos de inventario específicos y genéricos."
      />

      <section aria-label="Listado de modelos">
        <DataTable
          columns={modelColumns}
          data={models}
          isLoading={isLoading}
          getRowId={(model) => String(model.id)}
          ariaLabel="Listado de modelos"
          emptyMessage={
            isError
              ? "No se pudieron cargar los modelos."
              : isLoading
                ? "Cargando modelos..."
                : "No hay modelos registrados."
          }
        />
      </section>
    </section>
  )
}
