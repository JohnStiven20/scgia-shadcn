import { createColumnHelper } from "@tanstack/react-table"
import { Check, X } from "lucide-react"
import { useState } from "react"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import { useGetAbsenceTypesQuery } from "@/features/absences/api/absenceTypeApi"
import type { AbsenceTypeResponse } from "@/features/interface/absence-type/response/absence-type-response"
import { InventoryPageHeader } from "@/features/inventory/components"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  AbsenceTypeResponse
>()

const absenceTypeColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    size: 240,
    minSize: 180,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  }),
  columnHelper.accessor(
    (absenceType) => absenceType.description ?? "",
    {
      id: "description",
      header: "Descripción",
      size: 360,
      minSize: 220,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description?.trim() || "Sin descripción"}
        </span>
      ),
    }
  ),
  columnHelper.accessor((absenceType) => (absenceType.active ? "ACTIVE" : "INACTIVE"), {
    id: "active",
    header: "Activo",
    size: 140,
    minSize: 120,
    enableSorting: false,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-muted-foreground/30 text-muted-foreground"
        }
      >
        {row.original.active ? <Check /> : <X />}
        {row.original.active ? "Sí" : "No"}
      </Badge>
    ),
  }),
  columnHelper.accessor("calendarColor", {
    header: "Color de calendario",
    size: 220,
    minSize: 180,
    enableSorting: false,
    cell: ({ row }) => {
      const color = row.original.calendarColor?.trim() || "#94A3B8"

      return (
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-4 rounded-sm border border-black/10"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm uppercase">{color}</span>
        </div>
      )
    },
  }),
])

export function AbsenceTypesPage() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const { data, isLoading, isError } = useGetAbsenceTypesQuery({
    page: 0,
    size: 100,
    sort: ["name,asc"],
  })
  const absenceTypes = data?.content ?? []

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-label="Tipos de ausencia">
      <InventoryPageHeader
        title="Tipos de ausencia"
        description="Gestiona los tipos de ausencia disponibles en la organización."
      />

      <DataTable
        columns={absenceTypeColumns}
        data={absenceTypes}
        pageSize={100}
        showPagination={false}
        getRowId={(absenceType) => String(absenceType.id)}
        selectedRowId={
          selectedTypeId === null ? undefined : String(selectedTypeId)
        }
        onRowClick={(absenceType) => setSelectedTypeId(absenceType.id)}
        isLoading={isLoading}
        ariaLabel="Listado de tipos de ausencia"
        emptyMessage={
          isError
            ? "No se pudieron cargar los tipos de ausencia."
            : "No hay tipos de ausencia disponibles."
        }
      />
    </section>
  )
}
