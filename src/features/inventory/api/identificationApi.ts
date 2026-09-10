import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type {
  IdentificationRequest,
  IdentificationResponse,
} from "@/features/interface/identification/types"

export const identificationApi = createApi({
  reducerPath: "identificationApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    identifyProduct: builder.mutation<
      IdentificationResponse,
      IdentificationRequest
    >({
      query: (request) => ({
        url: "/identification",
        method: "POST",
        body: request,
      }),
    }),
  }),
})

export const { useIdentifyProductMutation } = identificationApi
