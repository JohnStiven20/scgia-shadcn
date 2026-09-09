
import type { ReactNode } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { CalendarDays, Gauge, Smartphone, UserRound } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import vehicleImage from "@/assets/furgoneta.png"
import { useFindVehicleByIdQuery } from "@/features/fleet/api/apiVehicle"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

function VehicleBreadcrumb() {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink render={<Link to="/fleet" />}>
                        Flota
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Detalle del vehículo</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

function VehicleDetailsCard({ vehicle }: { vehicle: Vehicle }) {
    const driverName = [vehicle.workerName, vehicle.workerSurname]
        .filter(Boolean)
        .join(" ")

    return (
        <article aria-labelledby="vehicle-details-title">
            <Card className="border-border/80 py-3 [--card-spacing:--spacing(3)]">
                <CardHeader className="grid gap-3 border-b pb-4 sm:grid-cols-[9rem_1fr] sm:items-center">
                <AspectRatio
                    ratio={4 / 3}
                    className="w-full max-w-36 overflow-hidden rounded-md bg-muted"
                >
                    <img
                        src={vehicleImage}
                        alt="Imagen del vehículo"
                        className="absolute inset-0 size-full object-contain"
                    />
                </AspectRatio>
                <div className="min-w-0">
                    <h2
                        id="vehicle-details-title"
                        className="text-xl font-bold break-words"
                    >
                        {vehicle.internalCode}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {vehicle.brandName} {vehicle.modelName} - Año no disponible
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="h-auto gap-0 overflow-hidden rounded-md p-0 text-xs font-normal"
                            aria-label={`Matrícula: ${vehicle.licensePlate || "Sin dato"}`}
                        >
                            <span className="flex min-h-8 w-7 flex-col items-center justify-center bg-blue-600 text-white">
                                <span className="size-1.5 rounded-full bg-yellow-400" />
                                <span className="font-bold leading-none">E</span>
                            </span>
                            <span className="px-2 text-base text-foreground">
                                {vehicle.licensePlate || "-"}
                            </span>
                        </Badge>
                        <span className="text-muted-foreground">
                            VIN: {vehicle.vin || "Sin dato"}
                        </span>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
                <VehicleDetailItem
                    icon={<UserRound />}
                    label="Conductor"
                    value={driverName || "Sin asignar"}
                />
                <VehicleDetailItem
                    icon={<Gauge />}
                    label="Kilometraje actual"
                    value={
                        vehicle.currentOdometer == null
                            ? "Sin dato"
                            : `${vehicle.currentOdometer.toLocaleString("es-ES")} km`
                    }
                />
                <VehicleDetailItem
                    icon={<Smartphone />}
                    label="Dispositivo"
                    value={vehicle.telemetryDeviceIdentifier || "Sin vincular"}
                />
                <VehicleDetailItem
                    icon={<CalendarDays />}
                    label="Primera matriculación"
                    value={vehicle.firstRegistrationDate || "Sin dato"}
                />
                    </dl>
                </CardContent>
            </Card>
        </article>
    )
}

function VehicleDetailItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex gap-2 border-b py-3 last:border-b-0 sm:nth-[n+3]:border-b-0">
            <span className="text-muted-foreground [&>svg]:size-5">{icon}</span>
            <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm font-semibold">{value}</dd>
            </div>
        </div>
    )
}

function VehicleSummaryTab() {
    return (
        <p className="text-muted-foreground">
            Información general y operativa del vehículo.
        </p>
    )
}

function VehicleTelemetryTab() {
    return (
        <p className="text-muted-foreground">
            La telemetría estará disponible próximamente.
        </p>
    )
}

function VehicleTelemetryHistoryTab() {
    return (
        <p className="text-muted-foreground">
            El registro de telemetría estará disponible próximamente.
        </p>
    )
}

function VehicleConfigurationTab() {
    return (
        <p className="text-muted-foreground">
            La configuración estará disponible próximamente.
        </p>
    )
}

function VehicleDocumentsTab() {
    return (
        <p className="text-muted-foreground">
            Los documentos estarán disponibles próximamente.
        </p>
    )
}

export const VehiclePage = () => {
    
    const { id } = useParams()
    const vehicleId = Number(id)
    const isValidVehicleId = Number.isInteger(vehicleId) && vehicleId > 0
    const { data: vehicle, isLoading, isError } = useFindVehicleByIdQuery(vehicleId, {
        skip: !isValidVehicleId,
    })

    if (!isValidVehicleId) {
        return (
            <section aria-label="Detalle del vehículo">
                <p>El identificador del vehículo no es válido.</p>
            </section>
        )
    }

    if (isLoading) {
        return (
            <section aria-label="Detalle del vehículo">
                <p>Cargando vehículo...</p>
            </section>
        )
    }

    if (isError || !vehicle) {
        return (
            <section aria-label="Detalle del vehículo">
                <p>No se pudo cargar el vehículo.</p>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-4" aria-label="Detalle del vehículo">
            
            <VehicleBreadcrumb />
            <h1 className="text-2xl font-semibold">Detalle del vehÃ­culo</h1>

            <VehicleDetailsCard vehicle={vehicle} />

            <Tabs defaultValue="resumen" className="gap-4">
                <TabsList className="h-10 w-full justify-start overflow-x-auto sm:h-8">
                    <TabsTrigger className="px-3 py-1 text-sm sm:px-1.5 sm:py-0 sm:text-xs" value="resumen">Resumen</TabsTrigger>
                    <TabsTrigger className="px-3 py-1 text-sm sm:px-1.5 sm:py-0 sm:text-xs" value="telemetria">Telemetría</TabsTrigger>
                    <TabsTrigger className="px-3 py-1 text-sm sm:px-1.5 sm:py-0 sm:text-xs" value="registro">Registro de telemetría</TabsTrigger>
                    <TabsTrigger className="px-3 py-1 text-sm sm:px-1.5 sm:py-0 sm:text-xs" value="configuracion">Configuración</TabsTrigger>
                    <TabsTrigger className="px-3 py-1 text-sm sm:px-1.5 sm:py-0 sm:text-xs" value="documentos">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen">
                    <VehicleSummaryTab />
                </TabsContent>
                <TabsContent value="telemetria">
                    <VehicleTelemetryTab />
                </TabsContent>
                <TabsContent value="registro">
                    <VehicleTelemetryHistoryTab />
                </TabsContent>
                <TabsContent value="configuracion">
                    <VehicleConfigurationTab />
                </TabsContent>
                <TabsContent value="documentos">
                    <VehicleDocumentsTab />
                </TabsContent>
            </Tabs>
            
        </section>
    )
}
