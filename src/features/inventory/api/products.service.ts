import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { TelecommunicationSpecificModelInventorySummaryResponse } from "@/features/interface/products/products.type"

export const getSpecificModelInventorySummary = createApi({
    reducerPath: "getSpecificModelInventorySummary",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["TelecommunicationModel"],
    endpoints: (builder) => ({
        getSpecificModelInventorySummary: builder.query<
            TelecommunicationSpecificModelInventorySummaryResponse[],
            void
        >({
            query: () => ({
                url: "telecomunication-model/models/specific/summary",
                method: "GET",
            }),
            transformResponse: (
                response: TelecommunicationSpecificModelInventorySummaryResponse[]
            ) => response,
            providesTags: [{ type: "TelecommunicationModel", id: "LIST" }],
        }),
    }),
});

export const {
    useGetSpecificModelInventorySummaryQuery,
} = getSpecificModelInventorySummary;
