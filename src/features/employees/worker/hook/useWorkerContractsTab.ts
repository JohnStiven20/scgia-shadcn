import { useEffect, useMemo, useState } from "react"

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
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  )
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

  const selectedContract = useMemo(() => {
    return (
      sortedContracts.find((contract) => contract.id === selectedContractId) ??
      sortedContracts[0] ??
      null
    )
  }, [selectedContractId, sortedContracts])

  useEffect(() => {
    if (!selectedContractId && sortedContracts[0]) {
      setSelectedContractId(sortedContracts[0].id)
    }
  }, [selectedContractId, sortedContracts])

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

  function handleSelectContract(contract: WorkerContract) {
    setSelectedContractId(contract.id)
  }

  function handleContractCreated() {
    setSelectedContractId(null)
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
      return
    }

    try {
      await deleteWorkerContract({
        id: contractToDelete.id,
        workerId: contractToDelete.workerId,
      }).unwrap()
      setSelectedContractId(null)
      setContractToDelete(null)
      notifications.success("Contrato eliminado correctamente.")
    } catch (error) {
      handleError(error, "No se ha podido eliminar el contrato.")
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
    selectedContract,
    confirmDeleteContract,
    handleContractCreated,
    handleCreateDialogOpenChange,
    handleDeleteContract,
    handleDeleteDialogClose,
    handleEditContract,
    handleEditDialogOpenChange,
    handleSelectContract,
  }
}
