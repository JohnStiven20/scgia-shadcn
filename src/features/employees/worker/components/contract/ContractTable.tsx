import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"
import { formatDate } from "@/utils/dateUtils"

import { getContractReference, getContractType } from "./contractPresentation"
import { ContractStatusBadge } from "./ContractStatusBadge"
import { getContractStatus } from "../../utils/contractUtils"

const columnHelper = createColumnHelper<DataTableFeatures, WorkerContract>()

const columns = columnHelper.columns([
  columnHelper.accessor(getContractReference, {
    id: "reference",
    header: "Referencia",
    size: 170,
    minSize: 130,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-medium">{getContractReference(row.original)}</span>
    ),
  }),
  columnHelper.accessor("id", {
    header: "ID interno",
    size: 120,
    minSize: 100,
    enableSorting: false,
  }),
  columnHelper.accessor(getContractType, {
    id: "contractType",
    header: "Tipo",
    size: 160,
    minSize: 130,
    enableSorting: false,
  }),
  columnHelper.accessor("startDate", {
    header: "Inicio",
    size: 150,
    minSize: 125,
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.startDate),
  }),
  columnHelper.accessor("endDate", {
    header: "Fin",
    size: 150,
    minSize: 125,
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.endDate, undefined, "—"),
  }),
  columnHelper.display({
    id: "status",
    header: "Estado",
    size: 165,
    minSize: 145,
    enableSorting: false,
    cell: ({ row }) => (
      <ContractStatusBadge status={getContractStatus(row.original)} />
    ),
  }),
])

type ContractTableProps = {
  contracts: WorkerContract[]
  isLoading: boolean
  onSelectContract: (contract: WorkerContract) => void
}

export function ContractTable({
  contracts,
  isLoading,
  onSelectContract,
}: ContractTableProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base font-semibold">
          Contratos del trabajador
        </CardTitle>
        <CardDescription>
          Selecciona un contrato para ver su detalle.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <DataTable
          columns={columns}
          data={contracts}
          isLoading={isLoading}
          showPagination={false}
          getRowId={(contract) => String(contract.id)}
          onRowClick={onSelectContract}
          ariaLabel="Listado de contratos del trabajador"
          emptyMessage="Este trabajador no tiene contratos registrados."
        />
      </CardContent>
    </Card>
  )
}
