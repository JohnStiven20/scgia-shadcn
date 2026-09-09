import { File, Layers3, Settings, ShieldCheck, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WorkerDocumentSectionKey } from "../../utils/documentUtils"

type DocumentCategorySidebarProps = {
  categories: Array<{
    key: WorkerDocumentSectionKey
    label: string
    count: number
  }>
  selectedSection: WorkerDocumentSectionKey
  onSelectSection: (section: WorkerDocumentSectionKey) => void
}

const categoryIcons = {
  ALL: Layers3,
  FORMACION: GraduationCap,
  SEGURIDAD: ShieldCheck,
  OPERACION: Settings,
  UNASSIGNED: File,
} satisfies Record<WorkerDocumentSectionKey, React.ElementType>

export function DocumentCategorySidebar({
  categories,
  selectedSection,
  onSelectSection,
}: DocumentCategorySidebarProps) {
  return (
    <aside className="rounded-lg border bg-card p-3">
      <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-normal">
        Categorias
      </h3>
      <nav className="grid gap-1">
        {categories.map((category) => {
          const Icon = categoryIcons[category.key]
          const isSelected = category.key === selectedSection

          return (
            <Button
              key={category.key}
              type="button"
              variant="ghost"
              className={cn(
                "h-10 justify-start gap-2 px-2 text-sm",
                isSelected && "bg-muted text-foreground"
              )}
              onClick={() => onSelectSection(category.key)}
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-left">
                {category.label}
              </span>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs text-muted-foreground">
                {category.count}
              </span>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
