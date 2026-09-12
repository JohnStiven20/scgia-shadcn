import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import { AdminLayout } from "@/features/admin/layout/AdminLayout"
import { AdminRolesPage } from "@/features/admin/roles/page/AdminRolesPage"
import { AdminUsersPage } from "../../features/admin/account/page/AdminUsersPage"
import { AdminUserPage } from "@/features/admin/account/user/page/AdminUserPage"

export const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminLayout />,
  children: [
    { index: true, element: <Navigate to="users" replace /> },
    { path: "users", element: <AdminUsersPage /> },
    { path: "users/:id", element: <AdminUserPage /> },
    { path: "roles", element: <AdminRolesPage /> },
  ],
}
