import { BarChart3 } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { OrangeTaskProductionResponse } from "../../../interface/orange/OrangeTaskProductionResponse"

type OrangeEconomicChartProps = {
  tasks: OrangeTaskProductionResponse[]
  totalAmount?: number
  isLoading?: boolean
}

const palette = ["#ff9200", "#1689e8", "#08b85c", "#8746e8", "#f05b8c", "#f8c414", "#1bb8ad", "#aeb4ba"]
const amountFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

export function OrangeEconomicChart({
  tasks,
  totalAmount = 0,
  isLoading = false,
}: OrangeEconomicChartProps) {
  const chartData = tasks.map((task) => ({
    name: task.taskName,
    value: Math.max(task.amount, 0),
  }))

  return (
    <section className="min-w-0 rounded-xl border bg-card p-5 shadow-xs" aria-label="Producción económica por tareas">
      <div className="mb-4 flex items-center gap-3">
        <BarChart3 className="size-6 text-amber-500" aria-hidden="true" />
        <h2 className="text-lg font-bold">Producción económica por tareas</h2>
      </div>

      {isLoading ? (
        <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">Cargando producción…</div>
      ) : tasks.length === 0 ? (
        <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">No hay datos para el periodo seleccionado.</div>
      ) : (
        <div className="grid items-center gap-4 md:grid-cols-[minmax(220px,0.95fr)_minmax(220px,1fr)]">
          <div className="relative h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="84%"
                  paddingAngle={1}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => amountFormatter.format(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-xl font-bold">{amountFormatter.format(totalAmount)}</strong>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="min-w-0 divide-y">
            {tasks.map((task, index) => (
              <li key={task.taskTypeId} className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                <span className="flex min-w-0 items-start gap-2">
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                  <span className="min-w-0 whitespace-normal break-words leading-5">{task.taskName}</span>
                </span>
                <span className="shrink-0 text-right font-medium">{amountFormatter.format(task.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
