import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { CurrentAccountResponse } from "../types/current-account-response"

const storedToken =
  typeof window !== "undefined"
    ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
    : null

export type AuthState = {
  token: string | null
  currentAccount: CurrentAccountResponse | null
  permissions: string[]
  roles: string[]
  isAuthenticated: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  token: storedToken,
  currentAccount: null,
  permissions: [],
  roles: [],
  isAuthenticated: Boolean(storedToken),
  isInitialized: !storedToken,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload
      state.isAuthenticated = Boolean(action.payload)
      state.isInitialized = !action.payload

      if (typeof window === "undefined") {
        return
      }

      if (action.payload) {
        localStorage.setItem("token", action.payload)
        return
      }

      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
    },
    setCurrentAccount(state, action: PayloadAction<CurrentAccountResponse>) {
      state.currentAccount = action.payload
      state.roles = action.payload.roles
      state.permissions = action.payload.permissions
      state.isAuthenticated = true
      state.isInitialized = true
    },
    setAuthInitialized(state) {
      state.isInitialized = true
    },
    clearAuth(state) {
      state.token = null
      state.currentAccount = null
      state.roles = []
      state.permissions = []
      state.isAuthenticated = false
      state.isInitialized = true

      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
      }
    },
  },
})

export const { clearAuth, setAuthInitialized, setCurrentAccount, setToken } =
  authSlice.actions
export const authReducer = authSlice.reducer
