export function isUnauthorizedApiError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false
  }

  const apiError = error as {
    status?: unknown
    originalStatus?: unknown
  }

  return apiError.status === 401 || apiError.originalStatus === 401
}
