import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Funnel, Plus, RotateCcw, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import type { Worker } from "@/features/interface/worker/type/worker.inteface"
import type { SearchWorkersParams } from "@/features/interface/worker/request/create-worker-request"
import { EmployeesPageHeader } from "../../components"
import {
  CARD_PAGE_SIZE_OPTIONS,
  employeeFiltersDefaultValues,
  useEmployeesPage,
} from "../hooks/useEmployeesPage"

type EmployeeTextFilterField = {
  key:
  | "firstName"
  | "surname"
  | "dni"
  | "email"
  | "phone"
  | "employeeCode"
  label: string
  placeholder: string
  type?: string
}

const employeeTextFilterFields: EmployeeTextFilterField[] = [
  { key: "firstName", label: "Nombre", placeholder: "Nombre" },
  { key: "surname", label: "Apellidos", placeholder: "Apellidos" },
  { key: "dni", label: "DNI", placeholder: "DNI" },
  { key: "email", label: "Email", placeholder: "Email", type: "email" },
  { key: "phone", label: "Teléfono", placeholder: "Teléfono", type: "tel" },
  {
    key: "employeeCode",
    label: "Código de empleado",
    placeholder: "Código de empleado",
  },
]

const columnHelper = createColumnHelper<DataTableFeatures, Worker>()

const employeeColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empleado" />
    ),
    size: 300,
    minSize: 220,
    cell: ({ row }) => {
      const worker = row.original

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`https://i.pravatar.cc/80?u=${worker.id}`}
              alt={`Avatar de ${worker.name} ${worker.surname}`}
            />
            <AvatarFallback>
              {worker.name.charAt(0)}
              {worker.surname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {worker.name} {worker.surname}
            </p>
            <p className="text-xs text-muted-foreground">
              ID: {worker.employeeCode}
            </p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("workerTypeName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de trabajador" />
    ),
    size: 210,
    minSize: 150,
  }),
  columnHelper.accessor("dni", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DNI" />
    ),
    size: 150,
    minSize: 120,
  }),
  columnHelper.accessor("employeeCode", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    size: 150,
    minSize: 120,
  }),
  columnHelper.accessor("active", {
    header: "Estado",
    size: 150,
    minSize: 110,
    enableSorting: false,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={row.original.active ? "text-emerald-600" : "text-red-600"}
      >
        {row.original.active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  }),
])

type EmployeesFiltersProps = {
  values: SearchWorkersParams
  workerTypes: { id: number; name: string }[]
  onApply: (values: SearchWorkersParams) => Promise<void>
  onReset: () => void
}

function EmployeesFilters({
  values,
  workerTypes,
  onApply,
  onReset,
}: EmployeesFiltersProps) {
  const [draft, setDraft] = useState<SearchWorkersParams>(values)

  const updateDraft = (key: keyof SearchWorkersParams, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="flex flex-col gap-6" aria-label="Filtros de empleados">
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          void onApply(draft)
        }}
      >
        {employeeTextFilterFields.map((field) => (
          <div className="grid gap-1.5" key={field.key}>
            <Label htmlFor={`employee-${field.key}`}>{field.label}</Label>
            <div className="relative">
              {field.key === "firstName" ? (
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              ) : null}
              <Input
                id={`employee-${field.key}`}
                name={field.key}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                value={String(draft[field.key] ?? "")}
                onChange={(event) => updateDraft(field.key, event.target.value)}
                className={field.key === "firstName" ? "h-8 pl-8" : "h-8"}
              />
            </div>
          </div>
        ))}

        <div className="grid gap-1.5">
          <Label htmlFor="employee-worker-type">Tipo de trabajador</Label>
          <Select
            value={draft.workerTypeId ? String(draft.workerTypeId) : "all"}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                workerTypeId: value === "all" ? undefined : Number(value),
              }))
            }
          >
            <SelectTrigger id="employee-worker-type" className="h-8 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {workerTypes.map((workerType) => (
                <SelectItem key={workerType.id} value={String(workerType.id)}>
                  {workerType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-status">Estado</Label>
          <Select
            value={draft.active === undefined ? "all" : String(draft.active)}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                active: value === "all" ? undefined : value === "true",
              }))
            }
          >
            <SelectTrigger id="employee-status" className="h-8 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(employeeFiltersDefaultValues)
              onReset()
            }}
          >
            <RotateCcw />
            Limpiar
          </Button>
          <Button type="submit">
            <Funnel />
            Aplicar filtros
          </Button>
        </div>
      </form>
    </section>
  )
}

export function EmployeesPage() {

  const { filters, pagination, navigation, data } = useEmployeesPage()

  return (
    <section className="flex flex-col gap-6" aria-label="Empleados">

      <EmployeesPageHeader
        title="Empleados"
        description="Gestiona y supervisa todos los empleados de tu organización."
        action={
          <Button type="button">
            <Plus />
            Nuevo empleado
          </Button>
        }
      />

      <EmployeesFilters
        values={filters.values}
        workerTypes={filters.workerTypes}
        onApply={filters.apply}
        onReset={filters.reset}
      />

      <section aria-label="Listado de empleados">
        <DataTable
          data={data.rows}
          columns={employeeColumns}
          getRowId={(worker) => String(worker.id)}
          onRowClick={(worker) => navigation.goToWorker(worker.id)}
          serverPagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            onPageChange: pagination.setPage,
            pageSizeOptions: CARD_PAGE_SIZE_OPTIONS,
            onPageSizeChange: pagination.setPageSize,
          }}
          ariaLabel="Listado de empleados"
          emptyMessage={
            data.isLoading
              ? "Cargando empleados..."
              : "No hay empleados que coincidan."
          }
        />
      </section>
    </section>
  )
}
