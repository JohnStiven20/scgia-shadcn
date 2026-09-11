import { useEffect, useMemo, useRef, useState } from "react"
import { Car, Flag, MapPinned, Play, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Map,
  MapControls,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  RouteMarker,
  RouteProgress,
  type MapRef,
} from "@/components/ui/map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MOCK_TORREVIEJA_ROUTE } from "../../page/mockTorreviejaRoute"
import type { TelemetrySnapshot } from "../../interface/types/telemetryHistory"
import { telemetryStateLabels } from "./telemetryHistoryShared"

type TelemetryHistoryMapProps = {
  snapshots: TelemetrySnapshot[]
}

export function TelemetryHistoryMap({ snapshots }: TelemetryHistoryMapProps) {
  const mapRef = useRef<MapRef | null>(null)
  const [progress, setProgress] = useState(0.45)
  const routePoints = MOCK_TORREVIEJA_ROUTE
  const currentSnapshot = useMemo(
    () => getSnapshotAtProgress(snapshots, progress),
    [progress, snapshots]
  )

  useEffect(() => {
    if (!mapRef.current || routePoints.length < 2) {
      return
    }

    const longitudes = routePoints.map((point) => point[0])
    const latitudes = routePoints.map((point) => point[1])
    mapRef.current.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      { padding: 58, duration: 0 }
    )
  }, [routePoints])

  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex items-center gap-3">
          <MapPinned className="size-5 text-slate-900" />
          <div>
            <CardTitle>Recorrido historico</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Reproduce el trayecto real mockeado de Torrevieja
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          {Math.round(progress * 100)}%
        </span>
      </CardHeader>
      <CardContent>
        <div className="relative h-[420px] overflow-hidden rounded-lg border bg-muted shadow-inner xl:h-[560px]">
          <Map
            ref={mapRef}
            center={[-0.6776, 37.9818]}
            zoom={13.1}
            dragRotate={false}
          >
            <MapRoute
              id="telemetry-history-route"
              coordinates={routePoints}
              progress={progress}
              color="#94a3b8"
              width={5}
              opacity={0.85}
              dashArray={[0.5, 1.5]}
            >
              <RouteProgress color="#2563eb" width={5} opacity={1} />

              <RouteMarker at="start">
                <MarkerContent>
                  <div className="grid size-9 place-items-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-white/80">
                    <Play className="size-4" />
                  </div>
                </MarkerContent>
              </RouteMarker>

              <RouteMarker at="progress">
                <MarkerContent>
                  <div className="grid size-11 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-8 ring-blue-500/20">
                    <Car className="size-5" />
                  </div>
                  <MarkerLabel
                    position="top"
                    className="rounded-md border bg-background/95 px-2 py-1 text-xs font-semibold tabular-nums shadow-sm"
                  >
                    {Math.round(progress * 100)}%
                  </MarkerLabel>
                </MarkerContent>
              </RouteMarker>

              <RouteMarker at="end">
                <MarkerContent>
                  <div className="grid size-9 place-items-center rounded-full bg-slate-950 text-white shadow-lg ring-4 ring-white/80">
                    <Flag className="size-4" />
                  </div>
                </MarkerContent>
              </RouteMarker>
            </MapRoute>

            <MapControls position="top-right" showCompass showFullscreen />
          </Map>

          <div className="absolute right-3 bottom-3 left-3 grid gap-3 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur md:left-3 md:w-[28rem]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">
                  {formatSnapshotTime(currentSnapshot)}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {getSnapshotDescription(currentSnapshot)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Reiniciar recorrido"
                onClick={() => setProgress(0)}
              >
                <RotateCcw />
              </Button>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Recorrido</span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={progress}
                aria-label="Progreso del recorrido"
                className="h-2 w-full accent-blue-600"
                onChange={(event) => setProgress(Number(event.target.value))}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getSnapshotAtProgress(snapshots: TelemetrySnapshot[], progress: number) {
  if (!snapshots.length) {
    return null
  }

  const index = Math.round(progress * (snapshots.length - 1))
  return snapshots[index] ?? snapshots[0]
}

function formatSnapshotTime(snapshot: TelemetrySnapshot | null) {
  if (!snapshot) {
    return "Sin registro"
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(snapshot.timestamp))
}

function getSnapshotDescription(snapshot: TelemetrySnapshot | null) {
  if (!snapshot) {
    return "No hay datos del trayecto"
  }

  const state = telemetryStateLabels[snapshot.state]
  const speed = snapshot.speed ?? 0
  const fuel = snapshot.fuelLevel ?? "-"

  return `${state} · ${speed} km/h · combustible ${fuel}%`
}
