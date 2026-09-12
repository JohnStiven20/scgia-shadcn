import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { PageResponse } from "@/types/api/page-response"
import type {
  TelecommunicationItemStatus,
  TelecommunicationSpecificItemInventoryResponse,
} from "@/features/interface/products/telecommunicationSpecificItemInventory"

export interface GetSpecificModelItemsParams {
  modelId: number
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
  filters?: {
    search?: string
    worker?: string
    status?: TelecommunicationItemStatus
    createdFrom?: string
    createdTo?: string
  }
}

export const specificModelItemsApi = createApi({
  reducerPath: "specificModelItemsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["TelecommunicationSpecificItem"],
  endpoints: (builder) => ({
    getSpecificModelItems: builder.query<
      PageResponse<TelecommunicationSpecificItemInventoryResponse>,
      GetSpecificModelItemsParams
    >({
      query: ({
        modelId,
        pageNumber = 0,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        filters = {},
      }) => ({
        url: `telecommunication-models/${modelId}/specific-items/search`,
        method: "POST",
        body: {
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          object: filters,
        },
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "TelecommunicationSpecificItem",
          id: `MODEL-${arg.modelId}`,
        },
      ],
    }),
  }),
})

export const {
  useGetSpecificModelItemsQuery,
  useLazyGetSpecificModelItemsQuery,
} = specificModelItemsApi
