import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"

const OPERATION_BASE_URL = "/telecommunication-item-model-identifier"

export interface IdentifierResponse {
  identifierId: number
  identifierCode: string
}

export const identifiersApi = createApi({
  reducerPath: "identifiers",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    identifiers: builder.query<IdentifierResponse[], number>({
      query: (modelId) => ({
        url: `${OPERATION_BASE_URL}/model/${modelId}`,
        method: "GET",
      }),
    }),
  }),
})

export const { useLazyIdentifiersQuery } = identifiersApi
