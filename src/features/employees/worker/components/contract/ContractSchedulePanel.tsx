import { Clock3, Info } from "lucide-react"

type ContractSchedulePanelProps = {
  hours: string
  days: string
}

export function ContractSchedulePanel({
  hours,
  days,
}: ContractSchedulePanelProps) {
  return (
    <aside className="grid min-w-0 gap-3">
      <h3 className="text-xs font-semibold tracking-normal uppercase">
        Horario
      </h3>

      <section className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-4">
        <Clock3 className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-semibold break-words">{hours}</p>
          <p className="text-xs break-words text-muted-foreground">{days}</p>
        </div>
      </section>

      <section className="flex min-w-0 gap-3 rounded-lg border bg-background p-4 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="min-w-0 break-words">
          Resumen del horario del contrato seleccionado.
        </p>
      </section>
    </aside>
  )
}
