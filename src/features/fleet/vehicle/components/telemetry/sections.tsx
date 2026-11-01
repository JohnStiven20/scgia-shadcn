import {
  Activity,
  Bell,
  Clock,
  Expand,
  Fuel,
  Gauge,
  LocateFixed,
  MapPin,
  Pause,
  Plus,
  RadioTower,
  Thermometer,
  Timer,
  Wifi,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  AlertListItem,
  TelemetryMetricCard,
} from "./components"
import { VehicleMapSurface } from "./map"
import type { GpsLevel, PresentableAlert } from "./types"
import {
  formatCoordinates,
  formatEngineActiveTime,
  formatNumber,
} from "./utils"
import type { VehicleTelemetryCurrentResponse } from "../../interface/types/vehicleTelemetry"

export function MetricsSection({
  telemetry,
  gpsQuality,
  currentOdometer,
  engineRunning,
  connecting,
}: {
  telemetry: VehicleTelemetryCurrentResponse | null
  gpsQuality: GpsLevel
  currentOdometer: number | null
  engineRunning: boolean
  connecting: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <TelemetryMetricCard
        title="Velocidad"
        value={formatNumber(telemetry?.speed)}
        unit="km/h"
        icon={Gauge}
        iconClassName="text-slate-900"
        footer={null}
      />
      <TelemetryMetricCard
        title="Combustible"
        value={formatNumber(telemetry?.fuelLevel)}
        unit="L"
        icon={Fuel}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="RPM"
        value={formatNumber(telemetry?.rpm)}
        icon={Timer}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="Temp motor"
        value={formatNumber(telemetry?.engineTemperature)}
        unit="C"
        icon={Thermometer}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="GPS"
        value={gpsQuality.label}
        icon={Wifi}
        iconClassName="text-emerald-600"
      />
      <TelemetryMetricCard
        title="Voltaje batería vehículo"
        value={formatNumber(telemetry?.externalVoltage, 1)}
        unit="V"
        icon={Gauge}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="Odometro"
        value={formatNumber(currentOdometer)}
        unit="km"
        icon={Gauge}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="Operador GSM"
        value={telemetry?.activeGsmOperator ?? "-"}
        icon={RadioTower}
        iconClassName="text-slate-900"
      />
      <TelemetryMetricCard
        title="Motor"
        value={connecting ? "Conectando" : engineRunning ? "Encendido" : "Apagado"}
        icon={Activity}
        iconClassName={engineRunning ? "text-emerald-600" : "text-slate-500"}
      />
      <TelemetryMetricCard
        title="Tiempo activo"
        value={formatEngineActiveTime(telemetry?.engineHours)}
        icon={Clock}
        iconClassName="text-slate-900"
      />
    </div>
  )
}

export function MapSection({
  latitude,
  longitude,
  heading,
  direction,
  locationLabel,
  telemetry,
  onFollow,
  followRequest,
  onZoomToVehicle,
  zoomRequest,
  onExpand,
}: {
  latitude: number
  longitude: number
  heading: number
  direction: string
  locationLabel: string
  telemetry: VehicleTelemetryCurrentResponse | null
  onFollow: () => void
  followRequest: number
  onZoomToVehicle: () => void
  zoomRequest: number
  onExpand: () => void
}) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border bg-slate-50">
            <MapPin className="size-5 text-slate-900" />
          </div>
          <div className="min-w-0">
            <CardTitle>Ubicacion actual</CardTitle>
          </div>
        </div>
        <div className="flex min-w-0 gap-1 sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onFollow}>
            <LocateFixed />
            Centrar vehiculo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onZoomToVehicle}
            aria-label="Vista cercana del vehiculo"
            title="Vista cercana del vehiculo"
          >
            <Plus />
            Vista cercana
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onExpand}
            aria-label="Abrir mapa grande"
          >
            <Expand />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <VehicleMapSurface
          latitude={latitude}
          longitude={longitude}
          heading={heading}
          followRequest={followRequest}
          zoomRequest={zoomRequest}
          heightClassName="h-[360px] md:h-[430px] xl:h-[480px]"
        />
      </CardContent>
    </Card>
  )
}

export function AlertsSection({ alerts }: { alerts: PresentableAlert[] }) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-slate-900" />
          <CardTitle>Alertas activas</CardTitle>
        </div>
        <Button variant="link" className="w-fit px-0 text-blue-600">
          Ver todas ({alerts.length})
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length ? (
          <div className="divide-y">
            {alerts.map((alert) => (
              <AlertListItem key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Pause className="size-7 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">
              Sin alertas activas
            </p>
            <p className="text-sm">
              El vehiculo opera dentro de parametros normales.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

