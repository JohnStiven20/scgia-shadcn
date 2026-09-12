import { createColumnHelper } from "@tanstack/react-table"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  Archive,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Package,
  ScanLine,
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
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TelecommunicationItemModelResponse } from "@/features/interface/models/types/model.types"
import type { TelecommunicationSpecificItemHistoryResponse } from "@/features/interface/products/telecommunicationSpecificItemHistory"
import type { TelecommunicationSpecificModelInventorySummaryResponse } from "@/features/interface/products/products.type"
import { InventoryPageHeader } from "../../components"
import { useGetSpecificModelInventorySummaryQuery } from "../../api/products.service"
import { useGetModelCatalogQuery } from "../../api/modelsApi"
import { useLazyGetTelecommunicationSpecificItemHistoryQuery } from "../../api/telecommunicationSpecificItemHistoryApi"
import { useInventoryScanner } from "../../entry/hooks/useInventoryScanner"
import { ProductUnitDetail } from "../components/ProductUnitDetail"
import { extractUnitCode } from "../components/productUnitHistory"

type ProductTableRow = {
  id: number
  modelName: string | null
  totalRegistered: number | null
  activeQuantity: number | null
  assignedQuantity: number | null
  brokenQuantity: number | null
  installedQuantity: number | null
}

const columnHelper = createColumnHelper<DataTableFeatures, ProductTableRow>()

function metricCell(value: number | null, icon: LucideIcon, className: string) {
  const Icon = icon

  return (
    <span className="inline-flex items-center">
      {value == null ? (
        "—"
      ) : (
        <Badge
          variant="outline"
          className={`h-6 gap-1.5 px-2.5 text-xs [&>svg]:size-3! ${className}`}
        >
          <Icon aria-hidden="true" />
          {value.toLocaleString("es-ES")}
        </Badge>
      )}
    </span>
  )
}

const productColumns = columnHelper.columns([
  columnHelper.accessor((product) => product.modelName ?? "", {
    id: "modelName",
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
            alt=""
            className="absolute inset-0 size-full object-contain p-1"
          />
        </AspectRatio>
        <span className="min-w-0 truncate font-medium">
          {row.original.modelName || "Modelo sin nombre"}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("totalRegistered", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total registrado"
        className="px-0"
      />
    ),
    size: 145,
    minSize: 125,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      metricCell(
        row.original.totalRegistered,
        Package,
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
      ),
  }),
  columnHelper.accessor("activeQuantity", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activas" className="px-0" />
    ),
    size: 115,
    minSize: 100,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      metricCell(
        row.original.activeQuantity,
        CheckCircle2,
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
      ),
  }),
  columnHelper.accessor("assignedQuantity", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Asignadas"
        className="px-0"
      />
    ),
    size: 125,
    minSize: 105,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      metricCell(
        row.original.assignedQuantity,
        UserRound,
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
      ),
  }),
  columnHelper.accessor("brokenQuantity", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rotas" className="px-0" />
    ),
    size: 105,
    minSize: 90,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      metricCell(
        row.original.brokenQuantity,
        CircleAlert,
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
      ),
  }),
  columnHelper.accessor("installedQuantity", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Instaladas"
        className="px-0"
      />
    ),
    size: 125,
    minSize: 105,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      metricCell(
        row.original.installedQuantity,
        Wrench,
        "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400"
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

function toSpecificProductRow(
  product: TelecommunicationSpecificModelInventorySummaryResponse
): ProductTableRow {
  return {
    id: product.modelId,
    modelName: product.modelName,
    totalRegistered: product.totalRegistered,
    activeQuantity: product.activeQuantity,
    assignedQuantity: product.assignedQuantity,
    brokenQuantity: product.brokenQuantity,
    installedQuantity: product.installedQuantity,
  }
}

function toConsumableRow(
  model: TelecommunicationItemModelResponse
): ProductTableRow {
  return {
    id: model.id,
    modelName: model.name,
    totalRegistered: null,
    activeQuantity: null,
    assignedQuantity: null,
    brokenQuantity: null,
    installedQuantity: null,
  }
}

function ProductsTable({
  data,
  isLoading,
  emptyMessage,
  onRowClick,
}: {
  data: ProductTableRow[]
  isLoading: boolean
  emptyMessage: string
  onRowClick?: (row: ProductTableRow) => void
}) {
  return (
    <DataTable
      columns={productColumns}
      data={data}
      pageSize={5}
      pageSizeOptions={[5, 10, 20]}
      getRowId={(row) => String(row.id)}
      onRowClick={onRowClick}
      isLoading={isLoading}
      ariaLabel="Listado de productos"
      emptyMessage={emptyMessage}
      renderToolbar={(table) => (
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="min-w-56 flex-1">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={String(table.state.globalFilter ?? "")}
              placeholder="Buscar modelo..."
              aria-label="Buscar por nombre de modelo"
              onChange={(event) => {
                table.setGlobalFilter(event.target.value)
                table.setPageIndex(0)
              }}
            />
          </InputGroup>
        </div>
      )}
    />
  )
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false)
  const [unitCodeInput, setUnitCodeInput] = useState("")
  const [scannedHistory, setScannedHistory] =
    useState<TelecommunicationSpecificItemHistoryResponse>()
  const [scanError, setScanError] = useState<string | null>(null)
  const [getUnitHistory, unitHistoryQuery] =
    useLazyGetTelecommunicationSpecificItemHistoryQuery()
  const {
    data: specificProducts = [],
    isLoading: isLoadingSpecific,
    isError,
  } = useGetSpecificModelInventorySummaryQuery()
  const { data: models = [], isLoading: isLoadingModels } =
    useGetModelCatalogQuery()

  const specificRows = specificProducts.map(toSpecificProductRow)
  const consumableRows = models
    .filter((model) => model.telecommunicationItemType === "GENERIC")
    .map(toConsumableRow)

  async function lookupUnit(unitCode: string) {
    const normalizedUnitCode = unitCode.trim()

    setScanError(null)
    setScannedHistory(undefined)

    if (!normalizedUnitCode) {
      setScanError("Introduce un código de unidad.")
      return
    }

    if (normalizedUnitCode.length < 12) {
      setScanError("El código de unidad debe tener al menos 12 caracteres.")
      return
    }

    setUnitCodeInput(normalizedUnitCode)

    try {
      const response = await getUnitHistory(normalizedUnitCode).unwrap()
      setScannedHistory(response)
    } catch {
      setScanError("No se pudo obtener el historial de la unidad.")
    }
  }

  function handleScannerCode(rawCode: string) {
    const unitCode = extractUnitCode(rawCode)

    setScannerDialogOpen(true)
    setUnitCodeInput(unitCode)
    void lookupUnit(unitCode)
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void lookupUnit(unitCodeInput)
  }

  function openScannerDialog() {
    setUnitCodeInput("")
    setScannedHistory(undefined)
    setScanError(null)
    setScannerDialogOpen(true)
  }

  function closeScannerDialog() {
    setScannerDialogOpen(false)
    setScannedHistory(undefined)
    setScanError(null)
  }

  useInventoryScanner({
    onScanCode: handleScannerCode,
  })

  return (
    <section className="flex flex-col gap-6" aria-label="Productos">
      <InventoryPageHeader
        action={
          <Button type="button" variant="outline" onClick={openScannerDialog}>
            <ScanLine />
            Escanear dispositivo
          </Button>
        }
        title="Productos"
        description="Consulta productos específicos y consumibles registrados en el inventario."
      />

      <Tabs defaultValue="products" className="min-w-0 gap-4">
        <TabsList
          variant="default"
          className="w-full min-w-50 justify-start border-b"
        >
          <TabsTrigger value="products" className="gap-2 px-4 py-2 text-sm">
            <Archive />
            Productos
          </TabsTrigger>
          <TabsTrigger value="consumables" className="gap-2 px-4 py-2 text-sm">
            <Package />
            Consumibles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="min-w-0">
          <ProductsTable
            data={specificRows}
            isLoading={isLoadingSpecific}
            onRowClick={(row) => navigate(`/inventory/products/${row.id}`)}
            emptyMessage={
              isError
                ? "No se pudieron cargar los productos."
                : "No hay productos que coincidan con la búsqueda."
            }
          />
        </TabsContent>
        <TabsContent value="consumables" className="min-w-0">
          <ProductsTable
            data={consumableRows}
            isLoading={isLoadingModels}
            emptyMessage="No hay consumibles registrados."
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={scannerDialogOpen}
        onOpenChange={(open) => {
          if (open) setScannerDialogOpen(true)
          else closeScannerDialog()
        }}
      >
        <DialogContent className="max-h-[min(92svh,56rem)] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {scannedHistory?.item ? "Producto encontrado" : "Buscar producto"}
            </DialogTitle>
            <DialogDescription>
              Introduce el código de unidad o escanea un dispositivo DataMatrix.
            </DialogDescription>
          </DialogHeader>

          <form className="flex items-end gap-2" onSubmit={handleManualSubmit}>
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="product-unit-code">
                Código de unidad
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <ScanLine />
                </InputGroupAddon>
                <InputGroupInput
                  id="product-unit-code"
                  value={unitCodeInput}
                  placeholder="Introduce el código de unidad"
                  onChange={(event) => {
                    setUnitCodeInput(event.target.value)
                    setScanError(null)
                  }}
                />
              </InputGroup>
            </Field>
            <Button
              type="submit"
              disabled={unitHistoryQuery.isFetching}
              className="shrink-0"
            >
              Buscar
            </Button>
          </form>

          {scanError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive"
            >
              {scanError}
            </p>
          ) : null}

          {unitHistoryQuery.isFetching ? (
            <div className="grid gap-3" aria-label="Cargando detalle">
              <div className="h-16 animate-pulse rounded-md bg-muted" />
              <div className="h-48 animate-pulse rounded-md bg-muted" />
            </div>
          ) : unitHistoryQuery.isError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive"
            >
              No se pudo cargar el detalle de la unidad.
            </p>
          ) : scannedHistory ? (
            <ProductUnitDetail response={scannedHistory} />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeScannerDialog}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
