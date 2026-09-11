import type { AbsenceStatus } from "./absencesPage.types"

export const emptyCalendarRequests = []

export const statusVisuals: Record<
  AbsenceStatus,
  {
    label: string
    dotClassName: string
    badgeClassName: string
    eventClassName: string
  }
> = {
  PENDING: {
    label: "Pendiente",
    dotClassName: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    eventClassName: "border-amber-300 bg-amber-50/95 text-amber-900",
  },
  APPROVED: {
    label: "Aprobado",
    dotClassName: "bg-emerald-500",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    eventClassName: "border-emerald-300 bg-emerald-50/95 text-emerald-900",
  },
  REJECTED: {
    label: "Rechazado",
    dotClassName: "bg-red-500",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
    eventClassName: "border-red-300 bg-red-50/95 text-red-900",
  },
  CANCELLED: {
    label: "Cancelado",
    dotClassName: "bg-slate-400",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-600",
    eventClassName: "border-slate-300 bg-slate-50/95 text-slate-800",
  },
}
