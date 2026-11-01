import { UsersRound } from "lucide-react"

import type { WorkerProductionResponse } from "../../../interface/orange/WorkerProductionResponse"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OrangeWorkersTableProps = {
  workers: WorkerProductionResponse[]
  onWorkerClick?: (worker: WorkerProductionResponse) => void
  isLoading?: boolean
  isError?: boolean
}

function workerName(worker: WorkerProductionResponse) {
  return [worker.firstName, worker.surname].filter(Boolean).join(" ") || "Trabajador sin nombre"
}

function initials(worker: WorkerProductionResponse) {
  return workerName(worker)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2)
}

export function OrangeWorkersTable({
  workers,
  onWorkerClick,
  isLoading = false,
  isError = false,
}: OrangeWorkersTableProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-card p-5 shadow-xs" aria-label="Trabajadores">
      <div className="mb-4 flex items-center gap-3">
        <UsersRound className="size-6 text-violet-600" aria-hidden="true" />
        <h2 className="text-lg font-bold">Trabajadores</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Trabajador</TableHead>
              <TableHead>Código</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={`worker-skeleton-${index}`}>
                  <TableCell colSpan={3}><div className="h-5 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No se pudieron cargar los trabajadores.</TableCell></TableRow>
            ) : workers.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No hay trabajadores para este proveedor.</TableCell></TableRow>
            ) : (
              workers.slice(0, 5).map((worker, index) => (
                <TableRow
                  key={`${worker.employeeCode}-${index}`}
                  className={onWorkerClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                  tabIndex={onWorkerClick ? 0 : undefined}
                  role={onWorkerClick ? "button" : undefined}
                  onClick={() => onWorkerClick?.(worker)}
                  onKeyDown={(event) => {
                    if (onWorkerClick && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault()
                      onWorkerClick(worker)
                    }
                  }}
                >
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">{initials(worker)}</span>
                      <span className="font-medium">{workerName(worker)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {worker.employeeCode || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
