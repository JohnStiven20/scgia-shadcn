import { format } from "date-fns"
import { es } from "date-fns/locale"
import { BarChart3 } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import type {
  TelemetryEvent,
  TelemetrySnapshot,
} from "../../interface/types/telemetryHistory"

type TelemetrySpeedEvolutionChartProps = {
  snapshots: TelemetrySnapshot[]
  events: TelemetryEvent[]
}

const chartConfig = {
  speed: {
    label: "Velocidad",
    color: "#2563eb",
  },
}

export function TelemetrySpeedEvolutionChart({
  snapshots,
  events,
}: TelemetrySpeedEvolutionChartProps) {
  const data = snapshots.map((snapshot) => ({
    id: snapshot.id,
    time: format(new Date(snapshot.timestamp), "HH:mm"),
    timestamp: format(new Date(snapshot.timestamp), "dd MMM yyyy, HH:mm", {
      locale: es,
    }),
    speed: snapshot.speed ?? 0,
    state: snapshot.state,
  }))

  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-5 text-slate-900" />
          <CardTitle>Velocidad del dia</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground">
          {snapshots.length} registros
        </span>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 18, right: 8, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="history-speed-area"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-speed)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-speed)"
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              domain={[0, 120]}
            />
            <ChartTooltip
              cursor
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.timestamp ?? ""
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="var(--color-speed)"
              strokeWidth={2.2}
              fill="url(#history-speed-area)"
              dot={{ r: 2.4, strokeWidth: 1 }}
              isAnimationActive={false}
            />
            {events.map((event) => (
              <ReferenceLine
                key={event.id}
                x={format(new Date(event.timestamp), "HH:mm")}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
