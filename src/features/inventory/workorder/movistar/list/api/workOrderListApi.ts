import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery.ts"
import type { MovistarWorkOrderSummaryResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderSummaryResponse.ts"
import type { PageResponse } from "@/types/api/page-response.ts"
import type { GetMovistarWorkOrdersParams } from "@/features/interface/worker/movistar/request/GetMovistarWorkOrdersParams.ts"
import type { MovistarWorkOrderTaskTypeResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderTaskTypeResponse.ts"

export const movistarWorkOrderApi = createApi({
  reducerPath: "movistarWorkOrderApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["MovistarWorkOrder"],

  endpoints: (builder) => ({
    getMovistarWorkOrderTaskTypes: builder.query<MovistarWorkOrderTaskTypeResponse[], void>({
      query: () => ({
        url: "/web/inventory/movistar/work-order/task-types",
        method: "GET",
      }),
      providesTags: ["MovistarWorkOrder"],
    }),
    getMovistarWorkOrders: builder.query<
      PageResponse<MovistarWorkOrderSummaryResponse>,
      GetMovistarWorkOrdersParams
    >({
      query: ({
        providerId,
        startDate,
        endDate,
        workerId,
        taskTypeId,
        page = 0,
        size = 10,
      }) => ({
        url: "/web/inventory/movistar/work-order/list",
        method: "GET",
        params: {
          providerId,
          startDate,
          endDate,
          workerId,
          taskTypeId,
          page,
          size,
        },
      }),

      providesTags: (result) => [
        { type: "MovistarWorkOrder" as const, id: "LIST" },
        ...(result?.content.map((order) => ({
          type: "MovistarWorkOrder" as const,
          id: order.id,
        })) ?? []),
      ],
    }),
  }),
})

export const {
  useGetMovistarWorkOrderTaskTypesQuery,
  useGetMovistarWorkOrdersQuery,
} = movistarWorkOrderApi
