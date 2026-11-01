import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { WorkerProductionResponse } from "../interface/orange/WorkerProductionResponse"
import type { GetOrangeProductionWorkersParams } from "../interface/orange/GetOrangeProductionWorkersParams"
import type { OrangeProductionSummary } from "../interface/orange/OrangeProductionSummary"
import type { GetOrangeProductionParams } from "../interface/orange/GetOrangeMonthlyProductionParams"
import type { OrangeTaskProductionResponse } from "../interface/orange/OrangeTaskProductionResponse"
import type {
  OrangeWorkerTaskProductionResponse
} from "@/features/inventory/production/interface/orange/OrangeWorkerTaskProductionResponse.ts"
import type {
  GetOrangeWorkerTaskProductionParams
} from "@/features/inventory/production/interface/orange/GetOrangeWorkerTaskProductionParams.ts"



export const orangeProductionApi = createApi({
  reducerPath: "orangeProductionApi",

  baseQuery: baseQueryWithAuth,

  tagTypes: ["OrangeProduction"],

  endpoints: (builder) => ({
    // 1. Trabajadores con producción histórica
    getOrangeProductionWorkers: builder.query<
      WorkerProductionResponse[],
      GetOrangeProductionWorkersParams
    >({
      query: ({ providerId }) => ({
        url: "/web/production/orange/workers",
        method: "GET",
        params: {
          providerId,
        },
      }),

      providesTags: ["OrangeProduction"],
    }),

    // 2. Resumen de producción para el periodo seleccionado
    getOrangeProductionSummary: builder.query<
      OrangeProductionSummary,
      GetOrangeProductionParams
    >({
      query: ({ providerId, startDate, endDate }) => ({
        url: "/web/production/orange/summary",
        method: "GET",
        params: {
          providerId,
          startDate,
          endDate,
        },
      }),
      providesTags: ["OrangeProduction"],
    }),

    // 3. Producción agrupada por tarea para el periodo seleccionado
    getOrangeTaskProduction: builder.query<
      OrangeTaskProductionResponse[],
      GetOrangeProductionParams
    >({
      query: ({ providerId, startDate, endDate }) => ({
        url: "/web/production/orange/tasks",
        method: "GET",
        params: {
          providerId,
          startDate,
          endDate,
        },
      }),

      providesTags: ["OrangeProduction"],
    }),

    getOrangeWorkerTaskProduction: builder.query<
      OrangeWorkerTaskProductionResponse[],
      GetOrangeWorkerTaskProductionParams
    >({
      query: ({ workerId, providerId, startDate, endDate }) => ({
        url: `/web/production/orange/workers/${workerId}/tasks`,
        method: "GET",
        params: {
          providerId,
          startDate,
          endDate,
        },
      }),

      providesTags: ["OrangeProduction"],
    }),
  }),
})

export const {
  useGetOrangeProductionWorkersQuery,
  useLazyGetOrangeProductionWorkersQuery,

  useGetOrangeProductionSummaryQuery,
  useLazyGetOrangeProductionSummaryQuery,

  useGetOrangeTaskProductionQuery,
  useLazyGetOrangeTaskProductionQuery,

  useGetOrangeWorkerTaskProductionQuery,
} = orangeProductionApi
