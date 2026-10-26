import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"
import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface.ts"

export const providerInventory = createApi({
  reducerPath: "providerInventory",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getProvider: builder.query<ProviderInventory[], void>({
      query: () => ({
        url: "/provider",
        method: "GET",
      }),
    }),
  }),
})

export const { useGetProviderQuery } = providerInventory
