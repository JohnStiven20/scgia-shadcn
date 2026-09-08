import type { ReactNode } from "react"

type EmployeesPageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmployeesPageHeader({
  title,
  description,
  action,
}: EmployeesPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <article>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </article>
      {action}
    </header>
  )
}
