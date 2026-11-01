import { Layers3 } from "lucide-react"

import type { OrangeTaskProductionResponse } from "../../../interface/orange/OrangeTaskProductionResponse"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OrangeTaskProductionTableProps = {
  tasks: OrangeTaskProductionResponse[]
  isLoading?: boolean
  isError?: boolean
}

const numberFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })
const amountFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })

function ProgressCell({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, value))

  return (
    <div className="flex min-w-28 items-center gap-3">
      <span className="w-12 shrink-0 text-right">{numberFormatter.format(value)} %</span>
      <span className="h-2 min-w-12 flex-1 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-violet-500" style={{ width: `${percentage}%` }} />
      </span>
    </div>
  )
}

export function OrangeTaskProductionTable({ tasks, isLoading = false, isError = false }: OrangeTaskProductionTableProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-card p-5 shadow-xs" aria-label="Producción por tipo de tarea">
      <div className="mb-4 flex items-center gap-3">
        <Layers3 className="size-6 text-violet-600" aria-hidden="true" />
        <h2 className="text-lg font-bold">Producción por tipo de tarea</h2>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead className="text-right">Órdenes</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>% Órdenes</TableHead>
              <TableHead>% Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={`task-skeleton-${index}`}>
                  <TableCell colSpan={7}><div className="h-5 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No se pudo cargar la producción por tarea.</TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No hay tareas para el periodo seleccionado.</TableCell></TableRow>
            ) : (
              tasks.map((task, index) => (
                <TableRow key={task.taskTypeId}>
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-semibold">{task.taskName}</TableCell>
                  <TableCell className="text-right">{numberFormatter.format(task.orders)}</TableCell>
                  <TableCell className="text-right">{numberFormatter.format(task.points)}</TableCell>
                  <TableCell className="text-right font-medium">{amountFormatter.format(task.amount)}</TableCell>
                  <TableCell><ProgressCell value={task.ordersPercentage} /></TableCell>
                  <TableCell><ProgressCell value={task.amountPercentage} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
