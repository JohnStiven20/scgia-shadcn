import {
  Activity,
  BatteryCharging,
  Bell,
  Clock,
  Expand,
  Fuel,
  Gauge,
  LocateFixed,
  MapPin,
  Pause,
  RadioTower,
  Settings,
  Thermometer,
  Timer,
  Wifi,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import { MiniLine } from "./charts"
import {
  AlertListItem,
  GpsBars,
  MetricProgress,
  TelemetryMetricCard,
} from "./components"
import { LocationStrip, VehicleMapSurface } from "./map"
import type {
  GpsLevel,
  PresentableAlert,
  TelemetrySample,
} from "./types"
import {
  formatCoordinates,
  formatEngineActiveTime,
  formatNumber,
  metricValue,
} from "./utils"
import type { VehicleTelemetryCurrentResponse } from "../../interface/types/vehicleTelemetry"

export function MetricsSection({
  telemetry,
  miniHistory,
  gpsQuality,
  temperatureValue,
  batteryProgress,
  temperatureProgress,
}: {
  telemetry: VehicleTelemetryCurrentResponse | null
  miniHistory: TelemetrySample[]
  gpsQuality: GpsLevel
  temperatureValue: number
  batteryProgress: number
  temperatureProgress: number
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <TelemetryMetricCard
        title="Velocidad"
        value={formatNumber(telemetry?.speed)}
        unit="km/h"
        icon={Gauge}
        iconClassName="text-slate-900"
        footer={<MiniLine data={miniHistory} dataKey="speed" color="#2563eb" />}
      />
      <TelemetryMetricCard
        title="Combustible"
        value={formatNumber(telemetry?.fuelLevel)}
        unit="%"
        icon={Fuel}
        iconClassName="text-slate-900"
        footer={
          <MetricProgress
            value={metricValue(telemetry?.fuelLevel)}
            className="bg-emerald-500"
            label={`${formatNumber(telemetry?.fuelLevel)}% disponible`}
          />
        }
      />
      <TelemetryMetricCard
        title="RPM"
        value={formatNumber(telemetry?.rpm)}
        icon={Timer}
        iconClassName="text-slate-900"
        footer={<MiniLine data={miniHistory} dataKey="rpm" color="#2563eb" />}
      />
      <TelemetryMetricCard
        title="Temp motor"
        value={formatNumber(telemetry?.engineTemperature)}
        unit="C"
        icon={Thermometer}
        iconClassName="text-slate-900"
        footer={
          <MetricProgress
            value={temperatureProgress}
            className={temperatureValue > 105 ? "bg-red-500" : "bg-emerald-500"}
            label={temperatureValue > 105 ? "Fuera de rango" : "Rango operativo"}
          />
        }
      />
      <TelemetryMetricCard
        title="GPS"
        value={gpsQuality.label}
        icon={Wifi}
        iconClassName="text-emerald-600"
        footer={<GpsBars bars={gpsQuality.bars} />}
      />
      <TelemetryMetricCard
        title="Bateria"
        value={formatNumber(telemetry?.batteryVoltage, 1)}
        unit="V"
        icon={BatteryCharging}
        iconClassName="text-slate-900"
        footer={
          <MetricProgress
            value={batteryProgress}
            className="bg-emerald-500"
            label={
              metricValue(telemetry?.batteryVoltage) >= 13.5
                ? "Carga estable"
                : "Carga baja"
            }
          />
        }
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
  onExpand,
}: {
  latitude: number
  longitude: number
  heading: number
  direction: string
  locationLabel: string
  telemetry: VehicleTelemetryCurrentResponse | null
  onExpand: () => void
}) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border bg-slate-50">
            <MapPin className="size-5 text-slate-900" />
          </div>
          <div className="min-w-0">
            <CardTitle>Ubicacion actual</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Ubicacion GPS en tiempo real
            </p>
          </div>
        </div>
        <CardAction className="flex gap-1">
          <Button type="button" variant="outline" size="sm">
            <LocateFixed />
            Seguir vehiculo
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
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <VehicleMapSurface
            latitude={latitude}
            longitude={longitude}
            heading={heading}
            heightClassName="h-[360px] md:h-[430px] xl:h-[480px]"
          />
          <div className="absolute bottom-3 left-3 w-[min(24rem,calc(100%-1.5rem))]">
            <LocationStrip
              title={formatCoordinates(telemetry?.latitude, telemetry?.longitude)}
              coordinates={locationLabel}
              direction={direction}
              heading={heading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AlertsSection({ alerts }: { alerts: PresentableAlert[] }) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-slate-900" />
          <CardTitle>Alertas activas</CardTitle>
        </div>
        <Button variant="link" className="px-0 text-blue-600">
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

export function DeviceStatusSection({
  telemetry,
  vehicle,
  connected,
  connecting,
  gpsQuality,
  engineRunning,
  currentOdometer,
  error,
}: {
  telemetry: VehicleTelemetryCurrentResponse | null
  vehicle: Vehicle
  connected: boolean
  connecting: boolean
  gpsQuality: GpsLevel
  engineRunning: boolean
  currentOdometer: number | null
  error: string | null
}) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="size-5 text-slate-900" />
          <CardTitle>Estado del vehiculo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          <StatusRow
            icon={Activity}
            label="Motor"
            value={
              engineRunning ? "Encendido" : connecting ? "Conectando" : "Apagado"
            }
            iconClassName={engineRunning ? "text-emerald-600" : "text-slate-500"}
            dotClassName={engineRunning ? "bg-emerald-500" : "bg-slate-400"}
          />
          <StatusRow
            icon={RadioTower}
            label="Senal GPS"
            value={connected ? gpsQuality.label : "Sin cobertura"}
            iconClassName={gpsQuality.iconClassName}
            dotClassName={connected ? "bg-emerald-500" : "bg-slate-400"}
          />
          <StatusRow
            icon={Gauge}
            label="Odometro"
            value={
              currentOdometer !== null
                ? `${formatNumber(currentOdometer)} km`
                : "Sin dato"
            }
            iconClassName="text-slate-500"
          />
          <StatusRow
            icon={Clock}
            label="Tiempo activo"
            value={formatEngineActiveTime(telemetry?.engineHours)}
            iconClassName="text-slate-500"
          />
          <StatusRow
            icon={Zap}
            label="Fuente"
            value={
              telemetry?.source ??
              telemetry?.deviceIdentifier ??
              vehicle.telemetryDeviceIdentifier ??
              "Sin dispositivo"
            }
            iconClassName="text-blue-600"
          />
        </div>
        {error ? (
          <p className="mt-3 border-t pt-3 text-xs text-red-600">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StatusRow({
  icon: Icon,
  iconClassName,
  label,
  value,
  dotClassName,
}: {
  icon: typeof Activity
  iconClassName: string
  label: string
  value: string
  dotClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className={cn("size-5 shrink-0", iconClassName)} />
        <span className="min-w-0 text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-3 text-right">
        {dotClassName ? (
          <span className={cn("size-2.5 shrink-0 rounded-full", dotClassName)} />
        ) : null}
        <span className="truncate text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>
    </div>
  )
}
