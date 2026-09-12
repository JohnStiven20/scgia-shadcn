import type { Account } from "@/features/interface/account/type/account-base"

import type { AccountTableRow } from "./types"
import { formatAccountDate, getAccountCode, getAccountInitial } from "./utils"

export function mapAccountToTableRow(account: Account): AccountTableRow {
  return {
    id: account.id,
    code: getAccountCode(account.id),
    username: account.username,
    initial: getAccountInitial(account.username),
    typeAccount: account.typeAccount,
    isactive: account.isactive,
    createdAt: formatAccountDate(account.createdAt),
    roles: formatAccountRoles(account.roles),
  }
}

function formatAccountRoles(roles: Account["roles"]) {
  if (!roles?.length) {
    return "-"
  }

  return roles
    .map((role) => (typeof role === "string" ? role : role.name))
    .filter(Boolean)
    .join(", ")
}

