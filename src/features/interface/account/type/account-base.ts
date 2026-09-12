import type { TypeAccount } from "../enum/type-account"

export type AccountRoleSummary = {
  id: number
  name: string
}

export interface Account {
  id: number
  username: string
  isactive: boolean
  typeAccount: TypeAccount
  createdAt: string
  roles?: AccountRoleSummary[] | string[]
}

