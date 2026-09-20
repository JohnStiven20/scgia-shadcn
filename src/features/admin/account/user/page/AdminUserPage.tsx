import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Laptop,
  Mail,
  MonitorSmartphone,
  Moon,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import { useGlobalError } from "@/hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  useDeleteAccountMutation,
  useFindAccountByIdQuery,
  useUpdateAccountMutation,
} from "@/features/admin/account/api/accountApi"
import { useFindAllRolesQuery } from "@/features/admin/roles/api/roleApi"
import {
  useFindAccountRolesByAccountIdQuery,
  useReplaceAccountRolesMutation,
} from "@/features/api/accountRoleApi"
import {
  useFindAccountSettingByAccountIdQuery,
  useUpdateAccountSettingByAccountIdMutation,
} from "@/features/api/accountSettingApi"
import type { AccountSettingUpdateRequest } from "@/features/interface/account-setting/request/account-setting-update-request"
import type { AccountSetting } from "@/features/interface/account-setting/type/account-setting-base"
import type { Role } from "@/features/interface/role/type/role-base"
import type { Account } from "@/features/interface/account/type/account-base"
import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import {
  ACCOUNT_TYPE_LABELS,
  formatAccountDate,
  getAccountCode,
  getAccountInitial,
} from "../../utils"

const accountTabs = [
  { value: "general", label: "Datos de cuenta", icon: UserRound },
  { value: "roles", label: "Roles asignados", icon: ShieldCheck },
  { value: "settings", label: "Configuraciones", icon: Settings2 },
] as const

type AccountFormValues = {
  username: string
  typeAccount: TypeAccount
  isactive: boolean
}

const ACCOUNT_TYPE_ICONS = {
  WEB: Laptop,
  MOBILE: Smartphone,
  BOTH: MonitorSmartphone,
} as const satisfies Record<TypeAccount, typeof Laptop>

function getAccountDisplayName(username: string) {
  const name = username.includes("@") ? username.split("@")[0] : username

  return name.trim() || "-"
}

function getAccountEmail(username: string) {
  return username.includes("@") ? username : "Sin correo"
}

function formatAccountRoles(roles: Account["roles"]) {
  if (!roles?.length) {
    return []
  }

  return roles
    .map((role) => (typeof role === "string" ? role : role.name))
    .filter(Boolean)
}

function areRoleIdsEqual(first: number[], second: number[]) {
  if (first.length !== second.length) {
    return false
  }

  const sortedFirst = [...first].sort((a, b) => a - b)
  const sortedSecond = [...second].sort((a, b) => a - b)

  return sortedFirst.every((roleId, index) => roleId === sortedSecond[index])
}

function AccountBreadcrumb({ account }: { account?: Account }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/admin/users" />}>
            Cuentas
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {account ? getAccountDisplayName(account.username) : "Detalle"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function AccountProfile({
  account,
  canDelete,
  onDelete,
}: {
  account: Account
  canDelete: boolean
  onDelete: () => void
}) {
  const TypeIcon = ACCOUNT_TYPE_ICONS[account.typeAccount]

  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center">
      <div
        className="grid size-16 shrink-0 place-items-center rounded-md border bg-orange-100 text-lg font-semibold text-orange-700"
        aria-label={`Avatar de ${account.username}`}
      >
        {getAccountInitial(account.username)}
      </div>

      <section className="min-w-0 flex-1" aria-labelledby="account-name">
        <h1 id="account-name" className="text-2xl font-semibold tracking-tight">
          {getAccountDisplayName(account.username)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona la informacion y referencias de la cuenta del sistema.
        </p>

        <address className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground not-italic">
          <span className="inline-flex items-center gap-1.5">
            <KeyRound className="size-3.5" />
            {getAccountCode(account.id)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TypeIcon className="size-3.5" />
            {ACCOUNT_TYPE_LABELS[account.typeAccount]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatAccountDate(account.createdAt)}
          </span>
        </address>
      </section>

      <Badge
        variant="outline"
        className={account.isactive ? "text-emerald-600" : "text-red-600"}
      >
        {account.isactive ? "Activa" : "Inactiva"}
      </Badge>

      {canDelete ? (
        <Button
          type="button"
          variant="destructive"
          className="sm:ml-2"
          onClick={onDelete}
        >
          <Trash2 />
          Eliminar
        </Button>
      ) : null}
    </header>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b py-3 last:border-b-0 sm:nth-[n+5]:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-semibold">{value}</dd>
    </div>
  )
}

function AccountGeneralTab({
  account,
  canUpdate,
  isSaving,
  onSubmit,
}: {
  account: Account
  canUpdate: boolean
  isSaving: boolean
  onSubmit: (values: AccountFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<AccountFormValues>({
    username: account.username,
    typeAccount: account.typeAccount,
    isactive: account.isactive,
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return

    await onSubmit({
      ...values,
      username: values.username.trim(),
    })
  }

  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="border-b pb-4">
        <h2 className="text-base font-semibold">Datos de cuenta</h2>
        <p className="text-xs text-muted-foreground">
          Edita la informacion principal devuelta por la peticion de detalle.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
            <DetailItem label="Codigo" value={getAccountCode(account.id)} />
            <DetailItem
              label="Correo"
              value={getAccountEmail(values.username)}
            />
            <DetailItem
              label="Fecha de creacion"
              value={formatAccountDate(account.createdAt)}
            />
          </dl>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="account-detail-username">Usuario</Label>
              <Input
                id="account-detail-username"
                value={values.username}
                disabled={!canUpdate || isSaving}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="account-detail-type">Tipo de cuenta</Label>
              <Select
                value={values.typeAccount}
                disabled={!canUpdate || isSaving}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    typeAccount: value as TypeAccount,
                  }))
                }
              >
                <SelectTrigger id="account-detail-type" className="w-full">
                  <span>{ACCOUNT_TYPE_LABELS[values.typeAccount]}</span>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="account-detail-status">Estado</Label>
              <Select
                value={String(values.isactive)}
                disabled={!canUpdate || isSaving}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    isactive: value === "true",
                  }))
                }
              >
                <SelectTrigger id="account-detail-status" className="w-full">
                  <span>{values.isactive ? "Activa" : "Inactiva"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activa</SelectItem>
                  <SelectItem value="false">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {canUpdate ? (
            <footer className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={isSaving || !values.username.trim()}
              >
                <Save />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </footer>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}

function AccountRolesTab({
  account,
  availableRoles,
  canUpdateRoles,
  selectedRoleIds,
  persistedRoleIds,
  isLoadingRoles,
  isSavingRoles,
  onToggleRole,
  onSaveRoles,
}: {
  account: Account
  availableRoles: Role[]
  canUpdateRoles: boolean
  selectedRoleIds: number[]
  persistedRoleIds: number[]
  isLoadingRoles: boolean
  isSavingRoles: boolean
  onToggleRole: (roleId: number) => void
  onSaveRoles: () => Promise<void>
}) {
  const assignedRoleNames = formatAccountRoles(account.roles)
  const selectedRoleIdsSet = new Set(selectedRoleIds)
  const isDirty = !areRoleIdsEqual(persistedRoleIds, selectedRoleIds)

  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid gap-3 border-b pb-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-base font-semibold">Roles asignados</h2>
          <p className="text-xs text-muted-foreground">
            Marca los roles que tendra esta cuenta y guarda los cambios.
          </p>
        </div>
        {canUpdateRoles ? (
          <Button
            type="button"
            disabled={!isDirty || isSavingRoles}
            onClick={() => void onSaveRoles()}
          >
            <Save />
            {isSavingRoles ? "Guardando..." : "Guardar cambios"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <section className="grid gap-4" aria-label="Roles de la cuenta">
          {assignedRoleNames.length ? (
            <div className="flex flex-wrap gap-2">
              {assignedRoleNames.map((role) => (
                <Badge key={role} variant="outline">
                  <ShieldCheck />
                  {role}
                </Badge>
              ))}
            </div>
          ) : null}

          {isLoadingRoles ? (
            <p className="text-sm text-muted-foreground">Cargando roles...</p>
          ) : canUpdateRoles && availableRoles.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableRoles.map((role) => {
                const assigned = selectedRoleIdsSet.has(role.id)

                return (
                  <label
                    key={role.id}
                    className="flex cursor-pointer gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-muted/40 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/60"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-blue-600"
                      checked={assigned}
                      disabled={!canUpdateRoles || isSavingRoles}
                      onChange={() => onToggleRole(role.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="inline-flex min-w-0 items-center gap-2 font-semibold">
                          <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{role.name}</span>
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            assigned
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "text-muted-foreground"
                          }
                        >
                          {assigned ? "Asignado" : "Sin asignar"}
                        </Badge>
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {role.description || "Sin descripcion"}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay roles disponibles.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

function AccountSettingsTab({
  accountId,
  canUpdateSettings,
  settings,
  isLoading,
}: {
  accountId: number
  canUpdateSettings: boolean
  settings: AccountSetting | null
  isLoading: boolean
}) {
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const [updateAccountSettingByAccountId, { isLoading: isSaving }] =
    useUpdateAccountSettingByAccountIdMutation()
  const defaultValues = useMemo<AccountSettingUpdateRequest>(
    () => ({
      darkMode: settings?.darkMode ?? false,
      emailNotificationsEnabled: settings?.emailNotificationsEnabled ?? false,
    }),
    [settings?.darkMode, settings?.emailNotificationsEnabled]
  )
  const [values, setValues] =
    useState<AccountSettingUpdateRequest>(defaultValues)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setValues(defaultValues)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [defaultValues])

  const isDirty =
    values.darkMode !== defaultValues.darkMode ||
    values.emailNotificationsEnabled !== defaultValues.emailNotificationsEnabled

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdateSettings) return

    try {
      await updateAccountSettingByAccountId({
        accountId,
        request: values,
      }).unwrap()
      notifications.success("Configuraciones actualizadas correctamente.")
    } catch (error) {
      handleError(
        error,
        "No se pudieron actualizar las configuraciones de la cuenta."
      )
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cargando configuraciones...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="border-b pb-4">
        <h2 className="text-base font-semibold">Configuraciones de cuenta</h2>
        <p className="text-xs text-muted-foreground">
          Preferencias visuales y notificaciones de la cuenta administrativa.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-md border bg-card p-4 transition-colors hover:bg-muted/40 has-[[data-slot=switch][data-checked]]:border-blue-200 has-[[data-slot=switch][data-checked]]:bg-blue-50/60">
              <span className="flex min-w-0 gap-3">
                <Moon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    Modo oscuro
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Activa la preferencia de tema oscuro para esta cuenta.
                  </span>
                </span>
              </span>
              <Switch
                checked={values.darkMode}
                disabled={!canUpdateSettings || isSaving}
                onCheckedChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    darkMode: checked,
                  }))
                }
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-md border bg-card p-4 transition-colors hover:bg-muted/40 has-[[data-slot=switch][data-checked]]:border-blue-200 has-[[data-slot=switch][data-checked]]:bg-blue-50/60">
              <span className="flex min-w-0 gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    Notificaciones por correo
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Permite recibir avisos y actualizaciones por email.
                  </span>
                </span>
              </span>
              <Switch
                checked={values.emailNotificationsEnabled}
                disabled={!canUpdateSettings || isSaving}
                onCheckedChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    emailNotificationsEnabled: checked,
                  }))
                }
              />
            </label>
          </div>

          {canUpdateSettings ? (
            <footer className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setValues(defaultValues)}
              >
                Restablecer
              </Button>
              <Button type="submit" disabled={!isDirty || isSaving}>
                <Save />
                {isSaving ? "Guardando..." : "Guardar configuraciones"}
              </Button>
            </footer>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminUserPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { id } = useParams()
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const { hasPermission } = useAuthAccess()
  const canUpdateAccount = hasPermission("account.update")
  const canDeleteAccount = hasPermission("account.delete")
  const canUpdateAccountRoles = hasPermission("account.roles.update")
  const canUpdateAccountSettings = hasPermission("account.settings.update")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const accountId = Number(id)
  const isValidAccountId = Number.isInteger(accountId) && accountId > 0
  const {
    data: account,
    isLoading,
    isError,
  } = useFindAccountByIdQuery(accountId, {
    skip: !isValidAccountId,
  })
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation()
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation()
  const { data: rolesPage, isLoading: isLoadingRoles } = useFindAllRolesQuery({
    page: 0,
    size: 200,
    sort: ["name,asc"],
  })
  const { data: accountRoles = [], isLoading: isLoadingAccountRoles } =
    useFindAccountRolesByAccountIdQuery(accountId, {
      skip: !isValidAccountId,
    })
  const [replaceAccountRoles, { isLoading: isSavingRoles }] =
    useReplaceAccountRolesMutation()
  const { data: accountSetting, isLoading: isLoadingAccountSetting } =
    useFindAccountSettingByAccountIdQuery(accountId, {
      skip: !isValidAccountId,
    })
  const availableRoles = rolesPage?.content ?? []
  const persistedRoleIds = accountRoles.map((role) => role.roleId)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSelectedRoleIds(accountRoles.map((role) => role.roleId))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [accountRoles])

  async function handleUpdateAccount(values: AccountFormValues) {
    if (!canUpdateAccount) return

    try {
      await updateAccount({
        id: accountId,
        request: values,
      }).unwrap()
      notifications.success("Cuenta actualizada correctamente.")
    } catch (error) {
      handleError(error, "No se pudo actualizar la cuenta.")
    }
  }

  async function handleDeleteAccount() {
    if (!canDeleteAccount) return

    try {
      await deleteAccount({ id: accountId }).unwrap()
      notifications.success("Cuenta eliminada correctamente.")
      navigate("/admin/users")
    } catch (error) {
      handleError(error, "No se pudo eliminar la cuenta.")
    }
  }

  function handleToggleRole(roleId: number) {
    if (!canUpdateAccountRoles) return

    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    )
  }

  async function handleSaveRoles() {
    if (!canUpdateAccountRoles) return

    try {
      await replaceAccountRoles({
        accountId,
        roleIds: selectedRoleIds,
      }).unwrap()
      notifications.success("Roles actualizados correctamente.")
    } catch (error) {
      handleError(error, "No se pudieron actualizar los roles de la cuenta.")
    }
  }

  if (!isValidAccountId) {
    return (
      <section aria-label="Detalle de cuenta">
        <p>El identificador de la cuenta no es valido.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section aria-label="Detalle de cuenta">
        <p>Cargando cuenta...</p>
      </section>
    )
  }

  if (isError || !account) {
    return (
      <section aria-label="Detalle de cuenta">
        <p>No se pudo cargar la cuenta.</p>
      </section>
    )
  }

  return (
    <article className="rounded-xl border bg-background p-3 sm:p-5">
      <AccountBreadcrumb account={account} />

      <div className="mt-4">
        <AccountProfile
          account={account}
          canDelete={canDeleteAccount}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </div>

      <Tabs
        defaultValue="general"
        orientation={isMobile ? "vertical" : "horizontal"}
        className="mt-5 flex-col gap-5"
      >
        <TabsList
          variant="default"
          className="w-full max-w-full items-stretch justify-start md:w-fit md:items-center md:overflow-x-auto md:overflow-y-hidden"
        >
          {accountTabs.map((tab) => (
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

        <TabsContent value="general">
          <AccountGeneralTab
            account={account}
            canUpdate={canUpdateAccount}
            isSaving={isUpdating}
            onSubmit={handleUpdateAccount}
          />
        </TabsContent>
        <TabsContent value="roles">
          <AccountRolesTab
            account={account}
            availableRoles={availableRoles}
            canUpdateRoles={canUpdateAccountRoles}
            selectedRoleIds={selectedRoleIds}
            persistedRoleIds={persistedRoleIds}
            isLoadingRoles={isLoadingRoles || isLoadingAccountRoles}
            isSavingRoles={isSavingRoles}
            onToggleRole={handleToggleRole}
            onSaveRoles={handleSaveRoles}
          />
        </TabsContent>
        <TabsContent value="settings">
          <AccountSettingsTab
            accountId={account.id}
            canUpdateSettings={canUpdateAccountSettings}
            settings={accountSetting ?? null}
            isLoading={isLoadingAccountSetting}
          />
        </TabsContent>
      </Tabs>

      {canDeleteAccount ? (
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          title="Eliminar cuenta"
          subtitle={`Vas a eliminar la cuenta ${account.username}.`}
          loading={isDeleting}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleDeleteAccount}
        />
      ) : null}
    </article>
  )
}
