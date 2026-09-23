import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { setCurrentAccount } from "../store/authSlice"
import {
  normalizeCurrentAccount,
  type CurrentAccountResponse,
  type RawCurrentAccountResponse,
} from "../types/current-account-response"
import type { LoginRequest } from "../types/login-request"
import type { LoginResponse } from "../types/login-response"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CurrentAccount"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          username: payload.username.trim(),
          password: payload.password,
        },
      }),
    }),
    me: builder.query<CurrentAccountResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response: RawCurrentAccountResponse) =>
        normalizeCurrentAccount(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCurrentAccount(data))
        } catch {
          // Bootstrap and consumers decide how to recover.
        }
      },
      providesTags: ["CurrentAccount"],
    }),
  }),
})

export const { useLazyMeQuery, useLoginMutation, useMeQuery } = authApi
