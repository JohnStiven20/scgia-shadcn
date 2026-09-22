import { createApi } from "@reduxjs/toolkit/query/react"
import type { EndpointBuilder } from "@reduxjs/toolkit/query"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type {
  IdentificationManualRequest,
  IdentificationRequest,
  IdentificationResponse,
} from "@/features/interface/identification/types"

type IdentificationBuilder = EndpointBuilder<
  typeof baseQueryWithAuth,
  never,
  "identificationApi"
>

const identifyProductService = (builder: IdentificationBuilder) => ({
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
})

const identifyProductManualService = (builder: IdentificationBuilder) => ({
  identifyProductManual: builder.mutation<
    IdentificationResponse,
    IdentificationManualRequest
  >({
    query: (request) => ({
      url: "/identification/manual",
      method: "POST",
      body: request,
    }),
  }),
})

export const identificationApi = createApi({
  reducerPath: "identificationApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    ...identifyProductService(builder),
    ...identifyProductManualService(builder),
  }),
})

export const { useIdentifyProductMutation, useIdentifyProductManualMutation } =
  identificationApi
