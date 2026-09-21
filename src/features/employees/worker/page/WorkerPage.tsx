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
import type { Worker } from "@/features/interface/worker/type/worker.inteface"

import { useGetWorkerByIdQuery } from "../api/workerApi"
import { WorkerContractsTab } from "../components/contract/WorkerContractsTab"
import { WorkerDocumentsTab } from "../components/document/WorkerDocumentsTab"
import { WorkerSettingsTab } from "../components/settings/WorkerSettingsTab"

const workerTabs = [
  { value: "personal", label: "Datos personales", icon: UserRound },
  { value: "contracts", label: "Contratos", icon: BriefcaseBusiness },
  { value: "documents", label: "Documentos", icon: FileText },
  { value: "settings", label: "Ajustes", icon: Settings2 },
] as const

function getWorkerFullName(worker: Worker) {
  return `${worker.name} ${worker.surname}`.trim()
}

function getWorkerInitials(worker: Worker) {
  const firstInitial = worker.name.trim().charAt(0)
  const lastInitial = worker.surname.trim().charAt(0)
  return `${firstInitial}${lastInitial}`.toUpperCase() || "TR"
}

function WorkerProfile({ worker }: { worker: Worker }) {
  const fullName = getWorkerFullName(worker)

  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center">
      <Avatar className="size-16" aria-label={`Avatar de ${fullName}`}>
        <AvatarImage
          src={`https://i.pravatar.cc/160?u=${worker.id}`}
          alt={`Avatar de ${fullName}`}
        />
        <AvatarFallback className="text-lg">
          {getWorkerInitials(worker)}
        </AvatarFallback>
      </Avatar>

      <section className="min-w-0 flex-1" aria-labelledby="worker-name">
        <h1 id="worker-name" className="text-2xl font-semibold tracking-tight">
          {fullName}
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
            {worker.email || "Sin email"}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {worker.phone || "Sin telefono"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-3.5" />
            {worker.workerTypeName || "Sin tipo"}
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
  worker: Worker
  canDeleteEmployee: boolean
  canUpdateEmployee: boolean
}

function PersonalDataForm({
  worker,
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
            name="name"
            label="Nombre"
            defaultValue={worker.name}
            disabled={!canUpdateEmployee}
          />
          <FormField
            id="worker-last-name"
            name="surname"
            label="Apellidos"
            defaultValue={worker.surname}
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
            defaultValue={worker.employeeCode}
            disabled={!canUpdateEmployee}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="worker-type">Tipo de trabajador</Label>
            <Select
              defaultValue={String(worker.workerTypeId)}
              name="workerTypeId"
              disabled={!canUpdateEmployee}
            >
              <SelectTrigger id="worker-type" className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(worker.workerTypeId)}>
                  {worker.workerTypeName || "Tipo actual"}
                </SelectItem>
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
              defaultValue={worker.observations ?? ""}
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
  const hasValidWorkerId = Number.isFinite(workerId) && workerId > 0
  const {
    data: worker,
    isLoading,
    isError,
  } = useGetWorkerByIdQuery(workerId, {
    skip: !hasValidWorkerId,
  })
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

  if (!hasValidWorkerId) {
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
              <BreadcrumbPage>Trabajador no valido</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          No existe un identificador valido para cargar el trabajador.
        </p>
      </article>
    )
  }

  if (isLoading) {
    return (
      <article className="rounded-xl border bg-background p-3 sm:p-5">
        <p className="text-sm text-muted-foreground">
          Cargando informacion del trabajador...
        </p>
      </article>
    )
  }

  if (isError || !worker) {
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
              <BreadcrumbPage>Trabajador no encontrado</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          No se pudo cargar la informacion del trabajador seleccionado.
        </p>
      </article>
    )
  }

  const workerFullName = getWorkerFullName(worker)

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
            <BreadcrumbPage>{workerFullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <WorkerProfile worker={worker} />
      <Tabs
        key={worker.id}
        defaultValue="personal"
        className="mt-5 min-w-0 flex-col gap-5"
      >
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
            worker={worker}
            canDeleteEmployee={canDeleteEmployee}
            canUpdateEmployee={canUpdateEmployee}
          />
        </TabsContent>
        {canViewContracts ? (
          <TabsContent value="contracts">
            <WorkerContractsTab
              workerId={workerId}
              workerName={workerFullName}
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
              currentAccount={
                worker.accountId && worker.accountUsername
                  ? {
                      id: worker.accountId,
                      username: worker.accountUsername,
                      status: "Activa",
                    }
                  : null
              }
              canUpdateSettings={canUpdateSettings}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </article>
  )
}
