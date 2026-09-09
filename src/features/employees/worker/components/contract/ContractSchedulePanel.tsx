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
    <aside className="grid gap-3">
      <h3 className="text-xs font-semibold tracking-normal uppercase">
        Horario
      </h3>

      <section className="flex items-center gap-4 rounded-lg border bg-background p-4">
        <Clock3 className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">{hours}</p>
          <p className="text-xs text-muted-foreground">{days}</p>
        </div>
      </section>

      <section className="flex gap-3 rounded-lg border bg-background p-4 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Este panel resume el contrato seleccionado del trabajador. Usa el
          boton superior para registrar una nueva iteracion.
        </p>
      </section>
    </aside>
  )
}
