import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { WorkOrderListResponse, WorkOrderStatus } from "@/features/interface/work-orders/types"
import type { PageResponse } from "@/types/api/page-response"
import { createApi } from "@reduxjs/toolkit/query/react"

// import { baseQueryWithAuth } from "src/api/rtkBaseQuery"
// import type { PageResponse } from "src/types/api/page-response"
// import type {
//   WorkOrderListResponse,
//   WorkOrderStatus,
// } from "src/features/interface/work-orders/types"

export type WorkOrderSort =
  | "createdAt,desc"
  | "createdAt,asc"
  | "externalOrderNumber,asc"
  | "externalOrderNumber,desc"
  | "status,asc"
  | "status,desc"

export type GetWorkOrdersParams = {
  search?: string
  status?: WorkOrderStatus
  workerId?: number
  createdFrom?: string
  createdTo?: string
  page?: number
  size?: number
  sort?: WorkOrderSort
}

export const workOrderApi = createApi({
  reducerPath: "workOrderApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkOrder"],
  endpoints: (builder) => ({
    getWorkOrders: builder.query<
      PageResponse<WorkOrderListResponse>,
      GetWorkOrdersParams
    >({
      query: ({
        search,
        status,
        workerId,
        createdFrom,
        createdTo,
        page = 0,
        size = 10,
        sort = "createdAt,desc",
      }) => ({
        url: "/mobile/inventory/worker-order/list",
        method: "GET",
        params: {
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(workerId ? { workerId } : {}),
          ...(createdFrom ? { createdFrom } : {}),
          ...(createdTo ? { createdTo } : {}),
          page,
          size,
          sort,
        },
      }),
      providesTags: (result) => [
        { type: "WorkOrder", id: "LIST" },
        ...(result?.content.map((workOrder) => ({
          type: "WorkOrder" as const,
          id: workOrder.id,
        })) ?? []),
      ],
    }),
  }),
})

export const { useGetWorkOrdersQuery } = workOrderApi
