import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { statusVisuals } from "./absencesPage.constants"
import type { AbsenceStatus } from "./absencesPage.types"

export function AbsenceStatusChip({ status }: { status: AbsenceStatus }) {
  const visual = statusVisuals[status]

  return (
    <Badge variant="outline" className={cn("gap-1.5", visual.badgeClassName)}>
      <span className={cn("size-1.5 rounded-full", visual.dotClassName)} />
      {visual.label}
    </Badge>
  )
}
