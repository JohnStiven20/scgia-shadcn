import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type {
  WorkOrderDetailResponse
} from "@/features/interface/work-orders/movistar/composite/WorkOrderDetailResponse.ts"

interface GetMovistarWorkOrderDetailParams {
  workerId: number
}

export const movistarWorkOrderDetailApi = createApi({
  reducerPath: "movistarWorkOrderDetailApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["MovistarWorkOrderDetail"],

  endpoints: (builder) => ({
    getMovistarWorkOrderDetail: builder.query<
      WorkOrderDetailResponse,
      GetMovistarWorkOrderDetailParams
    >({
      query: ({ workerId }) => ({
        url: "/web/inventory/movistar/work-order/details",
        method: "GET",
        params: {
          workerId,
        },
      }),

      providesTags: (_result, _error, { workerId }) => [
        { type: "MovistarWorkOrderDetail", id: workerId },
      ],
    }),
  }),
})

export const { useGetMovistarWorkOrderDetailQuery } = movistarWorkOrderDetailApi
