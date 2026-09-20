import type { RouteObject } from "react-router-dom"

import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { AdminLayout } from "@/features/admin/layout/AdminLayout"
import { AdminIndexRedirect } from "@/features/admin/layout/components/AdminIndexRedirect"
import { AdminRolesPage } from "@/features/admin/roles/page/AdminRolesPage"
import { AdminUsersPage } from "../../features/admin/account/page/AdminUsersPage"
import { AdminUserPage } from "@/features/admin/account/user/page/AdminUserPage"

const adminModuleRule = {
  mode: "any" as const,
  permissions: ["account.view", "role.view"],
}

const accountViewRule = {
  mode: "any" as const,
  permissions: ["account.view"],
}

const roleViewRule = {
  mode: "any" as const,
  permissions: ["role.view"],
}

export const adminRoutes: RouteObject = {
  path: "admin",
  element: (
    <PermissionRoute rule={adminModuleRule}>
      <AdminLayout />
    </PermissionRoute>
  ),
  children: [
    { index: true, element: <AdminIndexRedirect /> },
    {
      path: "users",
      element: (
        <PermissionRoute rule={accountViewRule}>
          <AdminUsersPage />
        </PermissionRoute>
      ),
    },
    {
      path: "users/:id",
      element: (
        <PermissionRoute rule={accountViewRule}>
          <AdminUserPage />
        </PermissionRoute>
      ),
    },
    {
      path: "roles",
      element: (
        <PermissionRoute rule={roleViewRule}>
          <AdminRolesPage />
        </PermissionRoute>
      ),
    },
  ],
}
