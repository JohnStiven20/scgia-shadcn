import { Download, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/currencyUtils"
import { formatDate } from "@/utils/dateUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

import {
  getContractReference,
  getContractType,
  getSalaryPeriodLabel,
  getSalaryTypeLabel,
} from "./contractPresentation"
import { ContractStatusBadge } from "./ContractStatusBadge"
import { ContractTemplatePreview } from "./ContractTemplatePreview"
import { canManageContract, getContractStatus } from "../../utils/contractUtils"

type ContractDetailProps = {
  contract: WorkerContract
  workerName: string
  workerDni: string
  isDeleting: boolean
  onBack: () => void
  onEdit: (contract: WorkerContract) => void
  onDelete: (contract: WorkerContract) => void
}

function ContractDataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  )
}

export function ContractDetail({
  contract,
  workerName,
  workerDni,
  isDeleting,
  onBack,
  onEdit,
  onDelete,
}: ContractDetailProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const reference = getContractReference(contract)
  const canManage = canManageContract(contract)
  const disabledReason =
    "Solo se pueden editar o eliminar contratos programados a futuro."

  return (
    <section className="space-y-6">
      <Breadcrumb className="print:hidden">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<button type="button" onClick={onBack} />}>
              Contratos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<button type="button" onClick={onBack} />}>
              Historial
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{reference}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight">
              Contrato {reference}
            </h3>
            <ContractStatusBadge status={getContractStatus(contract)} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta el detalle y la plantilla contractual generada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canManage}
            title={!canManage ? disabledReason : undefined}
            onClick={() => onEdit(contract)}
          >
            <Pencil /> Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canManage || isDeleting}
            title={!canManage ? disabledReason : undefined}
            onClick={() => onDelete(contract)}
          >
            <Trash2 /> {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button
            type="button"
            disabled={!pdfUrl}
            onClick={() => {
              if (!pdfUrl) return
              const link = document.createElement("a")
              link.href = pdfUrl
              link.download = `contrato-${reference}.pdf`
              link.click()
            }}
          >
            <Download /> Guardar como PDF
          </Button>
        </div>
      </header>

      <Card className="gap-0 py-0 print:hidden">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base font-semibold">
            Datos del contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-5 py-5 sm:grid-cols-3 lg:grid-cols-6">
          <ContractDataItem label="Referencia" value={reference} />
        
          <ContractDataItem
            label="Estado"
            value={getContractStatus(contract)}
          />
          <ContractDataItem
            label="Tipo de contrato"
            value={getContractType(contract)}
          />
          <ContractDataItem
            label="Tipo de empleado"
            value={contract.employeeType || "Sin tipo"}
          />
          <ContractDataItem
            label="Fecha de inicio"
            value={formatDate(contract.startDate)}
          />
          <ContractDataItem
            label="Fecha de fin"
            value={formatDate(contract.endDate, undefined, "Sin fecha de fin")}
          />
          <ContractDataItem
            label="Tipo de salario"
            value={getSalaryTypeLabel(contract.salaryType)}
          />
          <ContractDataItem
            label="Período salarial"
            value={getSalaryPeriodLabel(contract.salaryPeriod)}
          />
          <ContractDataItem
            label="Salario bruto"
            value={formatCurrency(contract.salaryAmount)}
          />
          <ContractDataItem
            label="Coste empresarial"
            value={formatCurrency(contract.employerCost)}
          />
          <ContractDataItem
            label="Categoría salarial"
            value={contract.salaryCategoryName || "Sin categoría"}
          />
          <ContractDataItem
            label="Horas semanales"
            value={`${contract.weeklyHours} h`}
          />
        </CardContent>
      </Card>

      <ContractTemplatePreview
        contract={contract}
        workerName={workerName}
        workerDni={workerDni}
        onPdfUrlChange={setPdfUrl}
      />
    </section>
  )
}
