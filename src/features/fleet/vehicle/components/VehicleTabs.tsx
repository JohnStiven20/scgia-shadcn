import type { ReactNode } from "react"
import {
  CalendarDays,
  Car,
  ClipboardList,
  FileText,
  Gauge,
  Info,
  Settings,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

export function VehicleTabs({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Tabs defaultValue="datos" className="gap-4">
      <VehicleTabsList />

      <TabsContent value="datos">
        <VehicleDataTab vehicle={vehicle} />
      </TabsContent>
      <TabsContent value="telemetria">
        <VehicleTelemetryTab />
      </TabsContent>
      <TabsContent value="documentos">
        <VehicleDocumentsTab />
      </TabsContent>
      <TabsContent value="ajustes">
        <VehicleSettingsTab />
      </TabsContent>
    </Tabs>
  )
}

function VehicleTabsList() {
  return (
    <TabsList className="h-10 w-full justify-start overflow-x-auto sm:h-8">
      <VehicleTabsTrigger value="datos" icon={<Car />}>
        Datos del vehículo
      </VehicleTabsTrigger>
      <VehicleTabsTrigger value="telemetria" icon={<Gauge />}>
        Telemetría
      </VehicleTabsTrigger>
      <VehicleTabsTrigger value="documentos" icon={<FileText />}>
        Documentos
      </VehicleTabsTrigger>
      <VehicleTabsTrigger value="ajustes" icon={<SlidersHorizontal />}>
        Ajustes
      </VehicleTabsTrigger>
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
          Datos del vehículo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Información registrada del vehículo y su operación actual.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-3">
          <VehicleInfoSection
            icon={<ClipboardList />}
            title="Identificación"
            rows={[
              ["Código interno", valueOrFallback(vehicle.internalCode)],
              ["Matrícula", valueOrFallback(vehicle.licensePlate)],
              ["VIN", valueOrFallback(vehicle.vin)],
              [
                "Kilometraje inicial",
                formatKilometers(vehicle.initialOdometer),
              ],
              ["Odómetro actual", formatKilometers(vehicle.currentOdometer)],
              [
                "Primera matriculación",
                valueOrFallback(vehicle.firstRegistrationDate),
              ],
              [
                "Dispositivo telemático",
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
                  El kilometraje mostrado corresponde al último valor disponible
                  en el sistema.
                </span>
              </div>
            }
          />

          <VehicleInfoSection
            icon={<Car />}
            title="Características del vehículo"
            rows={[
              ["Marca", valueOrFallback(vehicle.brandName)],
              ["Modelo", valueOrFallback(vehicle.modelName)],
              ["Tipo", "Furgoneta"],
              ["Combustible", "Combustión"],
              [
                "Disponibilidad",
                <AvailabilityBadge
                  key="availability"
                  available={vehicle.available}
                />,
              ],
              ["Categoría operativa", "Transporte ligero"],
              ["Color", valueOrFallback(vehicle.color, "Sin definir")],
            ]}
          />

          <VehicleInfoSection
            icon={<Settings />}
            title="Gestión y operación"
            rows={[
              ["Estado", <StatusBadge key="status" status={vehicle.status} />],
              ["Empleado asignado", workerName || "Sin asignar"],
              ["Proveedor", "Sin proveedor"],
              [
                "Almacén",
                valueOrFallback(vehicle.warehouseName, "Sin almacén"),
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

function VehicleTelemetryTab() {
  return (
    <p className="text-muted-foreground">
      La telemetría estará disponible próximamente.
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

function VehicleSettingsTab() {
  return (
    <p className="text-muted-foreground">
      Los ajustes estarán disponibles próximamente.
    </p>
  )
}
