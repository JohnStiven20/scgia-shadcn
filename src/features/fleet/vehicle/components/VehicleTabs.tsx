import type { ReactNode } from "react"
import {
  Car,
  ClipboardList,
  FileText,
  Gauge,
  History,
  Info,
  Settings,
  SlidersHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"
import { VehicleDocumentsSection } from "./documents/VehicleDocumentsSection"
import { VehicleSettingsSection } from "./settings/VehicleSettingsSection"
import { VehicleTelemetryHistoryTab } from "./VehicleTelemetryHistoryTab"
import { VehicleTelemetryTab } from "./telemetry/VehicleTelemetryTab"

type VehicleTabsProps = {
  canCreateExpiration: boolean
  canDeleteExpiration: boolean
  canUpdateExpiration: boolean
  canUpdateSettings: boolean
  canViewExpirations: boolean
  canViewLiveTelemetry: boolean
  canViewSettings: boolean
  canViewTelemetryHistory: boolean
  vehicle: Vehicle
}

export function VehicleTabs({
  canCreateExpiration,
  canDeleteExpiration,
  canUpdateExpiration,
  canUpdateSettings,
  canViewExpirations,
  canViewLiveTelemetry,
  canViewSettings,
  canViewTelemetryHistory,
  vehicle,
}: VehicleTabsProps) {
  return (
    <Tabs defaultValue="datos" className="gap-4">
      <VehicleTabsList
        canViewExpirations={canViewExpirations}
        canViewLiveTelemetry={canViewLiveTelemetry}
        canViewSettings={canViewSettings}
        canViewTelemetryHistory={canViewTelemetryHistory}
      />

      <TabsContent value="datos">
        <VehicleDataTab vehicle={vehicle} />
      </TabsContent>
      {canViewLiveTelemetry ? (
        <TabsContent value="telemetria">
          <VehicleTelemetryTab vehicle={vehicle} />
        </TabsContent>
      ) : null}
      {canViewTelemetryHistory ? (
        <TabsContent value="historial-telemetria">
          <VehicleTelemetryHistoryTab vehicleId={vehicle.id} vehicle={vehicle} />
        </TabsContent>
      ) : null}
      {canViewExpirations ? (
        <TabsContent value="documentos">
          <VehicleDocumentsSection
            vehicle={vehicle}
            canCreateExpiration={canCreateExpiration}
            canDeleteExpiration={canDeleteExpiration}
            canUpdateExpiration={canUpdateExpiration}
          />
        </TabsContent>
      ) : null}
      {canViewSettings ? (
        <TabsContent value="ajustes">
          <VehicleSettingsSection
            vehicle={vehicle}
            canUpdateSettings={canUpdateSettings}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  )
}

function VehicleTabsList({
  canViewExpirations,
  canViewLiveTelemetry,
  canViewSettings,
  canViewTelemetryHistory,
}: {
  canViewExpirations: boolean
  canViewLiveTelemetry: boolean
  canViewSettings: boolean
  canViewTelemetryHistory: boolean
}) {
  return (
    <TabsList className="h-10 w-full justify-start overflow-x-auto sm:h-8">
      <VehicleTabsTrigger value="datos" icon={<Car />}>
        Datos del vehiculo
      </VehicleTabsTrigger>
      {canViewLiveTelemetry ? (
        <VehicleTabsTrigger value="telemetria" icon={<Gauge />}>
          Telemetria
        </VehicleTabsTrigger>
      ) : null}
      {canViewTelemetryHistory ? (
        <VehicleTabsTrigger value="historial-telemetria" icon={<History />}>
          Historial
        </VehicleTabsTrigger>
      ) : null}
      {canViewExpirations ? (
        <VehicleTabsTrigger value="documentos" icon={<FileText />}>
          Documentos
        </VehicleTabsTrigger>
      ) : null}
      {canViewSettings ? (
        <VehicleTabsTrigger value="ajustes" icon={<SlidersHorizontal />}>
          Ajustes
        </VehicleTabsTrigger>
      ) : null}
    </TabsList>
  )
}

function VehicleTabsTrigger({
  icon,
  value,
  children,
}: {
  icon: ReactNode
  value: string
  children: ReactNode
}) {
  return (
    <TabsTrigger
      className="gap-2 px-3 py-1 text-sm sm:px-2 sm:py-0 sm:text-xs"
      value={value}
    >
      <span className="text-muted-foreground [&>svg]:size-4 sm:[&>svg]:size-3.5">
        {icon}
      </span>
      {children}
    </TabsTrigger>
  )
}

function VehicleDataTab({ vehicle }: { vehicle: Vehicle }) {
  const workerName = [vehicle.workerName, vehicle.workerSurname]
    .filter(Boolean)
    .join(" ")

  return (
    <Card className="border-border/80 py-4 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-1">
        <CardTitle className="text-xl font-semibold">
          Datos del vehiculo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Informacion registrada del vehiculo y su operacion actual.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-3">
          <VehicleInfoSection
            icon={<ClipboardList />}
            title="Identificacion"
            rows={[
              ["Codigo interno", valueOrFallback(vehicle.internalCode)],
              ["Matricula", valueOrFallback(vehicle.licensePlate)],
              ["VIN", valueOrFallback(vehicle.vin)],
              [
                "Kilometraje inicial",
                formatKilometers(vehicle.initialOdometer),
              ],
              ["Odometro actual", formatKilometers(vehicle.currentOdometer)],
              [
                "Primera matriculacion",
                valueOrFallback(vehicle.firstRegistrationDate),
              ],
              [
                "Dispositivo telematico",
                valueOrFallback(
                  vehicle.telemetryDeviceIdentifier,
                  "Sin dispositivo"
                ),
              ],
            ]}
            footer={
              <div className="mt-3 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  El kilometraje mostrado corresponde al ultimo valor disponible
                  en el sistema.
                </span>
              </div>
            }
          />

          <VehicleInfoSection
            icon={<Car />}
            title="Caracteristicas del vehiculo"
            rows={[
              ["Marca", valueOrFallback(vehicle.brandName)],
              ["Modelo", valueOrFallback(vehicle.modelName)],
              ["Tipo", "Furgoneta"],
              ["Combustible", "Combustion"],
              [
                "Disponibilidad",
                <AvailabilityBadge
                  key="availability"
                  available={vehicle.available}
                />,
              ],
              ["Categoria operativa", "Transporte ligero"],
              ["Color", valueOrFallback(vehicle.color, "Sin definir")],
            ]}
          />

          <VehicleInfoSection
            icon={<Settings />}
            title="Gestion y operacion"
            rows={[
              ["Estado", <StatusBadge key="status" status={vehicle.status} />],
              ["Empleado asignado", workerName || "Sin asignar"],
              ["Proveedor", "Sin proveedor"],
              [
                "Almacen",
                valueOrFallback(vehicle.warehouseName, "Sin almacen"),
              ],
              ["Centro de coste", "Sin definir"],
              ["Asignado desde", "Sin registro"],
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function VehicleInfoSection({
  icon,
  title,
  rows,
  footer,
}: {
  icon: ReactNode
  title: string
  rows: Array<[string, ReactNode]>
  footer?: ReactNode
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary [&>svg]:size-4">{icon}</span>
        {title}
      </h3>
      <dl>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b py-2 last:border-b-0"
          >
            <dt className="min-w-0 text-sm text-muted-foreground">{label}</dt>
            <dd className="max-w-48 truncate text-right text-sm font-semibold">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {footer}
    </section>
  )
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        available
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-700"
      }
    >
      {available ? "Disponible" : "No disponible"}
    </Badge>
  )
}

function StatusBadge({ status }: { status: Vehicle["status"] }) {
  const label = getStatusLabel(status)
  const isAvailable = status === "AVAILABLE"

  return (
    <Badge
      variant="outline"
      className={
        isAvailable
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }
    >
      {label}
    </Badge>
  )
}

function getStatusLabel(status: Vehicle["status"]) {
  const labels: Record<Vehicle["status"], string> = {
    AVAILABLE: "Disponible",
    ASSIGNED: "Asignado",
    IN_MAINTENANCE: "En mantenimiento",
    OUT_OF_SERVICE: "Fuera de servicio",
  }

  return labels[status]
}

function formatKilometers(value?: number | null) {
  return value == null ? "Sin registro" : `${value.toLocaleString("es-ES")} km`
}

function valueOrFallback(value?: string | null, fallback = "Sin registro") {
  return value?.trim() || fallback
}
