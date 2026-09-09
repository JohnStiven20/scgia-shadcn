import { Badge } from "@/components/ui/badge"
import type { ContractStatus } from "@/features/interface/worker-contract/enum/contract-status"
import { cn } from "@/lib/utils"


const statusStyles: Record<ContractStatus, string> = {
  Activo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Programado: "border-blue-200 bg-blue-50 text-blue-700",
  Finalizado: "border-muted bg-muted text-muted-foreground",
}

const dotStyles: Record<ContractStatus, string> = {
  Activo: "bg-emerald-600",
  Programado: "bg-blue-600",
  Finalizado: "bg-muted-foreground",
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-2 px-3 text-xs", statusStyles[status])}
    >
      <span className={cn("size-2 rounded-full", dotStyles[status])} />
      {status}
    </Badge>
  )
}
