import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { ReplaceAccountRolesRequest } from "@/features/interface/account-role/request/replace-account-roles-request"
import type { AccountRoleResponse } from "@/features/interface/account-role/response/account-role-response"

export const accountRoleApi = createApi({
  reducerPath: "accountRoleApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AccountRole"],
  endpoints: (builder) => ({
    findAccountRolesByAccountId: builder.query<AccountRoleResponse[], number>({
      query: (accountId) => ({
        url: "/account-role/by-account",
        method: "GET",
        params: {
          accountId,
        },
      }),
      providesTags: ["AccountRole"],
    }),
    replaceAccountRoles: builder.mutation<void, ReplaceAccountRolesRequest>({
      query: (request) => ({
        url: "/account-role/replace",
        method: "PUT",
        body: {
          accountId: request.accountId,
          roleIds: request.roleIds,
        },
      }),
      invalidatesTags: ["AccountRole"],
    }),
  }),
})

export const {
  useFindAccountRolesByAccountIdQuery,
  useReplaceAccountRolesMutation,
} = accountRoleApi
