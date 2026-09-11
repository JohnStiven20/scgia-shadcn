import { salaryPeriods } from "@/features/interface/worker-contract/enum/salary-periods"
import { salaryTypes } from "@/features/interface/worker-contract/enum/salary-types"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

export function getContractReference(contract: WorkerContract) {
  return contract.reference?.trim() || `CTR-${contract.id}`
}

export function getContractType(contract: WorkerContract) {
  return contract.endDate ? "Temporal" : "Indefinido"
}

export function getSalaryTypeLabel(value?: string | null) {
  return (
    salaryTypes.find((salaryType) => salaryType.value === value)?.label ||
    value ||
    "Sin especificar"
  )
}

export function getSalaryPeriodLabel(value?: string | null) {
  return (
    salaryPeriods.find((salaryPeriod) => salaryPeriod.value === value)?.label ||
    value ||
    "Sin especificar"
  )
}
