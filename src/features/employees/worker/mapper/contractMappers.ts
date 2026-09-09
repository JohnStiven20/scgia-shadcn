// contractMappers.ts

import { formatDate } from "@/utils/dateUtils"
import { formatCurrency } from "@/utils/currencyUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"
import { salaryTypes } from "@/features/interface/worker-contract/enum/salary-types"

export type ContractSummaryItem = {
  label: string
  value: string
  muted?: boolean
}

function getSalaryTypeLabel(value?: string | null) {
  return salaryTypes.find((salaryType) => salaryType.value === value)?.label
}

export function buildContractSummary(
  contract: WorkerContract
): ContractSummaryItem[] {
  return [
    {
      label: "Tipo de empleado",
      value: contract.employeeType || "Sin tipo",
      muted: !contract.employeeType,
    },
    {
      label: "Contrato",
      value: contract.endDate ? "Temporal" : "Indefinido",
    },
    {
      label: "Fecha inicio",
      value: formatDate(contract.startDate),
    },
    {
      label: "Fecha fin",
      value: formatDate(contract.endDate),
      muted: !contract.endDate,
    },
    {
      label: "Tipo de salario",
      value: getSalaryTypeLabel(contract.salaryType) || "Sin salario",
      muted: !contract.salaryType,
    },
    {
      label: "Salario bruto",
      value: formatCurrency(contract.salaryAmount),
    },
    {
      label: "Coste del empleador",
      value: formatCurrency(contract.employerCost),
      muted:
        contract.employerCost === null || contract.employerCost === undefined,
    },
    {
      label: "Categoría salarial",
      value: contract.salaryCategoryName || "Sin categoría",
      muted: !contract.salaryCategoryName,
    },
    {
      label: "Referencia",
      value: contract.reference || `CTR-${contract.id}`,
      muted: !contract.reference,
    },
  ]
}
