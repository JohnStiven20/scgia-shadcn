import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../../api/rtkBaseQuery";
import type { TraceabilityPageResponse, TraceabilitySearchRequest } from "@/features/interface/traceability/types";


export const traceabilityApi = createApi({
  reducerPath: "traceabilityApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    searchTraceabilityEvents: builder.query<
      TraceabilityPageResponse,
      TraceabilitySearchRequest
    >({
      query: (request) => ({
        url: "/movement-transaction/inventory-entry-events",
        method: "POST",
        body: request,
      }),
    }),
  }),
});

export const { useSearchTraceabilityEventsQuery } = traceabilityApi;
