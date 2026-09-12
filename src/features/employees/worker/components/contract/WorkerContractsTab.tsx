import { Plus } from "lucide-react"
import { useState } from "react"

import { ConfirmDeleteDialog } from "@/components/general"
import { Button } from "@/components/ui/button"
import { useWorkerContractsTab } from "@/features/employees/worker/hook/useWorkerContractsTab"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

import { ContractDetail } from "./ContractDetail"
import { ContractTable } from "./ContractTable"
import { CreateWorkerContractDialog } from "./CreateWorkerContractDialog"
import { getContractReference } from "./contractPresentation"

type WorkerContractsTabProps = {
  workerId: number
  workerName: string
  workerDni: string
}

type ContractView = { type: "list" } | { type: "detail"; contractId: number }

export function WorkerContractsTab({
  workerId,
  workerName,
  workerDni,
}: WorkerContractsTabProps) {
  const [view, setView] = useState<ContractView>({ type: "list" })
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
    handleCreateDialogOpenChange,
    handleDeleteContract,
    handleDeleteDialogClose,
    handleEditContract,
    handleEditDialogOpenChange,
  } = useWorkerContractsTab({ workerId })

  const selectedContract =
    view.type === "detail"
      ? (contracts.find((contract) => contract.id === view.contractId) ?? null)
      : null

  function openContractDetail(contract: WorkerContract) {
    setView({ type: "detail", contractId: contract.id })
  }

  async function handleConfirmedDelete() {
    const wasDeleted = await confirmDeleteContract()

    if (wasDeleted) {
      setView({ type: "list" })
    }
  }

  function handleContractCreated() {
    setView({ type: "list" })
  }

  return (
    <section className="space-y-6">
      {view.type === "list" ? (
        <>
          <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Contratos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestiona los contratos e historial del trabajador.
              </p>
            </div>

            <Button
              type="button"
              className="w-fit"
              disabled={!canFetchContracts}
              onClick={openCreateDialog}
            >
              <Plus /> Crear contrato para este trabajador
            </Button>
          </header>

          {isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No se han podido cargar los contratos.
              <Button
                type="button"
                variant="link"
                className="ml-1 h-auto px-0"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <ContractTable
              contracts={contracts}
              isLoading={isFetching}
              onSelectContract={openContractDetail}
            />
          )}
        </>
      ) : selectedContract ? (
        <ContractDetail
          contract={selectedContract}
          workerName={workerName}
          workerDni={workerDni}
          isDeleting={isDeletingContract}
          onBack={() => setView({ type: "list" })}
          onEdit={handleEditContract}
          onDelete={handleDeleteContract}
        />
      ) : (
        <div className="rounded-lg border p-5 text-sm text-muted-foreground">
          El contrato seleccionado ya no está disponible.
          <Button
            type="button"
            variant="link"
            className="ml-1 h-auto px-0"
            onClick={() => setView({ type: "list" })}
          >
            Volver al listado
          </Button>
        </div>
      )}

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
        onOpenChange={handleEditDialogOpenChange}
      />
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Eliminar contrato"
        subtitle={`¿Seguro que quieres eliminar "${
          contractToDelete ? getContractReference(contractToDelete) : ""
        }"?`}
        loading={isDeletingContract}
        onClose={handleDeleteDialogClose}
        onDelete={handleConfirmedDelete}
      />
    </section>
  )
}
