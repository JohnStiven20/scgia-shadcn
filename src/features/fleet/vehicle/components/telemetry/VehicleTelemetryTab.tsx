import { useEffect, useMemo, useReducer, useState } from "react"
import { CarFront, Clock3 } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import { useVehicleTelemetry } from "../../hooks/useVehicleTelemetry"
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  MINI_HISTORY_POINTS,
} from "./constants"
import { SpeedChartCard } from "./charts"
import { LiveBadge } from "./components"
import { deriveAlerts, historyReducer } from "./mappers"
import { LocationStrip, VehicleMapSurface } from "./map"
import {
  AlertsSection,
  DeviceStatusSection,
  MapSection,
  MetricsSection,
} from "./sections"
import {
  clampPercent,
  formatCoordinates,
  formatClock,
  formatRelativeTime,
  getCompassDirection,
  getConnectionChip,
  getGpsLevel,
  getMapBadgeTone,
  metricValue,
} from "./utils"

type VehicleTelemetryTabProps = {
  vehicle: Vehicle
}

export function VehicleTelemetryTab({ vehicle }: VehicleTelemetryTabProps) {
  const { telemetry, connected, connecting, error, lastUpdatedAt } =
    useVehicleTelemetry(vehicle.id)
  const [history, pushHistorySample] = useReducer(historyReducer, [])
  const [now, setNow] = useState(() => Date.now())
  const [mapExpanded, setMapExpanded] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (telemetry?.recordedAt) {
      pushHistorySample(telemetry)
    }
  }, [telemetry])

  const mapLatitude = telemetry?.latitude ?? DEFAULT_LATITUDE
  const mapLongitude = telemetry?.longitude ?? DEFAULT_LONGITUDE
  const heading = telemetry?.heading ?? 0
  const direction = getCompassDirection(telemetry?.heading)
  const gpsQuality = getGpsLevel(telemetry?.gpsSignal, connected)
  const connectionChip = getConnectionChip(telemetry, connected, connecting)
  const engineRunning =
    telemetry?.engineRunning ??
    telemetry?.ignition ??
    metricValue(telemetry?.rpm) > 0
  const temperatureValue = metricValue(telemetry?.engineTemperature)
  const currentOdometer = telemetry?.odometer ?? vehicle.currentOdometer ?? null
  const locationLabel = telemetry?.address ?? "Ubicacion GPS en tiempo real"
  const mapChipLabel = connected
    ? "GPS en vivo"
    : connecting
      ? "Sincronizando GPS"
      : "GPS sin enlace"
  const alerts = deriveAlerts(telemetry, now)
  const miniHistory = history.slice(-MINI_HISTORY_POINTS)
  const speedDomainMax = Math.max(120, ...history.map((point) => point.speed))
  const batteryProgress = clampPercent(
    (metricValue(telemetry?.batteryVoltage) / 16) * 100
  )
  const temperatureProgress = clampPercent((temperatureValue / 120) * 100)
  const chartData = useMemo(() => history, [history])

  return (
    <div className="grid gap-4">
      <TelemetryHeader
        vehicle={vehicle}
        lastUpdatedAt={lastUpdatedAt}
        now={now}
        connectionText={connectionChip.text}
        connectionTone={connectionChip.tone}
      />

      <MetricsSection
        telemetry={telemetry}
        miniHistory={miniHistory}
        gpsQuality={gpsQuality}
        temperatureValue={temperatureValue}
        batteryProgress={batteryProgress}
        temperatureProgress={temperatureProgress}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <MapSection
          latitude={mapLatitude}
          longitude={mapLongitude}
          heading={heading}
          direction={direction}
          locationLabel={locationLabel}
          telemetry={telemetry}
          onExpand={() => setMapExpanded(true)}
        />
        <div className="grid gap-4 content-start">
          <DeviceStatusSection
            telemetry={telemetry}
            vehicle={vehicle}
            connected={connected}
            connecting={connecting}
            gpsQuality={gpsQuality}
            engineRunning={engineRunning}
            currentOdometer={currentOdometer}
            error={error}
          />
          <AlertsSection alerts={alerts} />
        </div>
      </div>

      <SpeedChartCard data={chartData} speedDomainMax={speedDomainMax} />

      <Dialog open={mapExpanded} onOpenChange={setMapExpanded}>
        <DialogContent className="h-[min(92vh,920px)] w-[min(94vw,1440px)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="flex items-center gap-2">
              Ubicacion actual
              <LiveBadge
                label={mapChipLabel}
                tone={getMapBadgeTone(connected)}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 p-3">
            <VehicleMapSurface
              latitude={mapLatitude}
              longitude={mapLongitude}
              heading={heading}
              heightClassName="h-full"
            />
          </div>
          <div className="border-t p-3">
            <LocationStrip
              title={locationLabel}
              coordinates={formatCoordinates(
                telemetry?.latitude,
                telemetry?.longitude
              )}
              direction={direction}
              heading={heading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TelemetryHeader({
  vehicle,
  lastUpdatedAt,
  now,
  connectionText,
  connectionTone,
}: {
  vehicle: Vehicle
  lastUpdatedAt: string | null
  now: number
  connectionText: string
  connectionTone: "success" | "warning" | "danger"
}) {
  const deviceName =
    vehicle.telemetryDeviceIdentifier ?? vehicle.internalCode ?? "Sin dispositivo"

  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-slate-50 text-slate-900">
            <CarFront className="size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl font-semibold tracking-normal text-slate-950">
              Telemetria en tiempo real
              </CardTitle>
              <LiveBadge label={connectionText} tone={connectionTone} />
              <CardDescription className="text-sm">
                Actualizado {formatRelativeTime(lastUpdatedAt, now)}
              </CardDescription>
            </div>
          </div>
        </div>
        <CardAction className="static row-auto grid gap-3 self-auto justify-self-start sm:grid-cols-2 lg:justify-self-end">
          <CardContent className="border-l-0 p-0 sm:border-l sm:pl-6">
            <div className="flex min-w-0 items-center gap-3">
              <CarFront className="size-5 shrink-0 text-slate-900" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {deviceName}
                </p>
                <p className="text-xs text-muted-foreground">Dispositivo</p>
              </div>
            </div>
          </CardContent>
          <CardContent className="border-l-0 p-0 sm:border-l sm:pl-6">
            <div className="flex min-w-0 items-center gap-3">
              <Clock3 className="size-5 shrink-0 text-slate-900" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {formatClock(lastUpdatedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ultima actualizacion
                </p>
              </div>
            </div>
          </CardContent>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
