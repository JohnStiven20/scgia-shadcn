import { FileText, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { ContractSchedulePanel } from "./ContractSchedulePanel"
import { ContractStatusBadge } from "./ContractStatusBadge"
import { buildContractSummary } from "../../mapper/contractMappers"
import { getContractStatus } from "../../utils/contractUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

type SelectedContractCardProps = {
  contract: WorkerContract | null
}

export function SelectedContractCard({ contract }: SelectedContractCardProps) {
  if (!contract) {
    return (
      <Card className="min-h-80 items-center justify-center p-8 text-center">
        <FileText className="size-8 text-muted-foreground" />
        <div>
          <h2 className="text-base font-semibold">Sin contrato seleccionado</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Crea un contrato para este trabajador o selecciona uno del
            historial.
          </p>
        </div>
      </Card>
    )
  }

  const summary = buildContractSummary(contract)
  const status = getContractStatus(contract)

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b p-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <CardTitle className="text-base font-semibold">
            Contrato seleccionado
          </CardTitle>
          <ContractStatusBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-2 max-sm:mt-3">
          <Button variant="outline" type="button">
            <Pencil />
            Editar
          </Button>
          <Button variant="outline" type="button">
            <Trash2 />
            Eliminar
          </Button>
          <Button variant="outline" type="button">
            <FileText />
            Ver Contrato
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-4 md:grid-cols-[1fr_280px]">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[190px_1fr]">
          {summary.map((item) => (
            <div key={item.label} className="grid gap-1 sm:contents">
              <dt className="text-sm font-semibold">{item.label}</dt>
              <dd
                className={cn(
                  "text-sm text-foreground",
                  item.muted && "text-muted-foreground"
                )}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <ContractSchedulePanel
            hours={`${contract.weeklyHours} h / semana`}
            days="Lunes a viernes"
          />
        </div>
      </CardContent>
    </Card>
  )
}
