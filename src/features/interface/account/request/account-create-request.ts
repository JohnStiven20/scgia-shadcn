import type { TypeAccount } from "../enum/type-account"

export interface AccountCreateRequest {
  username: string
  password: string
  typeAccount: TypeAccount
}

