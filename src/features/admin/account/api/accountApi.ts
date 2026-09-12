import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { PageResponse } from "@/types/api/page-response"
import type { TypeAccount } from "@/features/interface/account/enum/type-account"
import type { AccountCreateRequest } from "@/features/interface/account/request/account-create-request"
import type { AccountUpdateRequest } from "@/features/interface/account/request/account-update-request"
import type { Account } from "@/features/interface/account/type/account-base"

export type SearchAccountsParams = {
  name?: string
  typeAccount?: TypeAccount
  active?: boolean
  page?: number
  size?: number
  sort?: string[]
}

type UpdateAccountParams = {
  id: number
  request: AccountUpdateRequest
}

type DeleteAccountParams = {
  id: number
}

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Account"],
  endpoints: (builder) => ({
    findAccountById: builder.query<Account, number>({
      query: (id) => ({
        url: `/account/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Account", id },
        "Account",
      ],
    }),
    searchAccounts: builder.query<
      PageResponse<Account>,
      SearchAccountsParams | void
    >({
      query: (params) => ({
        url: "/account/search",
        method: "GET",
        params: {
          name: params?.name,
          typeAccount: params?.typeAccount,
          active: params?.active,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["Account"],
    }),
    createAccount: builder.mutation<void, AccountCreateRequest>({
      query: (payload) => ({
        url: "/account",
        method: "POST",
        body: {
          username: payload.username.trim(),
          password: payload.password,
          typeAccount: payload.typeAccount,
        },
      }),
      invalidatesTags: ["Account"],
    }),
    updateAccount: builder.mutation<void, UpdateAccountParams>({
      query: ({ id, request }) => ({
        url: `/account/${id}`,
        method: "PUT",
        body: {
          username: request.username.trim(),
          isactive: request.isactive,
          typeAccount: request.typeAccount,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Account", id },
        "Account",
      ],
    }),
    deleteAccount: builder.mutation<void, DeleteAccountParams>({
      query: ({ id }) => ({
        url: `/account/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Account"],
    }),
  }),
})

export const {
  useFindAccountByIdQuery,
  useSearchAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi

