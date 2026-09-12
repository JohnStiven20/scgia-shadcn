import { useEffect, useMemo, useState } from "react"
import {

  Boxes,

  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGlobalError } from "@/hooks"
import type { Permission } from "@/features/interface/permission/type/permission-base"
import type { Role } from "@/features/interface/role/type/role-base"
import { useReplaceRolePermissionsMutation } from "@/features/api/rolePermissionApi"
import {
  type AuthorizationCatalogGroup,
  type AuthorizationCatalogModule,
  useFindAuthorizationCatalogQuery,
} from "../api/authorizationCatalogApi"
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useFindAllRolesQuery,
  useFindPermissionsByRoleIdQuery,
  useUpdateRoleMutation,
} from "../api/roleApi"
import { RoleDialog, type RoleFormValues } from "../components/RoleDialog"

const emptyRoleFormValues: RoleFormValues = {
  name: "",
  description: "",
}

function getPermissionKey(permission: Permission) {
  return `id:${permission.id}`
}

function getAssignedPermissionKeys(permissions: Permission[]) {
  const keys = new Set<string>()

  for (const permission of permissions) {
    keys.add(getPermissionKey(permission))

    if (permission.code?.trim()) {
      keys.add(`code:${permission.code.trim()}`)
    }
  }

  return keys
}

function isPermissionsDirty(
  permissionSelection: Record<string, boolean>,
  permissionsByRole: Permission[]
) {
  const selectedIds = new Set(
    Object.entries(permissionSelection)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id)
  )
  const persistedIds = new Set(
    permissionsByRole.map((permission) => String(permission.id))
  )

  if (selectedIds.size !== persistedIds.size) {
    return true
  }

  for (const id of selectedIds) {
    if (!persistedIds.has(id)) {
      return true
    }
  }

  return false
}

function RoleList({
  roles,
  totalRoles,
  selectedRoleId,
  search,
  isFetching,
  onSearchChange,
  onSelectRole,
  onCreateRole,
}: {
  roles: Role[]
  totalRoles: number
  selectedRoleId: number | null
  search: string
  isFetching: boolean
  onSearchChange: (value: string) => void
  onSelectRole: (roleId: number) => void
  onCreateRole: () => void
}) {
  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Roles</h2>
            <p className="text-xs text-muted-foreground">
              {isFetching ? "Actualizando roles..." : "Gestion de accesos"}
            </p>
          </div>
          <Button type="button" size="sm" onClick={onCreateRole}>
            <Plus />
            Nuevo
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder="Buscar rol"
            className="h-8 pl-8"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid max-h-[52rem] gap-2 overflow-y-auto pr-1">
          {roles.length ? (
            roles.map((role) => {
              const selected = role.id === selectedRoleId

              return (
                <button
                  key={role.id}
                  type="button"
                  className={`rounded-md border p-3 text-left transition-colors ${
                    selected
                      ? "border-blue-200 bg-blue-50"
                      : "bg-card hover:bg-muted/40"
                  }`}
                  onClick={() => onSelectRole(role.id)}
                >
                  <span className="block truncate text-sm font-semibold">
                    {role.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {role.description || "Sin descripcion"}
                  </span>
                </button>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay roles que coincidan.
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Mostrando {roles.length} de {totalRoles} roles
        </p>
      </CardContent>
    </Card>
  )
}

function RoleSummary({
  role,
  assignedPermissionCount,
  assignedModuleCount,
  totalPermissionCount,
}: {
  role: Role | null
  assignedPermissionCount: number
  assignedModuleCount: number
  totalPermissionCount: number
}) {
  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="border-b pb-4">
        <h2 className="text-base font-semibold">Resumen</h2>
        <p className="text-xs text-muted-foreground">Rol seleccionado</p>
      </CardHeader>
      <CardContent>
        {role ? (
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs text-muted-foreground">Nombre</dt>
              <dd className="text-sm font-semibold">{role.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Estado</dt>
              <dd>
                <Badge variant="outline" className="text-emerald-600">
                  Activo
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Usuarios asignados
              </dt>
              <dd className="text-sm font-semibold">-</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Permisos asignados
              </dt>
              <dd className="text-sm font-semibold">
                {assignedPermissionCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Modulos con acceso
              </dt>
              <dd className="text-sm font-semibold">{assignedModuleCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Total permisos catalogo
              </dt>
              <dd className="text-sm font-semibold">{totalPermissionCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Rol ID</dt>
              <dd className="text-sm font-semibold">#{role.id}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecciona un rol para ver su resumen.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ModuleSelector({
  modules,
  selectedModuleCode,
  onSelectModule,
}: {
  modules: AuthorizationCatalogModule[]
  selectedModuleCode: string | null
  onSelectModule: (moduleCode: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {modules.map((module) => {
        const selected = module.code === selectedModuleCode

        return (
          <Button
            key={module.code}
            type="button"
            variant={selected ? "default" : "outline"}
            onClick={() => onSelectModule(module.code)}
          >
            <Boxes />
            {module.name}
          </Button>
        )
      })}
    </div>
  )
}

function PermissionGroup({
  group,
  permissionSelection,
  isSaving,
  onTogglePermission,
}: {
  group: AuthorizationCatalogGroup
  permissionSelection: Record<string, boolean>
  isSaving: boolean
  onTogglePermission: (permissionId: number) => void
}) {
  return (
    <section className="grid gap-3 rounded-md border p-4">
      <header>
        <h3 className="text-sm font-semibold">{group.name}</h3>
        <p className="text-xs text-muted-foreground">{group.description}</p>
      </header>
      <div className="grid gap-2">
        {group.permissions.map((permission) => {
          const checked = permissionSelection[String(permission.id)] ?? false

          return (
            <label
              key={permission.id}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 transition-colors ${
                checked
                  ? "border-blue-200 bg-blue-50/70"
                  : "bg-card hover:bg-muted/40"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 size-4 accent-blue-600"
                checked={checked}
                disabled={isSaving}
                onChange={() => onTogglePermission(permission.id)}
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{permission.name}</span>
                  <Badge variant="outline" className="font-mono">
                    {permission.code}
                  </Badge>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {permission.description || "Sin descripcion"}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}

function RolePermissionsPanel({
  selectedRole,
  selectedModule,
  authorizationCatalog,
  selectedModuleCode,
  permissionSelection,
  isLoadingCatalog,
  isLoadingPermissions,
  isSavingPermissions,
  isPermissionsDirty,
  onSelectModule,
  onTogglePermission,
  onSavePermissions,
  onEditRole,
  onDeleteRole,
}: {
  selectedRole: Role | null
  selectedModule: AuthorizationCatalogModule | null
  authorizationCatalog: AuthorizationCatalogModule[]
  selectedModuleCode: string | null
  permissionSelection: Record<string, boolean>
  isLoadingCatalog: boolean
  isLoadingPermissions: boolean
  isSavingPermissions: boolean
  isPermissionsDirty: boolean
  onSelectModule: (moduleCode: string) => void
  onTogglePermission: (permissionId: number) => void
  onSavePermissions: () => void
  onEditRole: () => void
  onDeleteRole: () => void
}) {
  if (!selectedRole) {
    return (
      <Card className="border-border/80 py-6">
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona un rol para ver sus permisos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(4)]">
      <CardHeader className="grid gap-4 border-b pb-4 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold">
              {selectedRole.name}
            </h2>
            <Badge variant="outline" className="text-emerald-600">
              Activo
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedRole.description || "Sin descripcion"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onEditRole}>
            <Pencil />
            Editar rol
          </Button>
          <Button type="button" variant="destructive" onClick={onDeleteRole}>
            <Trash2 />
            Eliminar
          </Button>
          <Button
            type="button"
            disabled={
              !isPermissionsDirty ||
              isSavingPermissions ||
              isLoadingPermissions ||
              isLoadingCatalog
            }
            onClick={onSavePermissions}
          >
            <Save />
            {isSavingPermissions ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <section className="grid gap-4" aria-label="Permisos del rol">
          <header>
            <h3 className="text-base font-semibold">Permisos</h3>
            <p className="text-xs text-muted-foreground">
              Selecciona modulos, grupos y permisos para este rol.
            </p>
          </header>

          {isLoadingCatalog ? (
            <p className="text-sm text-muted-foreground">
              Cargando catalogo de permisos...
            </p>
          ) : authorizationCatalog.length ? (
            <ModuleSelector
              modules={authorizationCatalog}
              selectedModuleCode={selectedModuleCode}
              onSelectModule={onSelectModule}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay catalogo de permisos disponible.
            </p>
          )}

          {isLoadingPermissions ? (
            <p className="text-sm text-muted-foreground">
              Cargando permisos del rol...
            </p>
          ) : selectedModule ? (
            <div className="grid gap-3">
              {selectedModule.groups.map((group) => (
                <PermissionGroup
                  key={group.code}
                  group={group}
                  permissionSelection={permissionSelection}
                  isSaving={isSavingPermissions}
                  onTogglePermission={onTogglePermission}
                />
              ))}
            </div>
          ) : null}
        </section>
      </CardContent>
    </Card>
  )
}

export function AdminRolesPage() {
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const [search, setSearch] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [selectedModuleCode, setSelectedModuleCode] = useState<string | null>(
    null
  )
  const [permissionSelection, setPermissionSelection] = useState<
    Record<string, boolean>
  >({})
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create")
  const [roleFormValues, setRoleFormValues] =
    useState<RoleFormValues>(emptyRoleFormValues)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    data: rolesPage,
    isLoading: isLoadingRoles,
    isFetching: isFetchingRoles,
  } = useFindAllRolesQuery({
    page: 0,
    size: 200,
    sort: ["name,asc"],
  })
  const { data: authorizationCatalog = [], isLoading: isLoadingCatalog } =
    useFindAuthorizationCatalogQuery()

  const roles = useMemo(() => rolesPage?.content ?? [], [rolesPage?.content])
  const filteredRoles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return roles.filter((role) => {
      if (!normalizedSearch) {
        return true
      }

      return (
        role.name.toLowerCase().includes(normalizedSearch) ||
        role.description.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [roles, search])
  const selectedRole = useMemo(
    () =>
      filteredRoles.find((role) => role.id === selectedRoleId) ??
      filteredRoles[0] ??
      null,
    [filteredRoles, selectedRoleId]
  )
  const selectedModule = useMemo(
    () =>
      authorizationCatalog.find(
        (module) => module.code === selectedModuleCode
      ) ??
      authorizationCatalog[0] ??
      null,
    [authorizationCatalog, selectedModuleCode]
  )
  const {
    data: permissionsByRole = [],
    isLoading: isLoadingPermissionsByRole,
  } = useFindPermissionsByRoleIdQuery(selectedRole?.id ?? 0, {
    skip: !selectedRole?.id,
  })
  const assignedPermissionKeys = useMemo(
    () => getAssignedPermissionKeys(permissionsByRole),
    [permissionsByRole]
  )
  const permissionsDirty = useMemo(
    () => isPermissionsDirty(permissionSelection, permissionsByRole),
    [permissionSelection, permissionsByRole]
  )
  const totalPermissionCount = useMemo(
    () =>
      authorizationCatalog.reduce(
        (moduleTotal, module) =>
          moduleTotal +
          module.groups.reduce(
            (groupTotal, group) => groupTotal + group.permissions.length,
            0
          ),
        0
      ),
    [authorizationCatalog]
  )
  const assignedPermissionCount = useMemo(
    () =>
      authorizationCatalog.reduce(
        (moduleTotal, module) =>
          moduleTotal +
          module.groups.reduce(
            (groupTotal, group) =>
              groupTotal +
              group.permissions.filter(
                (permission) => permissionSelection[String(permission.id)]
              ).length,
            0
          ),
        0
      ),
    [authorizationCatalog, permissionSelection]
  )
  const assignedModuleCount = useMemo(
    () =>
      authorizationCatalog.filter((module) =>
        module.groups.some((group) =>
          group.permissions.some(
            (permission) => permissionSelection[String(permission.id)]
          )
        )
      ).length,
    [authorizationCatalog, permissionSelection]
  )

  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation()
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteRoleMutation()
  const [replaceRolePermissions, { isLoading: isSavingPermissions }] =
    useReplaceRolePermissionsMutation()

  useEffect(() => {
    if (!selectedRole && selectedRoleId !== null) {
      setSelectedRoleId(null)
    }
  }, [selectedRole, selectedRoleId])

  useEffect(() => {
    if (authorizationCatalog.length === 0) {
      setSelectedModuleCode(null)
      return
    }

    const hasSelectedModule = authorizationCatalog.some(
      (module) => module.code === selectedModuleCode
    )

    if (!hasSelectedModule) {
      setSelectedModuleCode(authorizationCatalog[0].code)
    }
  }, [authorizationCatalog, selectedModuleCode])

  useEffect(() => {
    if (authorizationCatalog.length === 0) {
      setPermissionSelection({})
      return
    }

    const nextSelection = Object.fromEntries(
      authorizationCatalog.flatMap((module) =>
        module.groups.flatMap((group) =>
          group.permissions.map((permission) => [
            String(permission.id),
            assignedPermissionKeys.has(`id:${permission.id}`) ||
              assignedPermissionKeys.has(`code:${permission.code}`),
          ])
        )
      )
    )

    setPermissionSelection(nextSelection)
  }, [assignedPermissionKeys, authorizationCatalog, selectedRole?.id])

  function handleOpenCreateRole() {
    setRoleFormMode("create")
    setRoleFormValues(emptyRoleFormValues)
    setIsRoleDialogOpen(true)
  }

  function handleOpenEditRole(role?: Role | null) {
    const targetRole = role ?? selectedRole

    if (!targetRole) {
      return
    }

    setSelectedRoleId(targetRole.id)
    setRoleFormMode("edit")
    setRoleFormValues({
      name: targetRole.name,
      description: targetRole.description,
    })
    setIsRoleDialogOpen(true)
  }

  function handleOpenDeleteRole(role?: Role | null) {
    const targetRole = role ?? selectedRole

    if (!targetRole) {
      return
    }

    setSelectedRoleId(targetRole.id)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmitRole() {
    const name = roleFormValues.name.trim()
    const description = roleFormValues.description.trim()

    if (!name || !description) {
      return
    }

    try {
      if (roleFormMode === "create") {
        await createRole({ name, description }).unwrap()
        notifications.success("Rol creado correctamente.")
      } else if (selectedRole) {
        await updateRole({
          id: selectedRole.id,
          request: { name, description },
        }).unwrap()
        notifications.success("Rol actualizado correctamente.")
      }

      setIsRoleDialogOpen(false)
    } catch (error) {
      handleError(
        error,
        roleFormMode === "create"
          ? "No se pudo crear el rol."
          : "No se pudo actualizar el rol."
      )
    }
  }

  async function handleDeleteSelectedRole() {
    if (!selectedRole) {
      return
    }

    try {
      await deleteRole({ id: selectedRole.id }).unwrap()
      notifications.success("Rol eliminado correctamente.")
      setIsDeleteDialogOpen(false)
    } catch (error) {
      handleError(error, "No se pudo eliminar el rol.")
    }
  }

  function handleTogglePermission(permissionId: number) {
    setPermissionSelection((current) => ({
      ...current,
      [String(permissionId)]: !current[String(permissionId)],
    }))
  }

  async function handleSaveRolePermissions() {
    if (!selectedRole) {
      return
    }

    const permissionIds = Object.entries(permissionSelection)
      .filter(([, enabled]) => enabled)
      .map(([id]) => Number(id))

    try {
      await replaceRolePermissions({
        roleId: selectedRole.id,
        permissionIds,
      }).unwrap()
      notifications.success("Permisos actualizados correctamente.")
    } catch (error) {
      handleError(error, "No se pudieron actualizar los permisos del rol.")
    }
  }

  if (isLoadingRoles) {
    return (
      <section aria-label="Roles">
        <p>Cargando roles...</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6" aria-label="Roles">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Gestiona roles, permisos y accesos por modulo.
          </p>
        </section>
        <Button type="button" onClick={handleOpenCreateRole}>
          <Plus />
          Nuevo rol
        </Button>
      </header>

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_250px]">
        <RoleList
          roles={filteredRoles}
          totalRoles={roles.length}
          selectedRoleId={selectedRole?.id ?? null}
          search={search}
          isFetching={isFetchingRoles}
          onSearchChange={setSearch}
          onSelectRole={setSelectedRoleId}
          onCreateRole={handleOpenCreateRole}
        />

        <RolePermissionsPanel
          selectedRole={selectedRole}
          selectedModule={selectedModule}
          authorizationCatalog={authorizationCatalog}
          selectedModuleCode={selectedModuleCode}
          permissionSelection={permissionSelection}
          isLoadingCatalog={isLoadingCatalog}
          isLoadingPermissions={isLoadingPermissionsByRole}
          isSavingPermissions={isSavingPermissions}
          isPermissionsDirty={permissionsDirty}
          onSelectModule={setSelectedModuleCode}
          onTogglePermission={handleTogglePermission}
          onSavePermissions={() => void handleSaveRolePermissions()}
          onEditRole={() => handleOpenEditRole()}
          onDeleteRole={() => handleOpenDeleteRole()}
        />

        <RoleSummary
          role={selectedRole}
          assignedPermissionCount={assignedPermissionCount}
          assignedModuleCount={assignedModuleCount}
          totalPermissionCount={totalPermissionCount}
        />
      </div>

      <RoleDialog
        open={isRoleDialogOpen}
        mode={roleFormMode}
        values={roleFormValues}
        isSubmitting={isCreatingRole || isUpdatingRole}
        onClose={() => setIsRoleDialogOpen(false)}
        onChange={setRoleFormValues}
        onSubmit={() => void handleSubmitRole()}
      />

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Eliminar rol"
        subtitle={
          selectedRole
            ? `Si eliminas "${selectedRole.name}", dejara de estar disponible.`
            : undefined
        }
        loading={isDeletingRole}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteSelectedRole}
      />
    </section>
  )
}
