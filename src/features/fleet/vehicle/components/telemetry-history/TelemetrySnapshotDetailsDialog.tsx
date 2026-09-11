import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Fuel, Gauge, MapPin, Power, RadioTower, Timer } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import type { TelemetrySnapshot } from "../../interface/types/telemetryHistory"
import {
  telemetryStateColors,
  telemetryStateLabels,
} from "./telemetryHistoryShared"

type TelemetrySnapshotDetailsDialogProps = {
  open: boolean
  snapshot: TelemetrySnapshot | null
  onClose: () => void
}

export function TelemetrySnapshotDetailsDialog({
  open,
  snapshot,
  onClose,
}: TelemetrySnapshotDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registro de telemetria</DialogTitle>
        </DialogHeader>
        {snapshot ? (
          <div className="grid gap-4">
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-950">
                {format(new Date(snapshot.timestamp), "dd MMMM yyyy, HH:mm", {
                  locale: es,
                })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: telemetryStateColors[snapshot.state] }}
                />
                <span className="text-sm text-muted-foreground">
                  {telemetryStateLabels[snapshot.state]}
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Gauge}
                label="Velocidad"
                value={`${snapshot.speed ?? 0} km/h`}
              />
              <DetailItem
                icon={Timer}
                label="RPM"
                value={snapshot.rpm == null ? "-" : `${snapshot.rpm} rpm`}
              />
              <DetailItem
                icon={RadioTower}
                label="Odometro"
                value={
                  snapshot.odometer == null
                    ? "-"
                    : `${(snapshot.odometer / 1000).toLocaleString("es-ES", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} km`
                }
              />
              <DetailItem
                icon={Fuel}
                label="Combustible"
                value={
                  snapshot.fuelLevel == null ? "-" : `${snapshot.fuelLevel}%`
                }
              />
              <DetailItem
                icon={Power}
                label="Motor"
                value={snapshot.engineRunning ? "Encendido" : "Apagado"}
              />
              <DetailItem
                icon={MapPin}
                label="GPS"
                value={
                  snapshot.latitude == null || snapshot.longitude == null
                    ? "-"
                    : `${snapshot.latitude.toFixed(5)}, ${snapshot.longitude.toFixed(5)}`
                }
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
      <Icon className={cn("size-5 shrink-0 text-slate-600")} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  )
}
