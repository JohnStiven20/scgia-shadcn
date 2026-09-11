import type { ReactNode } from "react"
import { Activity, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ConnectionTone, PresentableAlert } from "./types"
import { clampPercent } from "./utils"

export function TelemetryMetricCard({
  icon: Icon,
  iconClassName,
  title,
  value,
  unit,
  footer,
}: {
  icon: LucideIcon
  iconClassName: string
  title: string
  value: string
  unit?: string
  footer: ReactNode
}) {
  return (
    <Card className="min-h-32 rounded-lg border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardContent className="flex h-full flex-col">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-slate-50">
            <Icon className={cn("size-5", iconClassName)} />
          </span>
          <p className="min-w-0 text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </div>
        <div className="mb-3 flex items-baseline gap-1">
          <p className="text-2xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
          {unit ? (
            <span className="text-sm font-medium text-slate-600">{unit}</span>
          ) : null}
        </div>
        <div className="mt-auto">{footer}</div>
      </CardContent>
    </Card>
  )
}

export function MetricProgress({
  value,
  className,
  label,
}: {
  value: number
  className: string
  label: string
}) {
  return (
    <div className="grid gap-2">
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", className)}
          style={{ width: `${clampPercent(value)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function GpsBars({ bars }: { bars: number }) {
  return (
    <div className="flex h-7 items-end gap-1.5">
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={cn(
            "w-2 rounded-sm",
            level <= bars ? "bg-teal-600" : "bg-slate-200"
          )}
          style={{ height: `${5 + level * 5}px` }}
        />
      ))}
    </div>
  )
}

export function InlineStatus({
  active,
  label,
}: {
  active: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "size-2 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

export function LiveBadge({
  label,
  tone,
}: {
  label: string
  tone: ConnectionTone
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "success" && "bg-emerald-500",
          tone === "warning" && "bg-amber-500",
          tone === "danger" && "bg-red-500"
        )}
      />
      {label}
    </Badge>
  )
}

export function AlertListItem({ alert }: { alert: PresentableAlert }) {
  const tone = {
    WARNING: {
      label: "Advertencia",
      iconClassName: "bg-amber-50 text-amber-600",
      textClassName: "text-amber-700",
    },
    CRITICAL: {
      label: "Activa",
      iconClassName: "bg-red-50 text-red-600",
      textClassName: "text-red-700",
    },
    INFO: {
      label: "Info",
      iconClassName: "bg-blue-50 text-blue-600",
      textClassName: "text-blue-700",
    },
  }[alert.severity]

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex min-w-0 gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            tone.iconClassName
          )}
        >
          <Activity className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{alert.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {alert.description}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-xs font-semibold", tone.textClassName)}>
          {tone.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {alert.relativeTime}
        </p>
      </div>
    </div>
  )
}

export function DeviceStat({
  icon: Icon,
  iconClassName,
  label,
  value,
  showDivider,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: string
  showDivider?: boolean
}) {
  return (
    <div
      className={cn("min-w-0 px-1 py-1 md:px-3", showDivider && "xl:border-l")}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className={cn("size-4 shrink-0", iconClassName)} />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}
