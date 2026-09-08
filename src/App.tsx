import { useState } from "react"
import { Outlet, RouterProvider, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Bell,
  CircleHelp,
  Activity,
  Box,
  ChevronLeft,
  ChevronRight,
  AtSign,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  UserPlus,
  User,
  Users,
  Pencil,
  Eye,
  Trash2,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpToLine,
  CornerUpLeft,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"
import { Badge } from "./components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import modelImage from "./assets/hgu_wifi_5_f.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"
import { AppRouter } from "./router/AppRouter"

const mockProjects = [
  {
    name: "Rediseño de la plataforma",
    owner: "Ana García",
    status: "En progreso",
    date: "12 sep 2026",
  },
  {
    name: "Campaña de lanzamiento",
    owner: "Carlos López",
    status: "Completado",
    date: "08 sep 2026",
  },
  {
    name: "Aplicación móvil",
    owner: "Lucía Martín",
    status: "Pendiente",
    date: "02 sep 2026",
  },
  {
    name: "Auditoría de seguridad",
    owner: "Miguel Torres",
    status: "En progreso",
    date: "28 ago 2026",
  },
]

const navigation = [
  { title: "Resumen", icon: LayoutDashboard },
  { title: "Proyectos", icon: FolderKanban },
  { title: "Equipo", icon: Users },
  { title: "Analíticas", icon: BarChart3 },
]

const secondaryNavigation = [
  { title: "Notificaciones", icon: Bell },
  { title: "Configuración", icon: Settings },
  { title: "Centro de ayuda", icon: CircleHelp },
]

const mockCustomers = [
  [
    "#5099",
    "Pagado",
    "Olivia Rhye",
    "Diseñadora UI/UX",
    "$3120",
    "03 Abr 2025",
    "1",
  ],
  [
    "#5008",
    "Borrador",
    "Barbara Steele",
    "Desarrolladora frontend",
    "$1450",
    "12 May 2025",
    "2",
  ],
  [
    "#5101",
    "Borrador",
    "Leonard Gordon",
    "Diseñador gráfico",
    "$1200",
    "26 Jun 2025",
    "3",
  ],
  [
    "#4586",
    "Pagado",
    "Evelyn Pope",
    "Diseñadora UI/UX",
    "$2680",
    "05 Jul 2025",
    "4",
  ],
  [
    "#4360",
    "Pagado",
    "Tommy Garza",
    "Desarrollador backend",
    "$3120",
    "07 Ago 2025",
    "5",
  ],
] as const

const mockModels = [
  [
    "DECODIFICADORES",
    "Descripción",
    "Movistar",
    "8 identificadores",
    "Activo",
    "2/9/26, 18:24",
  ],
  [
    "HGU WIFI 6",
    "Descripción",
    "Movistar",
    "2 identificadores",
    "Activo",
    "2/9/26, 18:21",
  ],
  [
    "ACOMETIDA INTERIOR 30 METROS",
    "dw edwed ew",
    "Movistar",
    "1 identificador",
    "Activo",
    "2/9/26, 14:58",
  ],
  [
    "HGU WIFI 5",
    "ihuyuguyg",
    "Movistar",
    "4 identificadores",
    "Activo",
    "28/8/26, 11:15",
  ],
] as const

function ModelsTable() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3 overflow-auto border-b p-1 pb-4">
        <InputGroup className="max-w-sm min-w-50">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar modelo..." />
        </InputGroup>
        <Button variant="outline">
          Proveedor <ChevronDown />
        </Button>
        <Button variant="outline">
          Estado <ChevronDown />
        </Button>
        <Button variant="outline">
          Ordenar: Más recientes <ChevronDown />
        </Button>
        <Button className="ml-auto">
          <Plus />
          Nuevo modelo
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[280px] md:min-w-0">Modelo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Identificadores</TableHead>
              <TableHead>Estado de uso</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockModels.map(
              ([name, description, provider, identifiers, status, date]) => (
                <TableRow key={name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        className="size-10 object-contain"
                        src={modelImage}
                        alt={name}
                      />
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{provider}</Badge>
                  </TableCell>
                  <TableCell>{identifiers}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">● {status}</Badge>
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ver ${name}`}
                    >
                      ›
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between pt-4">
        <span>Mostrando 1-4 de 4</span>
        <div>
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft />
          </Button>
          <Button>1</Button>
          <Button variant="outline" size="icon">
            <ChevronRight />
          </Button>
        </div>
        <Button variant="outline">
          10 por página <ChevronDown />
        </Button>
      </div>
    </div>
  )
}

const customerTableConfig = {
  title: "Clientes",
  showLabel: "Mostrar",
  pageSize: 5,
  searchPlaceholder: "Buscar cliente",
  statusFilter: "Todos",
  headers: ["ID", "Estado", "Cliente", "Total", "Fecha de emisión", "Acciones"],
  previousLabel: "Anterior",
  nextLabel: "Siguiente",
  summary: "Mostrando 5 de 15 registros",
  selectedSummary: "0 de 5 filas seleccionadas.",
  tableMinWidth: "w-full",
  containerMaxWidth: "w-full",
} as const

const projectsTableConfig = {
  tableMinWidth: "w-full",
  containerMaxWidth: "w-full",
} as const

const actionLabels = {
  delete: "Eliminar",
  view: "Ver",
  edit: "Editar",
} as const

const statusColors: Record<string, string> = {
  Pagado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Completado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Borrador:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Pendiente:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "En progreso":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
}

function CustomersTable() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{customerTableConfig.showLabel}</span>
          <Button variant="outline">
            {customerTableConfig.pageSize} <ChevronDown />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={customerTableConfig.searchPlaceholder}
            />
          </InputGroup>
          <Button variant="outline">
            {customerTableConfig.statusFilter} <ChevronDown />
          </Button>
        </div>
      </div>
      <div
        className={`${customerTableConfig.containerMaxWidth} rounded-md border`}
      >
        <Table className={customerTableConfig.tableMinWidth}>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {customerTableConfig.headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCustomers.map(
              ([id, status, name, role, total, date, avatar]) => (
                <TableRow key={id}>
                  <TableCell>
                    <input type="checkbox" aria-label={`Seleccionar ${id}`} />
                  </TableCell>
                  <TableCell>{id}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[status]}>{status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex-column flex gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://i.pravatar.cc/80?img=${avatar}`}
                        />
                        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{name}</p>
                        <p>{role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{total}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={actionLabels.delete}
                      >
                        <Trash2 />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={actionLabels.view}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={actionLabels.edit}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4 text-sm text-muted-foreground">
        <span>{customerTableConfig.summary}</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            {customerTableConfig.previousLabel}
          </Button>
          <Button>1</Button>
          <Button variant="outline">
            {customerTableConfig.nextLabel} <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfileCard() {
  return (
    <div className="w-62.5 rounded-lg border p-3">
      <FieldSet>
        <FieldLegend>Perfil</FieldLegend>
        <FieldDescription>
          Esta información aparece en facturas y correos electrónicos.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <User />
              </InputGroupAddon>
              <InputGroupInput id="name" placeholder="Evil Rabbit" />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <AtSign />
              </InputGroupAddon>
              <InputGroupInput
                id="username"
                aria-invalid
                placeholder="nombre de usuario"
              />
            </InputGroup>
            <FieldError>Elige otro nombre de usuario.</FieldError>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="newsletter">Suscribirse al boletín</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function App() {
  return (
    <RouterProvider router={AppRouter}>
    </RouterProvider>
  )
}

export default App
