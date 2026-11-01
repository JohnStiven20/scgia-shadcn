import type { LoginResponse } from "../types/login-response"

const ACCESS_TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refreshToken"

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function storeAuthTokens(response: LoginResponse) {
  if (!response.accessToken || typeof window === "undefined") return false

  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
  return true
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}
