import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { ReplaceRolePermissionsRequest } from "@/features/interface/role-permission/request/replace-role-permissions-request"

export const rolePermissionApi = createApi({
  reducerPath: "rolePermissionApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["RolePermission", "Permission", "Role"],
  endpoints: (builder) => ({
    replaceRolePermissions: builder.mutation<
      void,
      ReplaceRolePermissionsRequest
    >({
      query: (request) => ({
        url: "/role-permission/replace",
        method: "PUT",
        body: {
          roleId: request.roleId,
          permissionIds: request.permissionIds,
        },
      }),
      invalidatesTags: ["RolePermission", "Permission", "Role"],
    }),
  }),
})

export const { useReplaceRolePermissionsMutation } = rolePermissionApi
