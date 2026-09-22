import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "../../../../api/rtkBaseQuery"
import type { AccountLookupResponse } from "@/api/commonApi"
import type {
  AssignmentDetailResponse,
  AssignmentSummaryResponse,
} from "../types/assignment-api.types"

export interface TelecommunicationItemSelectionResponse {
  id: number
  uniqueCode: string
  uniqueCodeType: string
  identifierId: number
  identifier: string
  createdAt: string
}

export interface AvailableModelItemsParams {
  modelId: number
  page: number
}

export interface SpringPageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface ModelsResponse {
  modelId: number
  modelName: string
}

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
    //TODO: Creo que se puede quitar este servicio, ya he creado otro
    // llamado getAllModels() por que este servicio tiene una paginacion inncesaria
    getAvailableModelItems: builder.query<
      SpringPageResponse<TelecommunicationItemSelectionResponse>,
      AvailableModelItemsParams
    >({
      query: ({ modelId, page }) => ({
        url: `/telecommunication-models/${modelId}/available-items`,
        method: "GET",
        params: { page },
      }),
    }),
    getAllModels: builder.query<ModelsResponse[], void>({
      query: () => ({
        url: `/telecomunication-model/all`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useGetAllModelsQuery,
  useLazyGetAllModelsQuery,
  useGetAssignableWorkersQuery,
  useGetReturnAssignmentsByAccountQuery,
  useGetReturnAssignmentDetailQuery,
  useGetAvailableModelItemsQuery,
} = assignmentApi
