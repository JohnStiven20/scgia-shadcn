import { ArrowLeft, UserRound } from "lucide-react"
import { format, subDays } from "date-fns"
import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { DatePicker } from "@/components/general"
import { Button } from "@/components/ui/button"

import { OrangeEconomicChart } from "../components/OrangeEconomicChart"
import { OrangeProductionStats } from "../components/OrangeProductionStats"
import { OrangeTaskProductionTable } from "../components/OrangeTaskProductionTable"
import { useGetOrangeWorkerTaskProductionQuery } from "@/features/inventory/production/api/productionOrangeApi.ts"

type OrangeWorkerProductionState = {
  providerId?: number
  workerId?: number
  workerName?: string
  startDate?: string
  endDate?: string
}

function getInitialDates() {
  const endDate = new Date()
  return { startDate: subDays(endDate, 30), endDate }
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? fallback : date
}

export function OrangeWorkerProductionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { workerId: workerIdParam } = useParams<{ workerId: string }>()
  const state = (location.state as OrangeWorkerProductionState | null) ?? {}
  const initialDates = getInitialDates()
  const providerId = state.providerId ?? 4

  const workerId = Number(workerIdParam ?? state.workerId ?? 23)
  const workerName = state.workerName || "Trabajador 23"
  const [dateRange, setDateRange] = useState(() => ({
    startDate: parseDate(state.startDate, initialDates.startDate),
    endDate: parseDate(state.endDate, initialDates.endDate),
  }))
  const startDate = format(dateRange.startDate, "yyyy-MM-dd")
  const endDate = format(dateRange.endDate, "yyyy-MM-dd")
  const request = { workerId, providerId, startDate, endDate }
  const workerQuery = useGetOrangeWorkerTaskProductionQuery(request)
  const tasks = workerQuery.data ?? []
  const summary = {
    totalOrders: tasks.reduce((total, task) => total + task.orders, 0),
    taskTypes: tasks.length,
    totalPoints: tasks.reduce((total, task) => total + task.points, 0),
    totalAmount: tasks.reduce((total, task) => total + task.amount, 0),
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Producción por trabajador">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Migas de pan">
        <button type="button" className="hover:text-foreground" onClick={() => navigate("/inventory/production")}>
          Producción
        </button>
        <span aria-hidden="true">›</span>
        <span className="font-semibold text-foreground">Trabajador</span>
      </nav>

      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <section>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Producción por trabajador</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Rendimiento, tareas y producción económica de un trabajador en el rango seleccionado.
          </p>
        </section>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <div className="min-w-64 rounded-xl border bg-card px-4 py-3 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Trabajador seleccionado</span>
            <span className="mt-1 flex items-center gap-2 text-base font-semibold">
              <UserRound className="size-4 text-muted-foreground" />
              {workerName}
            </span>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/production")}>
            <ArrowLeft />
            Volver a producción
          </Button>
        </div>
      </header>

      <div className="flex w-full max-w-2xl flex-wrap items-end gap-3">
        <DatePicker
          id="worker-production-start"
          label="Fecha inicial"
          value={dateRange.startDate}
          maxDate={dateRange.endDate}
          className="w-full sm:w-48"
          onChange={(date) => setDateRange((current) => ({ ...current, startDate: date }))}
        />
        <DatePicker
          id="worker-production-end"
          label="Fecha final"
          value={dateRange.endDate}
          minDate={dateRange.startDate}
          className="w-full sm:w-48"
          onChange={(date) => setDateRange((current) => ({ ...current, endDate: date }))}
        />
      </div>

      <OrangeProductionStats summary={summary} isLoading={workerQuery.isLoading} />
      <OrangeTaskProductionTable
        tasks={tasks}
        isLoading={workerQuery.isLoading}
        isError={workerQuery.isError}
      />
      <OrangeEconomicChart
        tasks={tasks}
        totalAmount={summary.totalAmount}
        isLoading={workerQuery.isLoading}
      />
    </section>
  )
}
