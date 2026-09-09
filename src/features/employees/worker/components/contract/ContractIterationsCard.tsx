import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { ContractStatusBadge } from "./ContractStatusBadge"
import { formatDate } from "../../../../../utils/dateUtils"
import { getContractStatus } from "../../utils/contractUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

type ContractIterationsCardProps = {
  contracts: WorkerContract[]
  selectedContractId?: number
  onSelectContract: (contract: WorkerContract) => void
}

export function ContractIterationsCard({
  contracts,
  selectedContractId,
  onSelectContract,
}: ContractIterationsCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Iteraciones de contratos
        </CardTitle>
        <CardDescription>
          Historial de versiones y renovaciones de este trabajador.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {contracts.length === 0 ? (
          <div className="rounded-lg border bg-background p-6 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">Sin contratos</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Los contratos creados apareceran aqui.
            </p>
          </div>
        ) : null}

        {contracts.map((contract) => (
          <article
            key={contract.id}
            className={cn(
              "grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_auto_auto_auto]",
              selectedContractId === contract.id && "bg-muted/40"
            )}
            onClick={() => onSelectContract(contract)}
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">
                {contract.employeeType || "Contrato"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {contract.reference || `CTR-${contract.id}`}
              </p>
            </div>

            <time className="hidden text-xs text-muted-foreground sm:block">
              {formatDate(contract.startDate)}
            </time>
            <ContractStatusBadge status={getContractStatus(contract)} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              aria-label={`Ver contrato ${contract.reference || contract.id}`}
              onClick={(event) => {
                event.stopPropagation()
                onSelectContract(contract)
              }}
            >
              <FileText />
            </Button>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
