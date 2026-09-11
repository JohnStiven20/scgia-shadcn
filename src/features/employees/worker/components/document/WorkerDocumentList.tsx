import { createColumnHelper } from "@tanstack/react-table"
import { FileText } from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import type { WorkerTrainingDocumentViewModel } from "../../interface/types/workerPage"
import { DocumentStatusBadge } from "./DocumentStatusBadge"

const columnHelper = createColumnHelper<
  DataTableFeatures,
  WorkerTrainingDocumentViewModel
>()

const documentColumns = columnHelper.columns([
  columnHelper.accessor("title", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    size: 300,
    minSize: 220,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-600">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.documentName}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("section", {
    header: "Categoría",
    size: 170,
    minSize: 140,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
        {row.original.section}
      </span>
    ),
  }),
  columnHelper.accessor("trainingDateLabel", {
    header: "Fecha curso",
    size: 160,
    minSize: 130,
    enableSorting: false,
  }),
  columnHelper.accessor("expirationDateLabel", {
    header: "Vencimiento",
    size: 170,
    minSize: 140,
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    size: 170,
    minSize: 150,
    enableSorting: false,
    cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
  }),
])

type WorkerDocumentListProps = {
  documents: WorkerTrainingDocumentViewModel[]
  isLoading?: boolean
  hasDocuments: boolean
  onSelectDocument: (documentId: number) => void
}

export function WorkerDocumentList({
  documents,
  isLoading = false,
  hasDocuments,
  onSelectDocument,
}: WorkerDocumentListProps) {
  return (
    <DataTable
      columns={documentColumns}
      data={documents}
      isLoading={isLoading}
      showPagination={false}
      getRowId={(document) => String(document.id)}
      onRowClick={(document) => onSelectDocument(document.id)}
      ariaLabel="Listado de documentos del trabajador"
      emptyMessage={
        hasDocuments
          ? "No hay documentos que coincidan con los filtros seleccionados."
          : "No hay documentos registrados para este trabajador."
      }
    />
  )
}
