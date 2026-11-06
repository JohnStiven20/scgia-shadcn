import { BriefcaseBusiness, Layers3, PackageCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type WorkerAssignedSummaryProps = {
  totalProducts: number
  totalModels: number
  lastAssignment: string | null
  isLoading?: boolean
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDate(value: string | null) {
  if (!value) return "Sin asignaciones"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export function WorkerAssignedSummary({
  totalProducts,
  totalModels,
  lastAssignment,
  isLoading = false,
}: WorkerAssignedSummaryProps) {
  const cards = [
    {
      label: "Productos asignados",
      value: totalProducts.toLocaleString("es-ES"),
      icon: PackageCheck,
      tone: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      label: "Modelos distintos",
      value: totalModels.toLocaleString("es-ES"),
      icon: Layers3,
      tone: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
    },
    {
      label: "Última asignación",
      value: formatDate(lastAssignment),
      icon: BriefcaseBusiness,
      tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
  ]

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
    <div className="grid gap-3 sm:grid-cols-3" aria-label="Resumen del trabajador">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-muted-foreground">{label}</span>
              <strong className="mt-1 block truncate text-xl font-semibold tracking-tight">{value}</strong>
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
