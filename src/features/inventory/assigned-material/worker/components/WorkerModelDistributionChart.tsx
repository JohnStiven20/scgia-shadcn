import { Layers3 } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssignedModelDistributionResponse } from "../../interface/AssignedModelDistributionResponse"

type WorkerModelDistributionChartProps = {
  models: AssignedModelDistributionResponse[]
  isLoading?: boolean
}

const palette = ["#1677ff", "#20bf55", "#8746e8", "#ffad0a", "#ef5b8c", "#1bb8ad"]
const numberFormatter = new Intl.NumberFormat("es-ES")
const percentageFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 })

export function WorkerModelDistributionChart({
  models,
  isLoading = false,
}: WorkerModelDistributionChartProps) {
  const total = models.reduce((sum, model) => sum + model.total, 0)

  return (
    <Card aria-label="Distribución del material del trabajador">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-4 py-3">
        <Layers3 className="size-5 text-blue-600" aria-hidden="true" />
        <CardTitle>Distribución por modelo</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-3">
        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">Cargando distribución…</div>
        ) : models.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">No hay modelos asignados.</div>
        ) : (
          <div className="grid items-center gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="relative h-48 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={models} dataKey="total" nameKey="modelName" innerRadius="55%" outerRadius="92%" paddingAngle={1} stroke="hsl(var(--background))" strokeWidth={2}>
                    {models.map((model, index) => (
                      <Cell key={model.modelId} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [numberFormatter.format(Number(value)), String(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl font-semibold">{numberFormatter.format(total)}</strong>
                <span className="text-xs text-muted-foreground">Productos</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-2 bg-muted/50 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground">
                <span>Modelo</span>
                <span className="text-right">Cantidad</span>
                <span className="text-right">Porcentaje</span>
              </div>
              <ul className="divide-y">
                {models.map((model, index) => (
                <li key={model.modelId} className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 px-2.5 py-1.5 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                      <span className="truncate">{model.modelName}</span>
                    </span>
                    <strong className="text-right">{numberFormatter.format(model.total)}</strong>
                    <span className="text-right">{percentageFormatter.format(model.percentage)} %</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
