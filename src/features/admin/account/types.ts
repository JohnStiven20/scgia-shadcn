import type { TypeAccount } from "@/features/interface/account/enum/type-account"

export type AccountStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export type AccountFilters = {
  name: string
  typeAccount: TypeAccount | "ALL"
  status: AccountStatusFilter
}

export type AccountTableRow = {
  id: number
  code: string
  username: string
  initial: string
  typeAccount: TypeAccount
  isactive: boolean
  createdAt: string
  roles: string
}

export type AccountCreateFormValues = {
  username: string
  password: string
  typeAccount: TypeAccount
}

