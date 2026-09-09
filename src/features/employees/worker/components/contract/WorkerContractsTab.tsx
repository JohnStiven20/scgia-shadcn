import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useWorkerContractsTab } from "@/features/employees/worker/hook/useWorkerContractsTab"

import { ContractIterationsCard } from "./ContractIterationsCard"
import { CreateWorkerContractDialog } from "./CreateWorkerContractDialog"
import { SelectedContractCard } from "./SelectedContractCard"

type WorkerContractsTabProps = {
  workerId: number
}

export function WorkerContractsTab({ workerId }: WorkerContractsTabProps) {
  const {
    canFetchContracts,
    contracts,
    isCreateDialogOpen,
    isError,
    isFetching,
    openCreateDialog,
    refetch,
    selectedContract,
    handleContractCreated,
    handleCreateDialogOpenChange,
    handleSelectContract,
  } = useWorkerContractsTab({ workerId })

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">CONTRATOS</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion del contrato actual y trazabilidad de las iteraciones del
            trabajador.
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-fit"
          disabled={!canFetchContracts}
          onClick={openCreateDialog}
        >
          <Plus />
          Crear contrato para este trabajador
        </Button>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
        {isFetching ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando contratos...
          </div>
        ) : (
          <SelectedContractCard contract={selectedContract} />
        )}

        <div className="grid gap-3">
          {isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              No se han podido cargar los contratos.
              <Button
                type="button"
                variant="link"
                className="ml-1 h-auto px-0 text-xs"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : null}
          <ContractIterationsCard
            contracts={contracts}
            selectedContractId={selectedContract?.id}
            onSelectContract={handleSelectContract}
          />
        </div>
      </div>

      <CreateWorkerContractDialog
        open={isCreateDialogOpen}
        workerId={workerId}
        onCreated={handleContractCreated}
        onOpenChange={handleCreateDialogOpenChange}
      />
    </section>
  )
}
