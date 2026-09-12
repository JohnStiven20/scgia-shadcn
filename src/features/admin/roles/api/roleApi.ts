import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { PageResponse } from "@/types/api/page-response"
import type { RoleCreateRequest } from "@/features/interface/role/request/role-create-request"
import type { RoleUpdateRequest } from "@/features/interface/role/request/role-update-request"
import type { Role } from "@/features/interface/role/type/role-base"
import type { Permission } from "@/features/interface/permission/type/permission-base"

type RoleFindAllParams = {
  page?: number
  size?: number
  sort?: string[]
}

type UpdateRoleParams = {
  id: number
  request: RoleUpdateRequest
}

type DeleteRoleParams = {
  id: number
}

export const roleApi = createApi({
  reducerPath: "roleApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    createRole: builder.mutation<void, RoleCreateRequest>({
      query: (payload) => ({
        url: "/role",
        method: "POST",
        body: {
          name: payload.name.trim(),
          description: payload.description?.trim() ?? "",
        },
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<Role, UpdateRoleParams>({
      query: ({ id, request }) => ({
        url: `/role/${id}`,
        method: "PUT",
        body: {
          name: request.name.trim(),
          description: request.description?.trim() ?? "",
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Role", id },
        "Role",
      ],
    }),
    findAllRoles: builder.query<PageResponse<Role>, RoleFindAllParams | void>({
      query: (params) => ({
        url: "/role",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["Role"],
    }),
    findRoleById: builder.query<Role, number>({
      query: (id) => ({
        url: `/role/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Role", id }, "Role"],
    }),
    findPermissionsByRoleId: builder.query<Permission[], number>({
      query: (id) => ({
        url: `/role/${id}/permissions`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Role", id }, "Role"],
    }),
    deleteRole: builder.mutation<void, DeleteRoleParams>({
      query: ({ id }) => ({
        url: `/role/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Role", id },
        "Role",
      ],
    }),
  }),
})

export const {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useFindAllRolesQuery,
  useFindRoleByIdQuery,
  useFindPermissionsByRoleIdQuery,
  useDeleteRoleMutation,
} = roleApi
