import { createColumnHelper } from "@tanstack/react-table"
import { Box, Plus, Search } from "lucide-react"
import { useState } from "react"

import { DataTable, DataTableColumnHeader } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { WorkOrderSpecificItemLineResponse } from "@/features/interface/work-orders/types"
import { AddWorkOrderProductDialog } from "./AddWorkOrderProductDialog"

const columnHelper = createColumnHelper<DataTableFeatures, WorkOrderSpecificItemLineResponse>()
const statusConfig: Record<string, { label: string; className: string }> = {
  INSTALLED: { label: "Instalado", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  CONSUMED: { label: "Consumido", className: "border-slate-200 bg-slate-100 text-slate-700" },
  PENDING: { label: "Pendiente", className: "border-amber-200 bg-amber-50 text-amber-700" },
}
const columns = columnHelper.columns([
  columnHelper.display({ id: "index", header: "#", size: 55, minSize: 45, cell: ({ row }) => row.index + 1 }),
  columnHelper.accessor("modelName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo" className="px-0" />, size: 250, minSize: 180 }),
  columnHelper.accessor("uniqueCode", { header: ({ column }) => <DataTableColumnHeader column={column} title="Código / MAC" className="px-0" />, size: 220, minSize: 160, cell: ({ row }) => row.original.uniqueCode || "—" }),
  columnHelper.accessor("typeUnicode", { header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" className="px-0" />, size: 130, minSize: 100 }),
  columnHelper.accessor("identifierCode", { header: ({ column }) => <DataTableColumnHeader column={column} title="Identificador" className="px-0" />, size: 190, minSize: 150, cell: ({ row }) => row.original.identifierCode || "—" }),
  columnHelper.accessor("status", { header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" className="px-0" />, size: 140, minSize: 120, cell: ({ row }) => { const status = statusConfig[row.original.status] ?? { label: row.original.status || "Sin estado", className: "border-slate-200 bg-slate-50 text-slate-700" }; return <Badge variant="outline" className={`h-6 px-2.5 text-xs ${status.className}`}>{status.label}</Badge> } }),
])

type WorkOrderProductsProps = {
  products: WorkOrderSpecificItemLineResponse[]
  isLoading: boolean
  workOrderId: number
  workerId?: number
  onProductAdded?: () => void
}

export function WorkOrderProducts({ products, isLoading, workOrderId, workerId, onProductAdded }: WorkOrderProductsProps) {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const visibleProducts = products.filter((product) => [product.modelName, product.uniqueCode, product.typeUnicode, product.identifierCode, product.status].some((value) => value?.toLowerCase().includes(search.toLowerCase())))


  return (
    <>
      <DataTable
        columns={columns}
        data={visibleProducts}
        getRowId={(row) => String(row.workOrderSpecificItemId)}
        isLoading={isLoading}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        ariaLabel="Productos de la orden de trabajo"
        emptyMessage="No hay productos asociados a esta orden."
        renderToolbar={() => (
          <div className="flex flex-wrap items-center gap-2">
            <Box className="size-5 text-primary" aria-hidden="true" />
            <span className="font-semibold">Productos ({products.length})</span>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <InputGroup className="w-64 max-w-full">
                <InputGroupAddon><Search /></InputGroupAddon>
                <InputGroupInput value={search} placeholder="Buscar por modelo o código..." onChange={(event) => setSearch(event.target.value)} />
              </InputGroup>
              <Button type="button" disabled={true} onClick={() => setDialogOpen(true)}><Plus /> Añadir producto</Button>
            </div>
          </div>
        )}
      />
      <AddWorkOrderProductDialog open={dialogOpen} workOrderId={workOrderId} workerId={workerId} onOpenChange={setDialogOpen} onProductAdded={onProductAdded} />
    </>
  )
}
