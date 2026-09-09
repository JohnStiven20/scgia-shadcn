import { useMemo } from "react"
import { createColumnHelper, type ReactTable } from "@tanstack/react-table"
import { Check, Plus, RotateCcw, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

import vehicleImage from "@/assets/furgoneta.png"
import {
    DataTable,
    DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFindAllVehiclesQuery } from "@/features/fleet/api/apiVehicle"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"
import { FleetPageHeader } from "../../components/InventoryPageHeader"

const PAGE_SIZE_OPTIONS = [8, 10, 20, 50]

const columnHelper = createColumnHelper<DataTableFeatures, Vehicle>()

function getWorkerName(vehicle: Vehicle) {
    return [vehicle.workerName, vehicle.workerSurname]
        .filter(Boolean)
        .join(" ")
}

function VehicleStatusBadge({ available }: { available: boolean }) {
    const StatusIcon = available ? Check : X

    return (
        <Badge
            variant="outline"
            className="h-5 rounded-full px-1.5 text-[0.65rem] font-normal text-muted-foreground"
        >
            <span
                className={`flex size-2.5 items-center justify-center rounded-full text-white ${available ? "bg-emerald-500" : "bg-red-500"
                    }`}
            >
                <StatusIcon className="size-1.5" strokeWidth={2} />
            </span>
            {available ? "Activo" : "Inactivo"}
        </Badge>
    )
}

const vehicleColumns = columnHelper.columns([
    columnHelper.accessor("internalCode", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Vehículo" />
        ),
        size: 245,
        minSize: 210,
        filterFn: "includesString",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <AspectRatio
                    ratio={4 / 3}
                    className="w-12 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                    <img
                        src={vehicleImage}
                        alt="Imagen del vehículo"
                        className="absolute inset-0 size-full object-contain"
                    />
                </AspectRatio>
                <div className="min-w-0">
                    <p className="truncate font-medium">{row.original.licensePlate}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {row.original.internalCode}
                    </p>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("licensePlate", {
        header: () => null,
        cell: () => null,
        size: 0,
        minSize: 0,
        filterFn: "includesString",
        enableSorting: false,
    }),
    columnHelper.accessor("vin", {
        header: () => null,
        cell: () => null,
        size: 0,
        minSize: 0,
        filterFn: "includesString",
        enableSorting: false,
    }),
    columnHelper.accessor((vehicle) => String(vehicle.available), {
        id: "available",
        header: () => null,
        cell: () => null,
        size: 0,
        minSize: 0,
        filterFn: "equals",
        enableSorting: false,
    }),
    columnHelper.accessor("modelName", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modelo" />
        ),
        size: 100,
        minSize: 180,
        filterFn: "equals",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="truncate font-medium">{row.original.modelName}</p>
                <p className="truncate text-xs text-muted-foreground">
                    {row.original.brandName}
                </p>
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Estado de uso" />
        ),
        size: 150,
        minSize: 50,
        cell: ({ row }) => <VehicleStatusBadge available={row.original.available} />,
    }),
    columnHelper.accessor(getWorkerName, {
        id: "worker",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Conductor" />
        ),
        size: 150,
        minSize: 50,
        filterFn: "equals",
        cell: ({ row }) => getWorkerName(row.original) || "Sin asignar",
    }),
    columnHelper.accessor((vehicle) => vehicle.warehouseName ?? "", {
        id: "warehouse",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ubicación" />
        ),
        size: 150,
        minSize: 50,
        cell: ({ row }) => row.original.warehouseName || "Sin ubicación",
    }),
    columnHelper.display({
        id: "lastConnection",
        header: "Última conexión",
        size: 155,
        minSize: 130,
        enableSorting: false,
        cell: () => <span className="text-muted-foreground">Sin datos</span>,
    })
])

type VehiclesTable = ReactTable<DataTableFeatures, Vehicle>

type VehiclesToolbarProps = {
    table: VehiclesTable
    vehicles: Vehicle[]
}

function VehiclesToolbar({ table, vehicles }: VehiclesToolbarProps) {
    const getTextFilter = (columnId: string) =>
        String(table.getColumn(columnId)?.getFilterValue() ?? "")
    const modelFilter = String(table.getColumn("modelName")?.getFilterValue() ?? "ALL")
    const workerFilter = String(table.getColumn("worker")?.getFilterValue() ?? "ALL")
    const availabilityFilter = String(
        table.getColumn("available")?.getFilterValue() ?? "ALL"
    )

    const modelOptions = useMemo(
        () =>
            Array.from(
                new Map(vehicles.map((vehicle) => [vehicle.modelName, vehicle.modelName])).values()
            ).sort((first, second) => first.localeCompare(second, "es")),
        [vehicles]
    )
    const workerOptions = useMemo(
        () =>
            Array.from(
                new Set(vehicles.map(getWorkerName).filter(Boolean))
            ).sort((first, second) => first.localeCompare(second, "es")),
        [vehicles]
    )

    const setFilter = (columnId: string, value: string) => {
        table
            .getColumn(columnId)
            ?.setFilterValue(value === "ALL" || value === "" ? undefined : value)
        table.setPageIndex(0)
    }

    const clearFilters = () => {
        table.setColumnFilters([])
        table.setGlobalFilter("")
        table.setPageIndex(0)
    }

    return (
        <section className="grid gap-4" aria-label="Filtros de vehículos">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <div className="grid min-w-0 gap-1">
                    <Input
                        id="vehicle-internal-code"
                        value={getTextFilter("internalCode")}
                        placeholder="Código interno"
                        aria-label="Filtrar por código interno"
                        onChange={(event) => setFilter("internalCode", event.target.value)}
                    />
                </div>
                <div className="grid min-w-0 gap-1">
                    <Input
                        id="vehicle-license-plate"
                        value={getTextFilter("licensePlate")}
                        placeholder="Matrícula"
                        aria-label="Filtrar por matrícula"
                        onChange={(event) => setFilter("licensePlate", event.target.value)}
                    />
                </div>
                <div className="grid min-w-0 gap-1">
                    <Input
                        id="vehicle-vin"
                        value={getTextFilter("vin")}
                        placeholder="VIN"
                        aria-label="Filtrar por VIN"
                        onChange={(event) => setFilter("vin", event.target.value)}
                    />
                </div>
                <div className="grid min-w-0 gap-1">
                    <Select
                        value={modelFilter}
                        onValueChange={(value) => {
                            if (value) setFilter("modelName", value)
                        }}
                    >
                        <SelectTrigger id="vehicle-model" className="w-full min-w-0" aria-label="Filtrar por modelo">
                            <SelectValue className="min-w-0 truncate">
                                {modelFilter === "ALL" ? "Todos los modelos" : modelFilter}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {modelOptions.map((model) => (
                                <SelectItem key={model} value={model}>
                                    {model}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid min-w-0 gap-1">
                    <Select
                        value={workerFilter}
                        onValueChange={(value) => {
                            if (value) setFilter("worker", value)
                        }}
                    >
                        <SelectTrigger id="vehicle-worker" className="w-full min-w-0" aria-label="Filtrar por empleado">
                            <SelectValue className="min-w-0 truncate">
                                {workerFilter === "ALL" ? "Todos los empleados" : workerFilter}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {workerOptions.map((worker) => (
                                <SelectItem key={worker} value={worker}>
                                    {worker}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid min-w-0 gap-1">
                    <Select
                        value={availabilityFilter}
                        onValueChange={(value) => {
                            if (value) setFilter("available", value)
                        }}
                    >
                        <SelectTrigger
                            id="vehicle-availability"
                            className="w-full min-w-0"
                            aria-label="Filtrar por disponibilidad"
                        >
                            <SelectValue className="min-w-0 truncate">
                                {availabilityFilter === "true"
                                    ? "Disponible"
                                    : availabilityFilter === "false"
                                        ? "No disponible"
                                        : "Todas las disponibilidades"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="true">Disponible</SelectItem>
                            <SelectItem value="false">No disponible</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={clearFilters}>
                    <RotateCcw />
                    Limpiar
                </Button>
            </div>
        </section>
    )
}

export const VehiclesPage = () => {
    const navigate = useNavigate()
    const { data: vehicles = [], isLoading, isError } = useFindAllVehiclesQuery()

    return (
        <section className="flex flex-col gap-6" aria-label="Flota">
            <FleetPageHeader
                title="Flota"
                description="Gestiona y supervisa todos los vehículos de tu flota."
                action={
                    <Button type="button">
                        <Plus />
                        Nuevo vehículo
                    </Button>
                }
            />

            <section aria-label="Listado de vehículos">
                <DataTable
                    columns={vehicleColumns}
                    data={vehicles}
                    pageSize={8}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    initialColumnVisibility={{
                        licensePlate: false,
                        vin: false,
                        available: false,
                    }}
                    isLoading={isLoading}
                    getRowId={(vehicle) => String(vehicle.id)}
                    onRowClick={(vehicle) => navigate(`/fleet/vehicle/${vehicle.id}`)}
                    renderToolbar={(table) => (
                        <VehiclesToolbar table={table} vehicles={vehicles} />
                    )}
                    ariaLabel="Listado de vehículos"
                    emptyMessage={
                        isError
                            ? "No se pudieron cargar los vehículos."
                            : isLoading
                                ? "Cargando vehículos..."
                                : "No hay vehículos que coincidan con los filtros."
                    }
                />
            </section>
        </section>
    )
}
