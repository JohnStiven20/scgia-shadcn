import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { WorkerLookupResponse } from "@/features/interface/worker/response/worker-response-interface"

export type SearchWorkerLookupParams = {
  search?: string
}

export type SearchAccountLookupParams = {
  search?: string
}

export type AccountLookupResponse = {
  id: number
  username: string
}

export type AssignWorkerToAccountParams = {
  accountId: number
  workerId: number | null
}

export const commonApi = createApi({
  reducerPath: "commonApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkerLookup", "AccountLookup"],
  endpoints: (builder) => ({
    findTop5WorkersByNameOrSurname: builder.query<
      WorkerLookupResponse[],
      SearchWorkerLookupParams | void
    >({
      query: (params) => ({
        url: "/worker",
        method: "GET",
        params: {
          search: params?.search ?? "",
        },
      }),
      providesTags: ["WorkerLookup"],
    }),
    findTop5AccountsByUsername: builder.query<
      AccountLookupResponse[],
      SearchAccountLookupParams | void
    >({
      query: (params) => ({
        url: "/account",
        method: "GET",
        params: {
          search: params?.search ?? "",
        },
      }),
      providesTags: ["AccountLookup"],
    }),
    assignWorkerToAccount: builder.mutation<
      void,
      AssignWorkerToAccountParams
    >({
      query: ({ accountId, workerId }) => ({
        url: `/account/${accountId}/worker`,
        method: "PUT",
        body: {
          workerId,
        },
      }),
      invalidatesTags: ["AccountLookup"],
    }),
  }),
})

export const {
  useFindTop5WorkersByNameOrSurnameQuery,
  useFindTop5AccountsByUsernameQuery,
  useAssignWorkerToAccountMutation,
} = commonApi
