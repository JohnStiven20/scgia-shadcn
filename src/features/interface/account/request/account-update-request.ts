import type { TypeAccount } from "../enum/type-account"

export type AccountUpdateRequest = {
  username: string
  isactive: boolean
  typeAccount: TypeAccount
}

