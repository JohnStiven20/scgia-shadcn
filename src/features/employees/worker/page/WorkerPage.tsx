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
import { Link, useParams } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

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
  observations: "Informacion adicional sobre el trabajador.",
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
          Gestiona la informacion y documentacion del trabajador.
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
            {worker.phone || "Sin telefono"}
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

type PersonalDataFormProps = {
  canDeleteEmployee: boolean
  canUpdateEmployee: boolean
}

function PersonalDataForm({
  canDeleteEmployee,
  canUpdateEmployee,
}: PersonalDataFormProps) {
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
          Edita la informacion principal y profesional del trabajador.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="worker-first-name"
            name="firstName"
            label="Nombre"
            defaultValue={worker.firstName}
            disabled={!canUpdateEmployee}
          />
          <FormField
            id="worker-last-name"
            name="lastName"
            label="Apellidos"
            defaultValue={worker.lastName}
            disabled={!canUpdateEmployee}
          />
          <FormField
            id="worker-dni"
            name="dni"
            label="DNI"
            defaultValue={worker.dni}
            disabled={!canUpdateEmployee}
          />
          <FormField
            id="worker-code"
            name="code"
            label="Codigo de empleado"
            defaultValue={worker.id}
            disabled={!canUpdateEmployee}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="worker-type">Tipo de trabajador</Label>
            <Select
              defaultValue={worker.workerType}
              name="workerType"
              disabled={!canUpdateEmployee}
            >
              <SelectTrigger id="worker-type" className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casa de papelII">Casa de papelII</SelectItem>
                <SelectItem value="Operaciones">Operaciones</SelectItem>
                <SelectItem value="Administracion">Administracion</SelectItem>
                <SelectItem value="Soporte tecnico">Soporte tecnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            id="worker-email"
            name="email"
            type="email"
            label="Email"
            defaultValue={worker.email}
            disabled={!canUpdateEmployee}
          />
          <FormField
            id="worker-phone"
            name="phone"
            type="tel"
            label="Telefono"
            defaultValue={worker.phone}
            placeholder="+34 600 123 456"
            disabled={!canUpdateEmployee}
          />

          <div className="grid gap-1.5 md:row-span-2">
            <Label htmlFor="worker-observations">Observaciones</Label>
            <Textarea
              id="worker-observations"
              name="observations"
              defaultValue={worker.observations}
              placeholder="Anade informacion relevante..."
              className="min-h-24"
              disabled={!canUpdateEmployee}
            />
          </div>
        </div>
      </fieldset>

      {canDeleteEmployee || canUpdateEmployee ? (
        <footer className="mt-5 flex justify-end pt-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canDeleteEmployee ? (
              <Button type="button" variant="destructive">
                <Trash2 />
                Eliminar
              </Button>
            ) : null}
            {canUpdateEmployee ? (
              <Button type="submit">
                <Save />
                Guardar cambios
              </Button>
            ) : null}
          </div>
        </footer>
      ) : null}
    </form>
  )
}

export function WorkerPage() {
  const { id } = useParams()
  const workerId = Number(id)
  const { hasPermission } = useAuthAccess()
  const canUpdateEmployee = hasPermission("employee.update")
  const canDeleteEmployee = hasPermission("employee.delete")
  const canViewContracts = hasPermission("employee.contract.view")
  const canCreateContract = hasPermission("employee.contract.create")
  const canUpdateContract = hasPermission("employee.contract.update")
  const canCancelContract = hasPermission("employee.contract.cancel")
  const canViewCredentials = hasPermission("employee.credential.view")
  const canCreateCredential = hasPermission("employee.credential.create")
  const canUpdateCredential = hasPermission("employee.credential.update")
  const canDeleteCredential = hasPermission("employee.credential.delete")
  const canDownloadCredential = hasPermission("employee.credential.download")
  const canViewSettings = hasPermission("employee.settings.view")
  const canUpdateSettings = hasPermission("employee.settings.update")
  const visibleTabs = workerTabs.filter((tab) => {
    if (tab.value === "contracts") return canViewContracts
    if (tab.value === "documents") return canViewCredentials
    if (tab.value === "settings") return canViewSettings
    return true
  })

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
      <Tabs defaultValue="personal" className="mt-5 min-w-0 flex-col gap-5">
        <TabsList
          variant="default"
          className="w-full max-w-full items-stretch justify-start overflow-x-auto overflow-y-hidden md:w-fit"
        >
          {visibleTabs.map((tab) => (
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
          <PersonalDataForm
            canDeleteEmployee={canDeleteEmployee}
            canUpdateEmployee={canUpdateEmployee}
          />
        </TabsContent>
        {canViewContracts ? (
          <TabsContent value="contracts">
            <WorkerContractsTab
              workerId={workerId}
              workerName={`${worker.firstName} ${worker.lastName}`}
              workerDni={worker.dni}
              canCancelContract={canCancelContract}
              canCreateContract={canCreateContract}
              canUpdateContract={canUpdateContract}
            />
          </TabsContent>
        ) : null}
        {canViewCredentials ? (
          <TabsContent value="documents" className="min-w-0">
            <WorkerDocumentsTab
              workerId={workerId}
              canCreateCredential={canCreateCredential}
              canDeleteCredential={canDeleteCredential}
              canDownloadCredential={canDownloadCredential}
              canUpdateCredential={canUpdateCredential}
            />
          </TabsContent>
        ) : null}
        {canViewSettings ? (
          <TabsContent value="settings">
            <WorkerSettingsTab
              workerId={workerId}
              canUpdateSettings={canUpdateSettings}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </article>
  )
}
