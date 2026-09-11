import { CalendarX, Satellite } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type TelemetryHistoryEmptyStateProps = {
  variant: "no-device" | "no-records"
  title: string
  description: string
  details: string
}

export function TelemetryHistoryEmptyState({
  variant,
  title,
  description,
  details,
}: TelemetryHistoryEmptyStateProps) {
  const Icon = variant === "no-device" ? Satellite : CalendarX

  return (
    <Card className="border-border/80 py-10 shadow-sm shadow-slate-100/70">
      <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
        <div className="grid size-14 place-items-center rounded-xl border bg-slate-50 text-slate-500">
          <Icon className="size-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">{details}</p>
      </CardContent>
    </Card>
  )
}
