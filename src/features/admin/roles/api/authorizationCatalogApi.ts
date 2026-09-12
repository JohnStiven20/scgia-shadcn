import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"

export type AuthorizationCatalogPermission = {
  id: number
  code: string
  name: string
  description: string
  displayOrder: number
}

export type AuthorizationCatalogGroup = {
  id: number
  code: string
  name: string
  description: string
  displayOrder: number
  permissions: AuthorizationCatalogPermission[]
}

export type AuthorizationCatalogModule = {
  id: number
  code: string
  name: string
  description: string
  displayOrder: number
  groups: AuthorizationCatalogGroup[]
}

export const authorizationCatalogApi = createApi({
  reducerPath: "authorizationCatalogApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AuthorizationCatalog"],
  endpoints: (builder) => ({
    findAuthorizationCatalog: builder.query<AuthorizationCatalogModule[], void>(
      {
        query: () => ({
          url: "/authorization/catalog",
          method: "GET",
        }),
        providesTags: ["AuthorizationCatalog"],
      }
    ),
  }),
})

export const { useFindAuthorizationCatalogQuery } = authorizationCatalogApi
