import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery.ts"

import type { AssignedModelDistributionResponse } from "@/features/inventory/assigned-material/interface/AssignedModelDistributionResponse.ts"
import type { AssignedWorkerResponse } from "@/features/inventory/assigned-material/interface/AssignedWorkerResponse.ts"
import type { WorkerAssignedProductResponse } from "@/features/inventory/assigned-material/interface/WorkerAssignedProductResponse.ts"

export const assignedMaterialApi = createApi({
  reducerPath: "assignedMaterialApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AssignedMaterial"],

  endpoints: (builder) => ({
    getGlobalModelDistribution: builder.query<
      AssignedModelDistributionResponse[],
      void
    >({
      query: () => ({
        url: "/inventory/assigned-material/statistics/models",
        method: "GET",
      }),
      providesTags: [{ type: "AssignedMaterial", id: "MODELS" }],
    }),

    getAssignedWorkers: builder.query<AssignedWorkerResponse[], void>({
      query: () => ({
        url: "/inventory/assigned-material/statistics/workers",
        method: "GET",
      }),
      providesTags: [{ type: "AssignedMaterial", id: "WORKERS" }],
    }),

    getWorkerModelDistribution: builder.query<
      AssignedModelDistributionResponse[],
      number
    >({
      query: (workerId) => ({
        url: `/inventory/assigned-material/statistics/workers/${workerId}/models`,
        method: "GET",
      }),
      providesTags: (_result, _error, workerId) => [
        { type: "AssignedMaterial", id: `WORKER-MODELS-${workerId}` },
      ],
    }),

    getWorkerAssignedProducts: builder.query<
      WorkerAssignedProductResponse[],
      number
    >({
      query: (workerId) => ({
        url: `/inventory/assigned-material/statistics/workers/${workerId}/products`,
        method: "GET",
      }),
      providesTags: (_result, _error, workerId) => [
        { type: "AssignedMaterial", id: `WORKER-PRODUCTS-${workerId}` },
      ],
    }),
  }),
})

export const {
  useGetGlobalModelDistributionQuery,
  useGetAssignedWorkersQuery,
  useGetWorkerModelDistributionQuery,
  useGetWorkerAssignedProductsQuery,
} = assignedMaterialApi
