const runtimeApiBaseUrl =
  typeof window !== "undefined" && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:8083/api`
    : "http://localhost:8083/api"

const configuredApiBaseUrl = import.meta.env.VITE_API_URL

export const API_BASE_URL = configuredApiBaseUrl || runtimeApiBaseUrl
