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
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Contratos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión del contrato actual y trazabilidad de las iteraciones del
            trabajador.
          </p>
        </div>

        <Button
          type="button"
          className="w-fit"
          disabled={!canFetchContracts}
          onClick={openCreateDialog}
        >
          <Plus />
          Crear contrato para este trabajador
        </Button>
      </header>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        {isFetching ? (
          <div className="flex min-h-56 items-center justify-center rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
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

        <div className="grid min-w-0 gap-3">
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
