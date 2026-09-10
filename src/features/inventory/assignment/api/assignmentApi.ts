import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "../../../../api/rtkBaseQuery"
import type { AccountLookupResponse } from "@/api/commonApi"

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getAssignableWorkers: builder.query<AccountLookupResponse[], void>({
      query: () => ({
        url: "/account/assignable-workers",
        method: "GET",
      }),
    }),
  }),
})

export const { useGetAssignableWorkersQuery } = assignmentApi
