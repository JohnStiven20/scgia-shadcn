// contractUtils.ts

import type { ContractStatus } from "@/features/interface/worker-contract/enum/contract-status"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"


export function getContractStatus(
    contract: WorkerContract
): ContractStatus {
    const now = new Date()
    const startDate = new Date(contract.startDate)
    const endDate = contract.endDate
        ? new Date(contract.endDate)
        : null

    if (!Number.isNaN(startDate.getTime()) && startDate > now) {
        return "Programado"
    }

    if (
        endDate &&
        !Number.isNaN(endDate.getTime()) &&
        endDate < now
    ) {
        return "Finalizado"
    }

    return "Activo"
}

export function sortContractsByStartDate(
    contracts: WorkerContract[]
): WorkerContract[] {
    return [...contracts].sort((a, b) => {
        return (
            new Date(b.startDate).getTime() -
            new Date(a.startDate).getTime()
        )
    })
}