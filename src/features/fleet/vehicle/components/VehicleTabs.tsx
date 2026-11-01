import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import {
  Car,
  Check,
  ClipboardList,
  FileText,
  Gauge,
  History,
  Settings,
  SlidersHorizontal,
  X,
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
  const availableTabs = [
    "datos",
    ...(canViewLiveTelemetry ? ["telemetria"] : []),
    ...(canViewTelemetryHistory ? ["historial-telemetria"] : []),
    ...(canViewExpirations ? ["documentos"] : []),
    ...(canViewSettings ? ["ajustes"] : []),
  ]
  const [selectedTab, setSelectedTab] = useState("datos")

  useEffect(() => {
    if (!availableTabs.includes(selectedTab)) {
      setSelectedTab("datos")
    }
  }, [availableTabs, selectedTab])

  function handleTabChange(value: string) {
    setSelectedTab(value)
  }

  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange} className="gap-4">
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
    <TabsList className="!h-12 w-full justify-start overflow-x-auto sm:!h-10 md:!h-10 lg:!h-8">
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
      className="!h-full gap-2 px-3 py-2 text-sm sm:px-3 sm:py-1.5 md:px-3 md:py-1.5 lg:px-2 lg:py-0 lg:text-xs"
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
              ["Matricula", valueOrFallback(vehicle.licensePlate)],
              ["VIN", valueOrFallback(vehicle.vin)],
              ["Codigo interno", valueOrFallback(vehicle.internalCode)],
              [
                "Dispositivo telematico",
                valueOrFallback(
                  vehicle.telemetryDeviceIdentifier,
                  "Sin dispositivo"
                ),
              ],
            ]}
          />

          <VehicleInfoSection
            icon={<Car />}
            title="Caracteristicas del vehiculo"
            rows={[
              ["Marca", valueOrFallback(vehicle.brandName)],
              ["Modelo", valueOrFallback(vehicle.modelName)],
              ["Tipo", "Furgoneta"],
              ["Combustible", "Combustión"],
              [
                "Color",
                <ColorValue key="color" value={vehicle.color} />,
              ],
            ]}
          />

          <VehicleInfoSection
            icon={<Settings />}
            title="Gestion y operacion"
            rows={[
              [
                "Estado de uso",
                <UsageStatusBadge key="usage-status" available={vehicle.available} />,
              ],
              ["Empleado asignado", workerName || "Sin asignar"],
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

function ColorValue({ value }: { value?: string | null }) {
  const color = value?.trim() || "#ffffff"
  const label = value?.trim() || "Sin definir"

  return (
    <span className="inline-flex min-w-0 items-center justify-end gap-2">
      <span
        aria-hidden="true"
        className="size-4 shrink-0 rounded-full border border-slate-300 shadow-inner"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{label}</span>
    </span>
  )
}

function UsageStatusBadge({ available }: { available: boolean }) {
  const StatusIcon = available ? Check : X
  return (
    <Badge
      variant="outline"
      className="h-5 rounded-full px-1.5 text-[0.65rem] font-normal text-muted-foreground"
    >
      <span
        className={`flex size-2.5 items-center justify-center rounded-full text-white ${
          available ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        <StatusIcon className="size-1.5" strokeWidth={2} />
      </span>
      {available ? "Activo" : "Inactivo"}
    </Badge>
  )
}

function valueOrFallback(value?: string | null, fallback = "Sin registro") {
  return value?.trim() || fallback
}
