import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { TelecommunicationSpecificItemHistoryResponse } from "@/features/interface/products/telecommunicationSpecificItemHistory"

export const getTelecommunicationSpecificItemHistory = createApi({
  reducerPath: "getTelecommunicationSpecificItemHistory",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["TelecommunicationSpecificItemHistory"],
  endpoints: (builder) => ({
    getTelecommunicationSpecificItemHistory: builder.query<
      TelecommunicationSpecificItemHistoryResponse,
      string
    >({
      query: (unitCode) => ({
        url: "telecommunication-items/history",
        method: "GET",
        params: {
          unitCode,
        },
      }),
      transformResponse: (
        response: TelecommunicationSpecificItemHistoryResponse
      ) => response,
      providesTags: (_result, _error, unitCode) => [
        { type: "TelecommunicationSpecificItemHistory", id: unitCode },
      ],
    }),
  }),
})

export const {
  useGetTelecommunicationSpecificItemHistoryQuery,
  useLazyGetTelecommunicationSpecificItemHistoryQuery,
} = getTelecommunicationSpecificItemHistory
