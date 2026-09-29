import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  CircleHelp,
  RotateCcw,
  Wrench,
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
  INSTALL: {
    label: "InstalaciÃ³n",
    icon: Wrench,
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
    iconClassName: "bg-violet-100 text-violet-700",
  },
  INSTALLED: {
    label: "Instalado",
    icon: Wrench,
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
    iconClassName: "bg-violet-100 text-violet-700",
  },
}

export const fallbackTraceabilityEventStyle: TraceabilityEventStyle = {
  label: "Movimiento",
  icon: CircleHelp,
  badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  iconClassName: "bg-slate-100 text-slate-700",
}

export function getTraceabilityEventStyle(
  type: string | null | undefined
): TraceabilityEventStyle {
  const normalizedType = type?.trim().toUpperCase()

  if (normalizedType?.includes("INSTALL")) {
    return traceabilityEventStyles.INSTALLED
  }

  return (
    traceabilityEventStyles[normalizedType as InventoryMovementType] ??
    fallbackTraceabilityEventStyle
  )
}
