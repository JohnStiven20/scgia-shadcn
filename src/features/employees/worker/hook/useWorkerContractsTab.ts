import { useEffect, useMemo, useState } from "react"

import {
  useGetWorkerContractsByWorkerIdQuery,
} from "@/features/employees/worker/api/workerContractApi"
import { sortContractsByStartDate } from "../utils/contractUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

type UseWorkerContractsTabParams = {
  workerId: number
}

export function useWorkerContractsTab({
  workerId,
}: UseWorkerContractsTabParams) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  )

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

  function handleSelectContract(contract: WorkerContract) {
    setSelectedContractId(contract.id)
  }

  function handleContractCreated() {
    setSelectedContractId(null)
  }

  return {
    canFetchContracts,
    contracts: sortedContracts,
    isCreateDialogOpen,
    isError,
    isFetching,
    openCreateDialog,
    refetch,
    selectedContract,
    handleContractCreated,
    handleCreateDialogOpenChange,
    handleSelectContract,
  }
}
