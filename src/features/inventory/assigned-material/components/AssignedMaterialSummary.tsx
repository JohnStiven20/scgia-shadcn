import { BriefcaseBusiness, Layers3, PackageCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { AssignedModelDistributionResponse } from "../interface/AssignedModelDistributionResponse"
import type { AssignedWorkerResponse } from "../interface/AssignedWorkerResponse"

type AssignedMaterialSummaryProps = {
  models: AssignedModelDistributionResponse[]
  workers: AssignedWorkerResponse[]
  isLoading?: boolean
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof PackageCheck
  label: string
  value: number
  tone: string
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm text-muted-foreground">
            {label}
          </span>
          <strong className="mt-1 block text-2xl font-semibold tracking-tight">
            {value.toLocaleString("es-ES")}
          </strong>
        </span>
      </CardContent>
    </Card>
  )
}

export function AssignedMaterialSummary({
  models,
  workers,
  isLoading = false,
}: AssignedMaterialSummaryProps) {
  const totalProducts = models.reduce((total, model) => total + model.total, 0)
  const workersWithMaterial = workers.filter((worker) => worker.totalProducts > 0).length

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de material asignado">
      <SummaryCard
        icon={PackageCheck}
        label="Productos asignados"
        value={totalProducts}
        tone="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
      />
      <SummaryCard
        icon={BriefcaseBusiness}
        label="Trabajadores con material"
        value={workersWithMaterial}
        tone="bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
      />
      <SummaryCard
        icon={Layers3}
        label="Modelos asignados"
        value={models.length}
        tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
      />
    </div>
  )
}
