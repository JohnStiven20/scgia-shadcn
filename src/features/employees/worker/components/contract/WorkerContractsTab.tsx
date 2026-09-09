import { Plus } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
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
    contractToDelete,
    contractToEdit,
    confirmDeleteContract,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    isDeletingContract,
    isEditDialogOpen,
    isError,
    isFetching,
    openCreateDialog,
    refetch,
    selectedContract,
    handleContractCreated,
    handleCreateDialogOpenChange,
    handleDeleteContract,
    handleDeleteDialogClose,
    handleEditContract,
    handleEditDialogOpenChange,
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

      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,28rem),1fr))] items-start gap-4">
        {isFetching ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando contratos...
          </div>
        ) : (
          <SelectedContractCard
            contract={selectedContract}
            isDeleting={isDeletingContract}
            onDeleteContract={handleDeleteContract}
            onEditContract={handleEditContract}
          />
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
      <CreateWorkerContractDialog
        open={isEditDialogOpen}
        workerId={workerId}
        contract={contractToEdit}
        onCreated={handleContractCreated}
        onOpenChange={handleEditDialogOpenChange}
      />
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Eliminar contrato"
        subtitle={`Seguro que quieres eliminar "${
          contractToDelete?.reference || `CTR-${contractToDelete?.id ?? ""}`
        }"?`}
        loading={isDeletingContract}
        onClose={handleDeleteDialogClose}
        onDelete={confirmDeleteContract}
      />
    </section>
  )
}
