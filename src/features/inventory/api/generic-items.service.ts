import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"

export interface GenericItemResponse {
  genericItemId: number
  genericItemName: string
  modelId: number
}

const OPERATION_BASE_URL = "/generic-items"

export const genericItemApi = createApi({
  reducerPath: "genericItem",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    genericItems: builder.query<GenericItemResponse[], void>({
      query: () => ({
        url: OPERATION_BASE_URL + "/all",
        method: "GET",
      }),
    }),
  }),
})

export const { useLazyGenericItemsQuery } = genericItemApi
