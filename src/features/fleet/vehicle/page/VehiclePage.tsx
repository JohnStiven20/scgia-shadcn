import type { ReactNode } from "react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  CalendarDays,
  Gauge,
  Pencil,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import vehicleImage from "@/assets/furgoneta.png"
import {
  useDeleteVehicleMutation,
  useFindVehicleByIdQuery,
  useUpdateVehicleMutation,
} from "@/features/fleet/api/apiVehicle"
import { VehicleEditDialog } from "@/features/fleet/vehicle/components/VehicleEditDialog"
import { VehicleTabs } from "@/features/fleet/vehicle/components/VehicleTabs"
import type { UpdateVehicleRequest } from "@/features/interface/vehicle/request/update-vehicle-request"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"
import {
    Map,
    MapControls,
    MapRoute,
    MarkerContent,
    MarkerLabel,
    RouteMarker,
    RouteProgress,
} from "@/components/ui/map"
import { MOCK_TORREVIEJA_ROUTE } from "./mockTorreviejaRoute"

const MOCK_ROUTE_UPDATE_INTERVAL = 5_000

function VehicleBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/fleet" />}>Flota</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Detalle del vehículo</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function VehicleDetailsCard({
  vehicle,
  onDelete,
  onEdit,
}: {
  vehicle: Vehicle
  onDelete: () => void
  onEdit: () => void
}) {
  const driverName = [vehicle.workerName, vehicle.workerSurname]
    .filter(Boolean)
    .join(" ")

  return (
    <article aria-labelledby="vehicle-details-title">
      <Card className="border-border/80 py-3 [--card-spacing:--spacing(3)]">
        <CardHeader className="grid gap-3 border-b pb-4 lg:grid-cols-[9rem_1fr_auto] lg:items-start">
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
                  <span className="leading-none font-bold">E</span>
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
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
              Eliminar
            </Button>
            <Button type="button" onClick={onEdit}>
              <Pencil />
              Editar
            </Button>
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
    const [routeIndex, setRouteIndex] = useState(0)
    const [lastUpdated, setLastUpdated] = useState(() => new Date())

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setRouteIndex((currentIndex) =>
                (currentIndex + 1) % MOCK_TORREVIEJA_ROUTE.length,
            )
            setLastUpdated(new Date())
        }, MOCK_ROUTE_UPDATE_INTERVAL)

        return () => window.clearInterval(intervalId)
    }, [])

    const progress = routeIndex / (MOCK_TORREVIEJA_ROUTE.length - 1)
    const currentPosition = MOCK_TORREVIEJA_ROUTE[routeIndex]

    return (
        <Card className="overflow-hidden border-border/80">
            <CardHeader className="gap-2 border-b sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold">Ruta del vehículo</h2>
                    <p className="text-sm text-muted-foreground">
                        Recorrido simulado por Torrevieja.
                    </p>
                </div>
                <Badge variant="secondary" className="w-fit gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Datos simulados · 5 s
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative h-[360px] w-full sm:h-[440px]">
                    <Map
                        className="absolute inset-0"
                        center={[-0.6848, 37.976]}
                        zoom={13}
                    >
                        <MapRoute
                            coordinates={MOCK_TORREVIEJA_ROUTE}
                            progress={progress}
                            color="#94a3b8"
                            width={5}
                            opacity={0.8}
                            dashArray={[0.5, 1.5]}
                        >
                            <RouteProgress color="#2563eb" width={5} opacity={1} />

                            <RouteMarker at="start">
                                <MarkerContent>
                                    <div className="size-3.5 rounded-full border-2 border-foreground bg-background shadow-md" />
                                </MarkerContent>
                            </RouteMarker>

                            <RouteMarker at="progress">
                                <MarkerContent>
                                    <div className="ring-background grid size-9 place-items-center rounded-full bg-blue-600 text-white shadow-md ring-2">
                                        <Car className="size-4" />
                                    </div>
                                    <MarkerLabel
                                        position="top"
                                        className="rounded-md border border-border/50 bg-background/90 px-1.5 py-0.5 text-xs tabular-nums shadow-sm"
                                    >
                                        {Math.round(progress * 100)}%
                                    </MarkerLabel>
                                </MarkerContent>
                            </RouteMarker>

                            <RouteMarker at="end">
                                <MarkerContent>
                                    <div className="size-3.5 rounded-full bg-foreground shadow-md ring-2 ring-background" />
                                </MarkerContent>
                            </RouteMarker>
                        </MapRoute>
                        <MapControls showCompass showFullscreen />
                    </Map>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
                    <div>
                        <p className="font-medium">Posición actual</p>
                        <p className="text-muted-foreground">
                            {currentPosition[1].toFixed(5)}, {currentPosition[0].toFixed(5)}
                        </p>
                    </div>
                    <p className="text-muted-foreground">
                        Actualizado a las {lastUpdated.toLocaleTimeString("es-ES")}
                    </p>
                </div>
            </CardContent>
        </Card>
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
  const navigate = useNavigate()
  const { id } = useParams()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const vehicleId = Number(id)
  const isValidVehicleId = Number.isInteger(vehicleId) && vehicleId > 0
  const {
    data: vehicle,
    isLoading,
    isError,
  } = useFindVehicleByIdQuery(vehicleId, {
    skip: !isValidVehicleId,
  })
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation()
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation()

  async function handleUpdateVehicle(request: UpdateVehicleRequest) {
    await updateVehicle({
      id: vehicleId,
      request,
    }).unwrap()
    setEditDialogOpen(false)
  }

  async function handleDeleteVehicle() {
    await deleteVehicle({ id: vehicleId }).unwrap()
    navigate("/fleet")
  }

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
      <h1 className="text-2xl font-semibold">Detalle del vehículo</h1>

      <VehicleDetailsCard
        vehicle={vehicle}
        onDelete={() => setDeleteDialogOpen(true)}
        onEdit={() => setEditDialogOpen(true)}
      />

      <VehicleTabs vehicle={vehicle} />

      <VehicleEditDialog
        open={editDialogOpen}
        vehicle={vehicle}
        loading={isUpdating}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdateVehicle}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title="Eliminar vehículo"
        subtitle={`Vas a eliminar el vehículo ${vehicle.internalCode}.`}
        loading={isDeleting}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteVehicle}
      />
    </section>
  )
}
