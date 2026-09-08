import { Funnel, Plus, RotateCcw, Search } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { EmployeesPageHeader } from "../../components"

type Employee = {
  id: string
  name: string
  initials: string
  type: string
  dni: string
  email: string
  phone: string
  code: string
  status: "Activo" | "Inactivo"
}
const employees: Employee[] = [
  {
    id: "92038475",
    name: "Cristofer234 Macase",
    initials: "CM",
    type: "Prueba",
    dni: "486429651",
    email: "solanomacascristofer@example.com",
    phone: "+34622304138",
    code: "92038475",
    status: "Activo",
  },
  {
    id: "EMP-0115",
    name: "Cristoferrr Macas",
    initials: "CM",
    type: "Casa de papel",
    dni: "48642965N",
    email: "solanomacascristofer@example.com",
    phone: "+34622304133",
    code: "EMP-0115",
    status: "Activo",
  },
  {
    id: "9203847562",
    name: "Pepee Solano",
    initials: "PS",
    type: "Casa de papelII",
    dni: "48642965P",
    email: "solanom@gmail.com",
    phone: "",
    code: "9203847562",
    status: "Inactivo",
  },
  {
    id: "EMP-0118",
    name: "Mario Solano Macas",
    initials: "MS",
    type: "Prueba",
    dni: "48642965M",
    email: "solono@gmail.com",
    phone: "+34622304131",
    code: "EMP-0118",
    status: "Activo",
  },
  {
    id: "EMP-0120",
    name: "Lucía Fernández",
    initials: "LF",
    type: "Operaciones",
    dni: "48642965T",
    email: "lucia.fernandez@example.com",
    phone: "+34622304132",
    code: "EMP-0120",
    status: "Activo",
  },
  {
    id: "EMP-0121",
    name: "Daniel Romero",
    initials: "DR",
    type: "Administración",
    dni: "48642965R",
    email: "daniel.romero@example.com",
    phone: "+34622304139",
    code: "EMP-0121",
    status: "Inactivo",
  },
  {
    id: "EMP-0122",
    name: "Sofía Navarro",
    initials: "SN",
    type: "Soporte técnico",
    dni: "48642965S",
    email: "sofia.navarro@example.com",
    phone: "+34622304135",
    code: "EMP-0122",
    status: "Activo",
  },
  {
    id: "EMP-0123",
    name: "Javier Martín",
    initials: "JM",
    type: "Logística",
    dni: "48642965J",
    email: "javier.martin@example.com",
    phone: "+34622304136",
    code: "EMP-0123",
    status: "Activo",
  },
]

const columnHelper = createColumnHelper<DataTableFeatures, Employee>()

const employeeColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empleado" />
    ),
    size: 300,
    minSize: 220,
    cell: ({ row }) => {
      const employee = row.original

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`https://i.pravatar.cc/80?u=${employee.code}`}
              alt={`Avatar de ${employee.name}`}
            />
            <AvatarFallback>{employee.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-xs text-muted-foreground">ID: {employee.code}</p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de trabajador" />
    ),
    size: 210,
    minSize: 100,
  }),
  columnHelper.accessor("dni", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DNI" />
    ),
    size: 150,
    minSize: 120,
  }),
  columnHelper.accessor("code", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    size: 150,
    minSize: 120,
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    size: 150,
    minSize: 110,
    enableSorting: false,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.status === "Activo" ? "text-emerald-600" : "text-red-600"
        }
      >
        {row.original.status}
      </Badge>
    ),
  }),
])

function EmployeesFilters() {
  return (
    <section className="flex flex-col gap-6" aria-label="Filtros de empleados">
      <EmployeesPageHeader
        title="Empleados"
        description="Gestiona y supervisa todos los empleados de tu organización."
        action={
          <Button>
            <Plus />
            Nuevo empleado
          </Button>
        }
      />

      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="employee-name">Nombre</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="employee-name"
              name="name"
              placeholder="Nombre"
              className="h-8 pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-lastname">Apellidos</Label>
          <Input
            id="employee-lastname"
            name="lastname"
            placeholder="Apellidos"
            className="h-8"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-dni">DNI</Label>
          <Input
            id="employee-dni"
            name="dni"
            placeholder="DNI"
            className="h-8"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-email">Email</Label>
          <Input
            id="employee-email"
            name="email"
            type="email"
            placeholder="Email"
            className="h-8"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-phone">Teléfono</Label>
          <Input
            id="employee-phone"
            name="phone"
            type="tel"
            placeholder="Teléfono"
            className="h-8"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="employee-code">Código de empleado</Label>
          <Input
            id="employee-code"
            name="code"
            placeholder="Código de empleado"
            className="h-8"
          />
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3 sm:col-span-2 lg:col-span-2">
          <Button type="reset" variant="outline">
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
  return (
    <section className="flex flex-col gap-6" aria-label="Empleados">
      <EmployeesFilters />

      <section className="rounded-xl" aria-label="Herramientas de empleados">
        <DataTable
          data={employees}
          pageSize={10}
          columns={employeeColumns}
          getRowId={(employee) => employee.id}
          enableRowOrdering
          ariaLabel="Listado de empleados"
          emptyMessage="No hay empleados que coincidan."
        />
      </section>
    </section>
  )
}
