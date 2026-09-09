import type { ReactNode } from "react"

type FleetPageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function FleetPageHeader({
  title,
  description,
  action,
}: FleetPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </section>
      {action}
    </header>
  )
}
