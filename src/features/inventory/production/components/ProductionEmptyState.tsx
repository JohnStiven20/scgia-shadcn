import { Construction, PackageSearch } from "lucide-react"

type ProductionEmptyStateProps = {
  title?: string
  description?: string
  isError?: boolean
}

export function ProductionEmptyState({
  title = "Proveedor en desarrollo",
  description = "Todavía no hay un dashboard de producción disponible para este proveedor.",
  isError = false,
}: ProductionEmptyStateProps) {
  const Icon = isError ? PackageSearch : Construction

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
