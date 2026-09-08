import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Plus,
  Search,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeesPageHeader } from "../components"

const employees = [
  [
    "Cristofer234 Macase",
    "CM",
    "Prueba",
    "486429651",
    "solanomacascristofer@example.com",
    "+34622304138",
    "92038475",
    "Activo",
  ],
  [
    "Cristoferrr Macas",
    "CM",
    "Casa de papel",
    "48642965N",
    "solanomacascristofer@example.com",
    "+34622304133",
    "EMP-0115",
    "Activo",
  ],
  [
    "Pepee Solano",
    "PS",
    "Casa de papelII",
    "48642965P",
    "solanom@gmail.com",
    "",
    "9203847562",
    "Inactivo",
  ],
  [
    "Mario Solano Macas",
    "MS",
    "Prueba",
    "48642965M",
    "solono@gmail.com",
    "+34622304131",
    "EMP-0118",
    "Activo",
  ],
  [
    "Lucía Fernández",
    "LF",
    "Operaciones",
    "48642965T",
    "lucia.fernandez@example.com",
    "+34622304132",
    "EMP-0120",
    "Activo",
  ],
  [
    "Daniel Romero",
    "DR",
    "Administración",
    "48642965R",
    "daniel.romero@example.com",
    "+34622304139",
    "EMP-0121",
    "Inactivo",
  ],
  [
    "Sofía Navarro",
    "SN",
    "Soporte técnico",
    "48642965S",
    "sofia.navarro@example.com",
    "+34622304135",
    "EMP-0122",
    "Activo",
  ],
  [
    "Javier Martín",
    "JM",
    "Logística",
    "48642965J",
    "javier.martin@example.com",
    "+34622304136",
    "EMP-0123",
    "Activo",
  ],
] as const

const statusColors = { Activo: "text-emerald-600", Inactivo: "text-red-600" }

export function EmployeesPage() {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="employees-title">
      <EmployeesPageHeader
        title="Empleados"
        description="Gestiona y supervisa todos los empleados de tu organización."
      />

      <section>
        <section className="rounded-xl">
          <header className="flex flex-wrap items-center gap-3 pb-3">
            <InputGroup className="min-w-64 flex-1 bg-card">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Buscar empleado..." />
            </InputGroup>
            <Button variant="outline" className="bg-card">
              Tipo de trabajador <ChevronDown />
            </Button>
            <Button variant="outline" className="bg-card">
              Estado <ChevronDown />
            </Button>
            <Button variant="outline" className="bg-card">
              Ordenar: Más recientes <ChevronDown />
            </Button>
            <Button className="ml-auto">
              <Plus />
              Nuevo empleado
            </Button>
          </header>
          <div className="mt-3 overflow-x-auto border rounded-[10px]">
            <Table>
              <TableHeader className="bg-[#F5F5F5] text-sm">
                <TableRow>
                  <TableHead className="text-sm font-medium">
                    Empleado
                  </TableHead>
                  <TableHead className="text-sm font-medium">
                    Tipo de trabajador
                  </TableHead>
                  <TableHead className="text-sm font-medium">DNI</TableHead>
                  <TableHead className="text-sm font-medium">
                    Contacto
                  </TableHead>
                  <TableHead className="text-sm font-medium">
                    Teléfono
                  </TableHead>
                  <TableHead className="text-sm font-medium">Código</TableHead>
                  <TableHead className="text-sm font-medium">Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody className="py-2">
                {employees.map(
                  ([name, initials, type, dni, email, phone, code, status]) => (
                    <TableRow key={code}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://i.pravatar.cc/80?u=${code}`}
                              alt={`Avatar de ${name}`}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {code}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{type}</TableCell>
                      <TableCell className="text-sm">{dni}</TableCell>
                      <TableCell>
                        <p className="flex max-w-56 items-center gap-2 truncate text-sm text-muted-foreground">
                          <Mail className="size-4 shrink-0" />
                          {email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="size-4" />
                          {phone || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{code}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[status as keyof typeof statusColors]
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <footer className="t mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Filas por página: 5</span>
          <span>1–8 de 8</span>
          <nav className="flex gap-2" aria-label="Paginación">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight />
            </Button>
          </nav>
        </footer>
      </section>
    </section>
  )
}
