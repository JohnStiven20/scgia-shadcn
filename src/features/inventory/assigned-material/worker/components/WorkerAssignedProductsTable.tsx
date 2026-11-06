import { useMemo, useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Search, Package } from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { WorkerAssignedProductResponse } from "../../interface/WorkerAssignedProductResponse"

type WorkerAssignedProductsTableProps = {
  products: WorkerAssignedProductResponse[]
  isLoading?: boolean
}

const columnHelper = createColumnHelper<DataTableFeatures, WorkerAssignedProductResponse>()

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export function WorkerAssignedProductsTable({ products, isLoading = false }: WorkerAssignedProductsTableProps) {
  const [search, setSearch] = useState("")
  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return products

    return products.filter((product) =>
      [product.modelName, product.uniqueCode, product.uniqueCodeType]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    )
  }, [products, search])

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("uniqueCode", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Código único" />,
          cell: ({ row }) => <span className="font-medium break-all">{row.original.uniqueCode}</span>,
          size: 220,
          minSize: 170,
        }),
        columnHelper.accessor("modelName", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo" />,
          size: 240,
          minSize: 180,
        }),
        columnHelper.accessor("uniqueCodeType", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
          cell: ({ row }) => <span className="rounded-full bg-muted px-2 py-1 text-xs">{row.original.uniqueCodeType}</span>,
          size: 130,
          minSize: 100,
        }),
        columnHelper.accessor("dateAssigned", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de asignación" />,
          cell: ({ row }) => formatDate(row.original.dateAssigned),
          size: 170,
          minSize: 150,
        }),
      ]),
    []
  )

  return (
    <Card aria-label="Productos asignados al trabajador">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Package className="size-5 text-blue-600" aria-hidden="true" />
          Productos asignados ({products.length})
        </CardTitle>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} placeholder="Buscar por código o modelo" className="pl-8" onChange={(event) => setSearch(event.target.value)} />
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <DataTable
          data={filteredProducts}
          columns={columns}
          getRowId={(product, index) => `${product.uniqueCode}-${index}`}
          pageSize={8}
          pageSizeOptions={[8, 16, 32]}
          isLoading={isLoading}
          ariaLabel="Productos asignados al trabajador"
          emptyMessage={search ? "No hay productos que coincidan con la búsqueda." : "No hay productos asignados."}
        />
      </CardContent>
    </Card>
  )
}
