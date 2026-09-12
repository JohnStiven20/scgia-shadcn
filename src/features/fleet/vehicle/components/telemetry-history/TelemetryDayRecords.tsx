import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Eye, Gauge } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { TelemetrySnapshot } from "../../interface/types/telemetryHistory"
import {
  telemetryStateColors,
  telemetryStateLabels,
} from "./telemetryHistoryShared"
import { TelemetrySnapshotDetailsDialog } from "./TelemetrySnapshotDetailsDialog"

const INITIAL_VISIBLE_ROWS = 5

type TelemetryDayRecordsProps = {
  snapshots: TelemetrySnapshot[]
}

export function TelemetryDayRecords({ snapshots }: TelemetryDayRecordsProps) {
  const [visibleRows, setVisibleRows] = useState(INITIAL_VISIBLE_ROWS)
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(
    null
  )
  const orderedSnapshots = useMemo(
    () =>
      [...snapshots].sort(
        (left, right) =>
          new Date(right.timestamp).getTime() -
          new Date(left.timestamp).getTime()
      ),
    [snapshots]
  )
  const selectedSnapshot =
    snapshots.find((snapshot) => snapshot.id === selectedSnapshotId) ?? null
  const visibleSnapshots = orderedSnapshots.slice(0, visibleRows)

  return (
    <>
      <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
        <CardHeader className="gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Gauge className="size-5 text-slate-900" />
            <CardTitle>Registros del dia</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground sm:justify-self-end">
            {snapshots.length} lecturas
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="hidden grid-cols-[5rem_minmax(0,1fr)_5rem_7rem_3rem] gap-3 border-b bg-slate-50 px-3 py-2 text-xs font-medium text-muted-foreground sm:grid">
              <span>Hora</span>
              <span>Estado</span>
              <span className="text-right">Km/h</span>
              <span className="text-right">Odometro</span>
              <span />
            </div>
            <div className="divide-y">
              {visibleSnapshots.map((snapshot) => (
                <button
                  key={snapshot.id}
                  type="button"
                  className="grid w-full gap-3 px-3 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-[5rem_minmax(0,1fr)_5rem_7rem_3rem] sm:items-center"
                  onClick={() => setSelectedSnapshotId(snapshot.id)}
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900 sm:block">
                    <span className="sm:hidden">Hora</span>
                    {format(new Date(snapshot.timestamp), "HH:mm")}
                  </span>
                  <span className="grid min-w-0 gap-2 sm:flex sm:items-center">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: telemetryStateColors[snapshot.state],
                        }}
                      />
                      <span className="truncate text-sm text-muted-foreground">
                        {telemetryStateLabels[snapshot.state]}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold sm:block sm:text-right">
                    <span className="text-muted-foreground sm:hidden">
                      Km/h
                    </span>
                    {snapshot.speed ?? 0}
                  </span>
                  <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground sm:block sm:text-right">
                    <span className="sm:hidden">Odometro</span>
                    {snapshot.odometer == null
                      ? "-"
                      : `${(snapshot.odometer / 1000).toLocaleString("es-ES", {
                          maximumFractionDigits: 1,
                        })} km`}
                  </span>
                  <span className="hidden justify-end text-muted-foreground sm:flex">
                    <Eye className="size-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
          {visibleRows < orderedSnapshots.length ? (
            <Button
              type="button"
              variant="outline"
              className={cn("mt-3 w-full")}
              onClick={() => setVisibleRows((current) => current + 5)}
            >
              Ver mas registros
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <TelemetrySnapshotDetailsDialog
        open={selectedSnapshot !== null}
        snapshot={selectedSnapshot}
        onClose={() => setSelectedSnapshotId(null)}
      />
    </>
  )
}
