import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"

const OPERATION_BASE_URL = "/telecommunication-item-model-identifier"


// TODO: Consume un recurso no muy recomendado, pero bueno para mirar
// el futuro
export interface IdentifierResponse {
  active: boolean
  code: string
  id: number,
  mutable: boolean
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
