import { useMemo, useState } from "react"

import {
  useDeleteWorkerContractMutation,
  useGetWorkerContractsByWorkerIdQuery,
} from "@/features/employees/worker/api/workerContractApi"
import {
  canManageContract,
  sortContractsByStartDate,
} from "../utils/contractUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"
import { useGlobalError } from "@/hooks"
import { useNotifications } from "@/components/notifications/NotificationsProvider"

type UseWorkerContractsTabParams = {
  workerId: number
}

export function useWorkerContractsTab({
  workerId,
}: UseWorkerContractsTabParams) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [contractToEdit, setContractToEdit] = useState<WorkerContract | null>(
    null
  )
  const [contractToDelete, setContractToDelete] =
    useState<WorkerContract | null>(null)
  const [deleteWorkerContract, { isLoading: isDeletingContract }] =
    useDeleteWorkerContractMutation()
  const { handleError } = useGlobalError()
  const notifications = useNotifications()

  const canFetchContracts = Number.isFinite(workerId) && workerId > 0
  const {
    data: contracts = [],
    isFetching,
    isError,
    refetch,
  } = useGetWorkerContractsByWorkerIdQuery(workerId, {
    skip: !canFetchContracts,
  })

  const sortedContracts = useMemo(
    () => sortContractsByStartDate(contracts),
    [contracts]
  )

  function openCreateDialog() {
    setIsCreateDialogOpen(true)
  }

  function handleCreateDialogOpenChange(open: boolean) {
    setIsCreateDialogOpen(open)
  }

  function handleEditDialogOpenChange(open: boolean) {
    if (!open) {
      setContractToEdit(null)
    }
  }

  function handleDeleteDialogClose() {
    if (!isDeletingContract) {
      setContractToDelete(null)
    }
  }

  function handleEditContract(contract: WorkerContract) {
    if (!canManageContract(contract)) {
      notifications.error(
        "Solo se pueden editar contratos programados a futuro."
      )

      return
    }

    setContractToEdit(contract)
  }

  function handleDeleteContract(contract: WorkerContract) {
    if (!canManageContract(contract)) {
      notifications.error(
        "Solo se pueden eliminar contratos programados a futuro."
      )

      return
    }

    setContractToDelete(contract)
  }

  async function confirmDeleteContract() {
    if (!contractToDelete) {
      return false
    }

    try {
      await deleteWorkerContract({
        id: contractToDelete.id,
        workerId: contractToDelete.workerId,
      }).unwrap()
      setContractToDelete(null)
      notifications.success("Contrato eliminado correctamente.")
      return true
    } catch (error) {
      handleError(error, "No se ha podido eliminar el contrato.")
      return false
    }
  }

  return {
    canFetchContracts,
    contracts: sortedContracts,
    contractToDelete,
    isCreateDialogOpen,
    isDeleteDialogOpen: Boolean(contractToDelete),
    isDeletingContract,
    isEditDialogOpen: Boolean(contractToEdit),
    isError,
    isFetching,
    openCreateDialog,
    refetch,
    contractToEdit,
    confirmDeleteContract,
    handleCreateDialogOpenChange,
    handleDeleteContract,
    handleDeleteDialogClose,
    handleEditContract,
    handleEditDialogOpenChange,
  }
}
