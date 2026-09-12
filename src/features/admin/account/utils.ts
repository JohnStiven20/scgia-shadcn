import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import type { AccountFilters, AccountStatusFilter } from "./types"

export const ACCOUNT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

export const EMPTY_ACCOUNT_FILTERS: AccountFilters = {
  name: "",
  typeAccount: "ALL",
  status: "ALL",
}

export const ACCOUNT_TYPE_LABELS: Record<TypeAccount, string> = {
  WEB: "Web",
  MOBILE: "Movil",
  BOTH: "Web y movil",
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatusFilter, string> = {
  ALL: "Todos",
  ACTIVE: "Activas",
  INACTIVE: "Inactivas",
}

export function getActiveFilterValue(status: AccountStatusFilter) {
  if (status === "ACTIVE") {
    return true
  }

  if (status === "INACTIVE") {
    return false
  }

  return undefined
}

export function formatAccountDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function getAccountInitial(username: string) {
  return username.trim().charAt(0).toUpperCase() || "?"
}

export function getAccountCode(id: number) {
  return `ACC-${String(id).padStart(3, "0")}`
}
