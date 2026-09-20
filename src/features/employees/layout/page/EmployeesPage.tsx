import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Funnel, Plus, RotateCcw, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { useGetWorkerTypesQuery } from "@/features/employees/employee-types/api/workerTypeApi"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import type { Worker } from "@/features/interface/worker/type/worker.inteface"
import type { SearchWorkersParams } from "@/features/interface/worker/request/create-worker-request"
import { EmployeesPageHeader } from "../../components"
import {
  CARD_PAGE_SIZE_OPTIONS,
  employeeFiltersDefaultValues,
  useEmployeesPage,
} from "../hooks/useEmployeesPage"

type EmployeeTextFilterField = {
  key: "firstName" | "employeeCode"
  label: string
  placeholder: string
}

const employeeTextFilterFields: EmployeeTextFilterField[] = [
  { key: "firstName", label: "Nombre", placeholder: "Nombre" },
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
  onApply: (values: SearchWorkersParams) => Promise<void>
  onReset: () => void
}

type CreateEmployeeFormValues = {
  firstName: string
  surname: string
  dni: string
  email: string
  phone: string
  active: boolean
  observations: string
  employeeCode: string
  workerTypeId: number
}

type CreateEmployeeDialogProps = {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (values: CreateEmployeeFormValues) => Promise<void>
}

const EMPTY_CREATE_EMPLOYEE_FORM: CreateEmployeeFormValues = {
  firstName: "",
  surname: "",
  dni: "",
  email: "",
  phone: "",
  active: true,
  observations: "",
  employeeCode: "",
  workerTypeId: 0,
}

function EmployeesFilters({ values, onApply, onReset }: EmployeesFiltersProps) {
  const [draft, setDraft] = useState<SearchWorkersParams>(values)

  const updateDraft = (key: keyof SearchWorkersParams, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <section aria-label="Filtros de empleados">
      <form
        className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
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
                placeholder={field.placeholder}
                value={String(draft[field.key] ?? "")}
                onChange={(event) => updateDraft(field.key, event.target.value)}
                className={field.key === "firstName" ? "h-8 pl-8" : "h-8"}
              />
            </div>
          </div>
        ))}

        <div className="flex flex-wrap justify-end gap-3 md:col-start-3">
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

function CreateEmployeeDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateEmployeeDialogProps) {
  const [values, setValues] = useState<CreateEmployeeFormValues>(
    EMPTY_CREATE_EMPLOYEE_FORM
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { data: workerTypesPage, isLoading: isLoadingWorkerTypes } =
    useGetWorkerTypesQuery(
      { page: 0, size: 100, sort: ["name,asc"] },
      { skip: !open }
    )
  const workerTypes = workerTypesPage?.content ?? []
  const selectedWorkerType = workerTypes.find(
    (workerType) => workerType.id === values.workerTypeId
  )

  const updateValue = <TKey extends keyof CreateEmployeeFormValues>(
    key: TKey,
    value: CreateEmployeeFormValues[TKey]
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  const close = () => {
    if (loading) return
    setValues(EMPTY_CREATE_EMPLOYEE_FORM)
    setErrors({})
    onClose()
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.firstName.trim()) nextErrors.firstName = "El nombre es obligatorio."
    if (!values.surname.trim()) nextErrors.surname = "Los apellidos son obligatorios."
    if (!values.dni.trim()) nextErrors.dni = "El DNI es obligatorio."
    if (!values.email.trim()) nextErrors.email = "El email es obligatorio."
    if (!values.employeeCode.trim()) {
      nextErrors.employeeCode = "El codigo de empleado es obligatorio."
    }
    if (!values.workerTypeId) {
      nextErrors.workerTypeId = "Selecciona un tipo de trabajador."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close()
      }}
    >
      <DialogContent className="max-h-[min(92svh,760px)] max-w-2xl overflow-y-auto">
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!validate()) return
            void onSubmit(values)
          }}
        >
          <DialogHeader>
            <DialogTitle>Nuevo empleado</DialogTitle>
            <DialogDescription>
              Registra los datos principales del trabajador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="employee-first-name">Nombre</Label>
              <Input
                id="employee-first-name"
                value={values.firstName}
                disabled={loading}
                aria-invalid={Boolean(errors.firstName)}
                onChange={(event) => updateValue("firstName", event.target.value)}
              />
              {errors.firstName ? (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-surname">Apellidos</Label>
              <Input
                id="employee-surname"
                value={values.surname}
                disabled={loading}
                aria-invalid={Boolean(errors.surname)}
                onChange={(event) => updateValue("surname", event.target.value)}
              />
              {errors.surname ? (
                <p className="text-xs text-destructive">{errors.surname}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-dni">DNI</Label>
              <Input
                id="employee-dni"
                value={values.dni}
                disabled={loading}
                aria-invalid={Boolean(errors.dni)}
                onChange={(event) => updateValue("dni", event.target.value)}
              />
              {errors.dni ? (
                <p className="text-xs text-destructive">{errors.dni}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-code">Codigo de empleado</Label>
              <Input
                id="employee-code"
                value={values.employeeCode}
                disabled={loading}
                aria-invalid={Boolean(errors.employeeCode)}
                onChange={(event) =>
                  updateValue("employeeCode", event.target.value)
                }
              />
              {errors.employeeCode ? (
                <p className="text-xs text-destructive">{errors.employeeCode}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input
                id="employee-email"
                type="email"
                value={values.email}
                disabled={loading}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => updateValue("email", event.target.value)}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-phone">Telefono</Label>
              <Input
                id="employee-phone"
                value={values.phone}
                disabled={loading}
                onChange={(event) => updateValue("phone", event.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="employee-worker-type">Tipo de trabajador</Label>
              <Select
                value={values.workerTypeId ? String(values.workerTypeId) : ""}
                disabled={loading || isLoadingWorkerTypes}
                onValueChange={(value) =>
                  updateValue("workerTypeId", Number(value))
                }
              >
                <SelectTrigger
                  id="employee-worker-type"
                  aria-invalid={Boolean(errors.workerTypeId)}
                >
                  <span>
                    {selectedWorkerType?.name ??
                      (isLoadingWorkerTypes
                        ? "Cargando tipos..."
                        : "Selecciona un tipo")}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {workerTypes.map((workerType) => (
                    <SelectItem key={workerType.id} value={String(workerType.id)}>
                      {workerType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.workerTypeId ? (
                <p className="text-xs text-destructive">{errors.workerTypeId}</p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="employee-observations">Observaciones</Label>
              <Textarea
                id="employee-observations"
                value={values.observations}
                disabled={loading}
                onChange={(event) =>
                  updateValue("observations", event.target.value)
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2 sm:col-span-2">
              <div className="grid gap-1">
                <Label htmlFor="employee-active">Activo</Label>
                <p className="text-xs text-muted-foreground">
                  El empleado activo aparece disponible en los listados.
                </p>
              </div>
              <Switch
                id="employee-active"
                checked={values.active}
                disabled={loading}
                onCheckedChange={(checked) => updateValue("active", checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={close}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EmployeesPage() {
  const { filters, pagination, createWorker, navigation, data } =
    useEmployeesPage()
  const { hasPermission } = useAuthAccess()
  const canCreateEmployee = hasPermission("employee.create")

  return (
    <section className="flex flex-col gap-6" aria-label="Empleados">
      <EmployeesPageHeader
        title="Empleados"
        description="Gestiona y supervisa todos los empleados de tu organización."
        action={
          canCreateEmployee ? (
            <Button type="button" onClick={() => createWorker.setOpen(true)}>
              <Plus />
              Nuevo empleado
            </Button>
          ) : null
        }
      />

      <section aria-label="Listado de empleados">
        <DataTable
          data={data.rows}
          columns={employeeColumns}
          isLoading={data.isLoading}
          getRowId={(worker) => String(worker.id)}
          onRowClick={(worker) => navigation.goToWorker(worker.id)}
          renderToolbar={() => (
            <EmployeesFilters
              values={filters.values}
              onApply={filters.apply}
              onReset={filters.reset}
            />
          )}
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

      <CreateEmployeeDialog
        open={createWorker.open}
        loading={createWorker.isSubmitting}
        onClose={() => createWorker.setOpen(false)}
        onSubmit={createWorker.submit}
      />
    </section>
  )
}
