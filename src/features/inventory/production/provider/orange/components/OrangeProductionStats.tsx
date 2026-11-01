import { ClipboardCheck, Coins, Layers3, Wrench } from "lucide-react"

import type { OrangeProductionSummary } from "../../../interface/orange/OrangeProductionSummary"
import { ProductionStatCard } from "../../../components/ProductionStatCard"

type OrangeProductionStatsProps = {
  summary?: OrangeProductionSummary
  isLoading?: boolean
}

const numberFormatter = new Intl.NumberFormat("es-ES")
const amountFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

export function OrangeProductionStats({
  summary,
  isLoading = false,
}: OrangeProductionStatsProps) {
  const value = (nextValue: number | undefined, format = numberFormatter) =>
    isLoading || nextValue == null ? "—" : format.format(nextValue)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ProductionStatCard
        label="Órdenes realizadas"
        value={value(summary?.totalOrders)}
        icon={<ClipboardCheck className="size-7" aria-hidden="true" />}
        iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
      />
      <ProductionStatCard
        label="Tipos de tareas"
        value={value(summary?.taskTypes)}
        icon={<Wrench className="size-7" aria-hidden="true" />}
        iconClassName="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
      />
      <ProductionStatCard
        label="Puntos totales"
        value={value(summary?.totalPoints, new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }))}
        icon={<Layers3 className="size-7" aria-hidden="true" />}
        iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
      />
      <ProductionStatCard
        label="Producción económica"
        value={value(summary?.totalAmount, amountFormatter)}
        icon={<Coins className="size-7" aria-hidden="true" />}
        iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
      />
    </div>
  )
}
