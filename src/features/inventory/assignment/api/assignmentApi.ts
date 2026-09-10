import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "../../../../api/rtkBaseQuery"
import type { AccountLookupResponse } from "@/api/commonApi"
import type {
  AssignmentDetailResponse,
  AssignmentSummaryResponse,
} from "../types/assignment-api.types"

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Assignment"],
  endpoints: (builder) => ({
    getAssignableWorkers: builder.query<AccountLookupResponse[], void>({
      query: () => ({
        url: "/account/assignable-workers",
        method: "GET",
      }),
    }),
    getReturnAssignmentsByAccount: builder.query<
      AssignmentSummaryResponse[],
      number
    >({
      query: (accountId) => ({
        url: `/assignments/account/${accountId}`,
        method: "GET",
      }),
      providesTags: (result, _error, accountId) => [
        { type: "Assignment", id: `ACCOUNT-${accountId}` },
        ...(result?.map((assignment) => ({
          type: "Assignment" as const,
          id: assignment.id,
        })) ?? []),
      ],
    }),
    getReturnAssignmentDetail: builder.query<AssignmentDetailResponse, number>({
      query: (assignmentId) => ({
        url: `/assignments/${assignmentId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, assignmentId) => [
        { type: "Assignment", id: assignmentId },
      ],
    }),
  }),
})

export const {
  useGetAssignableWorkersQuery,
  useGetReturnAssignmentsByAccountQuery,
  useGetReturnAssignmentDetailQuery,
} = assignmentApi
