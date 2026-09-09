import { FileText, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { WorkerTrainingDocumentViewModel } from "../../interface/types/workerPage"
import { DocumentStatusBadge } from "./DocumentStatusBadge"

type WorkerDocumentListProps = {
  documents: WorkerTrainingDocumentViewModel[]
  selectedDocumentId?: number
  isFetching?: boolean
  onSelectDocument: (documentId: number) => void
}

export function WorkerDocumentList({
  documents,
  selectedDocumentId,
  isFetching,
  onSelectDocument,
}: WorkerDocumentListProps) {
  return (
    <Card className="min-h-80 gap-0 overflow-hidden py-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-64 px-4">Documento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fecha curso</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  Cargando documentos...
                </TableCell>
              </TableRow>
            ) : null}

            {!isFetching && documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-36 text-center text-sm text-muted-foreground"
                >
                  No hay cursos ni documentos registrados.
                </TableCell>
              </TableRow>
            ) : null}

            {!isFetching
              ? documents.map((document) => (
                  <TableRow
                    key={document.id}
                    className={cn(
                      "cursor-pointer",
                      selectedDocumentId === document.id &&
                        "border-l-2 border-l-primary bg-muted/40"
                    )}
                    onClick={() => onSelectDocument(document.id)}
                  >
                    <TableCell className="px-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-600">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {document.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {document.documentName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {document.section}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {document.trainingDateLabel}
                    </TableCell>
                    <TableCell className="text-sm">
                      {document.expirationDateLabel}
                    </TableCell>
                    <TableCell>
                      <DocumentStatusBadge status={document.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones de ${document.title}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>

        <footer className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mostrando {documents.length} de {documents.length} resultados
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" disabled>
              1
            </Button>
          </div>
        </footer>
      </CardContent>
    </Card>
  )
}
