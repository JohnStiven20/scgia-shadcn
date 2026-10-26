import { Badge } from "@/components/ui/badge"
import type { WorkOrderStatus } from "@/features/interface/work-orders/types"
import { CheckCircle2, Clock3, PauseCircle } from "lucide-react"

// import { Badge } from "src/components/ui/badge"
// import type { WorkOrderStatus } from "src/features/interface/work-orders/types"

const statusConfig: Record<
  WorkOrderStatus,
  {
    label: string
    className: string
    icon: typeof CheckCircle2
  }
> = {
  PROGRESSING: {
    label: "En progreso",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
  },
  BLOCKED: {
    label: "Bloqueada",
    icon: PauseCircle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
  },
  FINISHED: {
    label: "Finalizada",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Badge
      variant="outline"
      className={`h-6 gap-1.5 px-2.5 text-xs [&>svg]:size-3! ${config.className}`}
    >
      <StatusIcon aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
