import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import type { AccountTableRow } from "../types"
import { ACCOUNT_TYPE_LABELS } from "../utils"

type AccountTypeBadgeProps = {
  account: AccountTableRow
}

export function AccountTypeBadge({ account }: AccountTypeBadgeProps) {
  const Icon =
    account.typeAccount === "MOBILE"
      ? Smartphone
      : account.typeAccount === "BOTH"
        ? MonitorSmartphone
        : Laptop

  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 text-slate-500" />
      <Badge
        variant="outline"
        className="border-blue-100 bg-blue-50 text-blue-700"
      >
        {ACCOUNT_TYPE_LABELS[account.typeAccount]}
      </Badge>
    </span>
  )
}
