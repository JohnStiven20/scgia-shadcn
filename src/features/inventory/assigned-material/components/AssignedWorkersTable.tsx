import { useMemo, useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Search, UsersRound } from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { AssignedWorkerResponse } from "../interface/AssignedWorkerResponse"

type AssignedWorkersTableProps = {
  workers: AssignedWorkerResponse[]
  isLoading?: boolean
  onWorkerClick?: (worker: AssignedWorkerResponse) => void
}

const columnHelper = createColumnHelper<DataTableFeatures, AssignedWorkerResponse>()

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDate(value: string | null) {
  if (!value) return "Sin asignaciones"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export function AssignedWorkersTable({
  workers,
  isLoading = false,
  onWorkerClick,
}: AssignedWorkersTableProps) {
  const [search, setSearch] = useState("")
  const filteredWorkers = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return workers

    return workers.filter((worker) =>
      [worker.workerName, worker.workerLastName, worker.workerCode]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    )
  }, [search, workers])

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("workerName", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Trabajador" />,
          cell: ({ row }) => (
            <span className="font-medium">
              {row.original.workerName} {row.original.workerLastName}
            </span>
          ),
          size: 240,
          minSize: 180,
        }),
        columnHelper.accessor("workerCode", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
          size: 130,
          minSize: 110,
        }),
        columnHelper.accessor("totalProducts", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Productos asignados" />,
          cell: ({ row }) => (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {row.original.totalProducts.toLocaleString("es-ES")}
            </span>
          ),
          size: 170,
          minSize: 150,
        }),
        columnHelper.accessor("totalModels", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Modelos distintos" />,
          size: 150,
          minSize: 130,
        }),
        columnHelper.accessor("lastAssignment", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Última asignación" />,
          cell: ({ row }) => formatDate(row.original.lastAssignment),
          size: 190,
          minSize: 170,
        }),
      ]),
    []
  )

  return (
    <Card aria-label="Trabajadores con material asignado">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="size-5 text-blue-600" aria-hidden="true" />
          Trabajadores ({workers.length})
        </CardTitle>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder="Buscar trabajador o código"
            className="pl-8"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <DataTable
          data={filteredWorkers}
          columns={columns}
          getRowId={(worker) => String(worker.workerId)}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          isLoading={isLoading}
          onRowClick={onWorkerClick}
          ariaLabel="Trabajadores con material asignado"
          emptyMessage={search ? "No hay trabajadores que coincidan con la búsqueda." : "No hay trabajadores con material asignado."}
        />
      </CardContent>
    </Card>
  )
}
