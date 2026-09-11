import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { telemetryChartConfig } from "./constants"
import type { TelemetrySample } from "./types"

export function MiniLine({
  data,
  dataKey,
  color,
}: {
  data: TelemetrySample[]
  dataKey: "speed" | "rpm"
  color: string
}) {
  return (
    <ChartContainer config={telemetryChartConfig} className="h-10 w-full">
      <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function SpeedChartCard({
  data,
  speedDomainMax,
}: {
  data: TelemetrySample[]
  speedDomainMax: number
}) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-5 text-slate-900" />
          <CardTitle>Velocidad ultimos 15 min</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8">
            5 min
          </Button>
          <Button variant="secondary" size="sm" className="h-8 text-blue-600">
            15 min
          </Button>
          <Button variant="outline" size="sm" className="hidden h-8 sm:inline-flex">
            30 min
          </Button>
          <Button variant="outline" size="sm" className="hidden h-8 sm:inline-flex">
            1 h
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={telemetryChartConfig}
          className="h-[230px] w-full md:h-[260px]"
        >
          <AreaChart
            data={data}
            margin={{ top: 16, right: 8, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient id="speed-area-fill" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="shortTime"
              tickLine={false}
              axisLine={false}
              minTickGap={22}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              domain={[0, Math.ceil(speedDomainMax / 20) * 20]}
            />
            <ChartTooltip
              cursor
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="var(--color-speed)"
              strokeWidth={2.2}
              fill="url(#speed-area-fill)"
              dot={false}
              isAnimationActive={false}
            />
            {data.length ? (
              <ReferenceLine
                x={data[data.length - 1]?.shortTime}
                stroke="#2563eb"
                strokeDasharray="4 4"
                label={{
                  value: "Ahora",
                  position: "top",
                  fill: "#2563eb",
                  fontSize: 12,
                }}
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
