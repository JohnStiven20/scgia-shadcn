import { FileText, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { ContractSchedulePanel } from "./ContractSchedulePanel"
import { ContractStatusBadge } from "./ContractStatusBadge"
import { buildContractSummary } from "../../mapper/contractMappers"
import { canManageContract, getContractStatus } from "../../utils/contractUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

type SelectedContractCardProps = {
  contract: WorkerContract | null
  isDeleting?: boolean
  onDeleteContract?: (contract: WorkerContract) => void
  onEditContract?: (contract: WorkerContract) => void
}

export function SelectedContractCard({
  contract,
  isDeleting = false,
  onDeleteContract,
  onEditContract,
}: SelectedContractCardProps) {
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
  const canManage = canManageContract(contract)
  const manageDisabledReason =
    "Solo se pueden editar o eliminar contratos programados a futuro."

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <CardTitle className="text-base font-semibold">
              Contrato seleccionado
            </CardTitle>
            <div>
              <ContractStatusBadge status={status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="min-w-24"
              disabled={!canManage || !onEditContract}
              title={!canManage ? manageDisabledReason : undefined}
              onClick={() => onEditContract?.(contract)}
            >
              <Pencil />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="min-w-24"
              disabled={!canManage || isDeleting}
              title={!canManage ? manageDisabledReason : undefined}
              onClick={() => onDeleteContract?.(contract)}
            >
              <Trash2 />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="min-w-32"
            >
              <FileText />
              Ver Contrato
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-4 min-[1920px]:grid-cols-[minmax(320px,1fr)_minmax(240px,280px)]">
        <dl className="grid min-w-0 gap-x-4 gap-y-4 sm:grid-cols-[150px_minmax(160px,1fr)]">
          {summary.map((item) => (
            <div key={item.label} className="grid gap-1 sm:contents">
              <dt className="text-sm font-semibold">{item.label}</dt>
              <dd
                className={cn(
                  "min-w-0 text-sm break-words text-foreground [overflow-wrap:anywhere]",
                  item.muted && "text-muted-foreground"
                )}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t pt-5 min-[1920px]:border-t-0 min-[1920px]:border-l min-[1920px]:pt-0 min-[1920px]:pl-5">
          <ContractSchedulePanel
            hours={`${contract.weeklyHours} h / semana`}
            days="Lunes a viernes"
          />
        </div>
      </CardContent>
    </Card>
  )
}
