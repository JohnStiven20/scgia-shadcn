import { Layers3 } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssignedModelDistributionResponse } from "../interface/AssignedModelDistributionResponse"

type GlobalModelDistributionChartProps = {
  models: AssignedModelDistributionResponse[]
  isLoading?: boolean
}

const palette = ["#1677ff", "#08b85c", "#8746e8", "#ffad0a", "#aeb4ba", "#ef5b8c"]

const numberFormatter = new Intl.NumberFormat("es-ES")
const percentageFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
})

export function GlobalModelDistributionChart({
  models,
  isLoading = false,
}: GlobalModelDistributionChartProps) {
  const total = models.reduce((sum, model) => sum + model.total, 0)

  return (
    <Card aria-label="Distribución global por modelo">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Layers3 className="size-5 text-blue-600" aria-hidden="true" />
        <CardTitle>Distribución por modelo (asignado)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
            Cargando distribución…
          </div>
        ) : models.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
            No hay material asignado.
          </div>
        ) : (
          <div className="grid items-center gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(280px,1fr)]">
            <div className="relative h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={models}
                    dataKey="total"
                    nameKey="modelName"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={1}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {models.map((model, index) => (
                      <Cell key={model.modelId} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [numberFormatter.format(Number(value)), String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl font-semibold">{numberFormatter.format(total)}</strong>
                <span className="text-sm text-muted-foreground">Productos</span>
              </div>
            </div>
            <ul className="min-w-0 divide-y">
              {models.map((model, index) => (
                <li key={model.modelId} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                    <span className="truncate">{model.modelName}</span>
                  </span>
                  <span className="shrink-0 text-right font-medium">
                    {numberFormatter.format(model.total)} ({percentageFormatter.format(model.percentage)} %)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
