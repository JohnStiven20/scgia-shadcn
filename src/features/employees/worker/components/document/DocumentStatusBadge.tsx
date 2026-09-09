import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { WorkerDocumentStatus } from "../../utils/documentUtils"

type DocumentStatusBadgeProps = {
  status: WorkerDocumentStatus
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 px-2.5 text-xs",
        status === "Vigente" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "Por caducar" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "Caducado" && "border-red-200 bg-red-50 text-red-700",
        status === "Sin vencimiento" &&
          "border-muted bg-muted text-muted-foreground"
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  )
}
