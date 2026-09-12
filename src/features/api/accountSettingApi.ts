import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { AccountSettingUpdateRequest } from "@/features/interface/account-setting/request/account-setting-update-request"
import type { AccountSetting } from "@/features/interface/account-setting/type/account-setting-base"

type UpdateAccountSettingByAccountIdParams = {
  accountId: number
  request: AccountSettingUpdateRequest
}

export const accountSettingApi = createApi({
  reducerPath: "accountSettingApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AccountSetting"],
  endpoints: (builder) => ({
    findAccountSettingByAccountId: builder.query<AccountSetting, number>({
      query: (accountId) => ({
        url: "/account-setting/by-account",
        method: "GET",
        params: {
          accountId,
        },
      }),
      providesTags: (_result, _error, accountId) => [
        { type: "AccountSetting", id: accountId },
        "AccountSetting",
      ],
    }),
    updateAccountSettingByAccountId: builder.mutation<
      void,
      UpdateAccountSettingByAccountIdParams
    >({
      query: ({ accountId, request }) => ({
        url: "/account-setting/by-account",
        method: "PUT",
        params: {
          accountId,
        },
        body: {
          darkMode: request.darkMode,
          emailNotificationsEnabled: request.emailNotificationsEnabled,
        },
      }),
      invalidatesTags: (_result, _error, { accountId }) => [
        { type: "AccountSetting", id: accountId },
        "AccountSetting",
      ],
    }),
  }),
})

export const {
  useFindAccountSettingByAccountIdQuery,
  useUpdateAccountSettingByAccountIdMutation,
} = accountSettingApi
