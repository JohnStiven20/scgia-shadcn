import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./apiConfig";
import { clearAuth } from "@/features/auth/store/authSlice";
import { isUnauthorizedApiError } from "@/features/auth/utils/auth-errors";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  storeAuthTokens,
} from "@/features/auth/utils/auth-tokens";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 10000,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  
  let result = await rawBaseQuery(args, api, extraOptions)

  if (isUnauthorizedApiError(result.error)) {
    const refreshToken = getRefreshToken()

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult.data && storeAuthTokens(refreshResult.data as {
        accessToken: string
        refreshToken: string
      })) {
        result = await rawBaseQuery(args, api, extraOptions)
      }
    }

    if (isUnauthorizedApiError(result.error)) {
      clearAuthTokens()
      api.dispatch(clearAuth())
    }
  }

  return result
}
