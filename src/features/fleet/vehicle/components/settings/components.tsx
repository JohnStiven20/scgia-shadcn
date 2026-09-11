import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function SettingsStatus({ available }: { available: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-950">
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full border",
          available
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-neutral-300 text-neutral-500"
        )}
      >
        <CheckCircle2 className="size-3.5" />
      </span>
      <span>{available ? "Disponible para asignacion" : "No disponible"}</span>
    </div>
  )
}

export function SettingsPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {children}
    </div>
  )
}

export function SettingsRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,0.55fr)_minmax(18rem,0.45fr)] md:items-center">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-neutral-950">{title}</h3>
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function ReadOnlyValue({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
      {children}
    </div>
  )
}
