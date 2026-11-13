import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery.ts"

export interface AddTelecommunicationItemParams {
  workOrderId: number
  workerId: number
  uniqueCode: string
}

export const webWorkOrderApi = createApi({
  reducerPath: "webWorkOrderApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkOrderDetail"],

  endpoints: (builder) => ({
    addTelecommunicationItem: builder.mutation<
      void,
      AddTelecommunicationItemParams
    >({
      query: ({ workOrderId, workerId, uniqueCode }) => ({
        url: `/web/inventory/work-orders/${workOrderId}/items`,
        method: "POST",
        params: {
          workerId,
          uniqueCode,
        },
      }),

      invalidatesTags: ["WorkOrderDetail"],
    }),
  }),
})

export const { useAddTelecommunicationItemMutation } = webWorkOrderApi
