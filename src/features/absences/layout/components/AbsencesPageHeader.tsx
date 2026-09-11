import { CalendarDays, CheckCircle2, Clock3, FileText } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AbsencesPageHeaderProps = {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
}

export function AbsencesPageHeader({
  totalRequests,
  pendingRequests,
  approvedRequests,
}: AbsencesPageHeaderProps) {
  return (
    <Card className="border-border/80 py-5 shadow-sm shadow-slate-100/70">
      <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <CalendarDays className="size-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              Gestion de ausencias
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Calendario global para revisar, aprobar y rechazar solicitudes.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[38rem]">
          <MetricTile
            icon={FileText}
            value={totalRequests}
            label="solicitudes"
            detail="en el periodo visible"
            className="bg-blue-50 text-blue-700"
          />
          <MetricTile
            icon={Clock3}
            value={pendingRequests}
            label="pendientes"
            detail="requieren revision"
            className="bg-amber-50 text-amber-700"
          />
          <MetricTile
            icon={CheckCircle2}
            value={approvedRequests}
            label="aprobadas"
            detail="en el periodo visible"
            className="bg-emerald-50 text-emerald-700"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricTile({
  icon: Icon,
  value,
  label,
  detail,
  className,
}: {
  icon: typeof FileText
  value: number
  label: string
  detail: string
  className: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm shadow-slate-100/70">
      <span className={cn("grid size-12 place-items-center rounded-full", className)}>
        <Icon className="size-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold leading-6 text-slate-950">
          {value}
        </span>
        <span className="block text-base font-medium leading-5 text-slate-900">
          {label}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
    </div>
  )
}
