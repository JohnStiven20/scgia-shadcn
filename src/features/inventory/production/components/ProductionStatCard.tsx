import type { ReactNode } from "react"

type ProductionStatCardProps = {
  label: string
  value: string
  icon: ReactNode
  iconClassName: string
}

export function ProductionStatCard({
  label,
  value,
  icon,
  iconClassName,
}: ProductionStatCardProps) {
  return (
    <article className="flex min-w-0 items-center gap-4 rounded-xl border bg-card px-5 py-4 shadow-xs">
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </article>
  )
}
