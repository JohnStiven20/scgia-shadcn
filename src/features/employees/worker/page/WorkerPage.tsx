import {
  BriefcaseBusiness,
  FileText,
  Mail,
  Phone,
  Save,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link, useParams } from "react-router-dom"
import { WorkerContractsTab } from "../components/contract/WorkerContractsTab"
import { WorkerDocumentsTab } from "../components/document/WorkerDocumentsTab"
import { WorkerSettingsTab } from "../components/settings/WorkerSettingsTab"

const worker = {
  id: "9203847562",
  firstName: "Pepee",
  lastName: "Solano",
  initials: "PS",
  dni: "48642965P",
  email: "solanom@gmail.com",
  phone: "",
  workerType: "Casa de papelII",
  observations: "Información adicional sobre el trabajador.",
}

const workerTabs = [
  { value: "personal", label: "Datos personales", icon: UserRound },
  { value: "contracts", label: "Contratos", icon: BriefcaseBusiness },
  { value: "documents", label: "Documentos", icon: FileText },
  { value: "settings", label: "Ajustes", icon: Settings2 },
] as const

function WorkerProfile() {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center">
      <Avatar className="size-16" aria-label={`Avatar de ${worker.firstName}`}>
        <AvatarImage
          src={`https://i.pravatar.cc/160?u=${worker.id}`}
          alt={`Avatar de ${worker.firstName} ${worker.lastName}`}
        />
        <AvatarFallback className="text-lg">{worker.initials}</AvatarFallback>
      </Avatar>

      <section className="min-w-0 flex-1" aria-labelledby="worker-name">
        <h1 id="worker-name" className="text-2xl font-semibold tracking-tight">
          {worker.firstName} {worker.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona la información y documentación del trabajador.
        </p>

        <address className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground not-italic">
          <a
            href={`mailto:${worker.email}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="size-3.5" />
            {worker.email}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {worker.phone || "Sin teléfono"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-3.5" />
            {worker.workerType}
          </span>
        </address>
      </section>
    </header>
  )
}

function FormField({
  id,
  label,
  ...inputProps
}: React.ComponentProps<typeof Input> & {
  id: string
  label: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}

function PersonalDataForm() {
  return (
    <form
      className="rounded-xl border bg-card p-4 sm:p-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <fieldset className="grid gap-5">
        <legend className="mb-5 text-base font-semibold">
          Datos personales
        </legend>
        <p className="-mt-4 text-xs text-muted-foreground">
          Edita la información principal y profesional del trabajador.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="worker-first-name"
            name="firstName"
            label="Nombre"
            defaultValue={worker.firstName}
          />
          <FormField
            id="worker-last-name"
            name="lastName"
            label="Apellidos"
            defaultValue={worker.lastName}
          />
          <FormField
            id="worker-dni"
            name="dni"
            label="DNI"
            defaultValue={worker.dni}
          />
          <FormField
            id="worker-code"
            name="code"
            label="Código de empleado"
            defaultValue={worker.id}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="worker-type">Tipo de trabajador</Label>
            <Select defaultValue={worker.workerType} name="workerType">
              <SelectTrigger id="worker-type" className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casa de papelII">Casa de papelII</SelectItem>
                <SelectItem value="Operaciones">Operaciones</SelectItem>
                <SelectItem value="Administración">Administración</SelectItem>
                <SelectItem value="Soporte técnico">Soporte técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            id="worker-email"
            name="email"
            type="email"
            label="Email"
            defaultValue={worker.email}
          />
          <FormField
            id="worker-phone"
            name="phone"
            type="tel"
            label="Teléfono"
            defaultValue={worker.phone}
            placeholder="+34 600 123 456"
          />

          <div className="grid gap-1.5 md:row-span-2">
            <Label htmlFor="worker-observations">Observaciones</Label>
            <Textarea
              id="worker-observations"
              name="observations"
              defaultValue={worker.observations}
              placeholder="Añade información relevante..."
              className="min-h-24"
            />
          </div>
        </div>
      </fieldset>

      <footer className="mt-5 flex justify-end pt-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="destructive">
            <Trash2 />
            Eliminar
          </Button>
          <Button type="submit">
            <Save />
            Guardar cambios
          </Button>
        </div>
      </footer>
    </form>
  )
}

export function WorkerPage() {
  const isMobile = useIsMobile()
  const { id } = useParams()
  const workerId = Number(id)

  return (
    <article className="rounded-xl border bg-background p-3 sm:p-5">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/employees" />}>
              Empleados
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {worker.firstName} {worker.lastName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <WorkerProfile />
      <Tabs
        defaultValue="personal"
        orientation={isMobile ? "vertical" : "horizontal"}
        className="mt-5 flex-col gap-5"
      >
        <TabsList
          variant="default"
          className="w-full max-w-full items-stretch justify-start md:w-fit md:items-center md:overflow-x-auto md:overflow-y-hidden"
        >
          {workerTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 px-3 max-md:justify-center!"
            >
              <tab.icon />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal">
          <PersonalDataForm />
        </TabsContent>
        <TabsContent value="contracts">
          <WorkerContractsTab
            workerId={workerId}
            workerName={`${worker.firstName} ${worker.lastName}`}
            workerDni={worker.dni}
          />
        </TabsContent>
        <TabsContent value="documents">
          <WorkerDocumentsTab workerId={workerId} />
        </TabsContent>
        <TabsContent value="settings">
          <WorkerSettingsTab workerId={workerId} />
        </TabsContent>
      </Tabs>
    </article>
  )
}
