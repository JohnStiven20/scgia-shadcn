import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  RotateCcw,
  type LucideIcon,
} from "lucide-react"

import type { InventoryMovementType } from "@/features/interface/traceability/types"

export type TraceabilityEventStyle = {
  label: string
  icon: LucideIcon
  badgeClassName: string
  iconClassName: string
}

export const traceabilityEventStyles: Record<
  InventoryMovementType,
  TraceabilityEventStyle
> = {
  ENTRY: {
    label: "Entrada",
    icon: ArrowDownToLine,
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  ASSIGNMENT: {
    label: "Asignación",
    icon: ClipboardCheck,
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "bg-blue-100 text-blue-700",
  },
  RETURN: {
    label: "Devolución",
    icon: RotateCcw,
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "bg-amber-100 text-amber-700",
  },
  EXIT: {
    label: "Salida",
    icon: ArrowUpFromLine,
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
    iconClassName: "bg-red-100 text-red-700",
  },
}
