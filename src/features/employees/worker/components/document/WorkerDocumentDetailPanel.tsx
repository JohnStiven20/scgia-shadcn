import {
  Calendar,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkerTrainingDocumentViewModel } from "../../interface/types/workerPage"
import { buildWorkerDocumentInfo } from "../../mapper/documentMappers"
import { canPreviewDocument, isImageDocument } from "../../utils/documentUtils"
import { DocumentStatusBadge } from "./DocumentStatusBadge"

type WorkerDocumentDetailPanelProps = {
  document: WorkerTrainingDocumentViewModel | null
  onEditDocument: () => void
  onDeleteDocument: () => void
}

const infoIcons = [UserRound, Tag, Calendar, Calendar, Clock3, FileText]

function DocumentPreview({
  document,
}: {
  document: WorkerTrainingDocumentViewModel
}) {
  const canPreview = canPreviewDocument(document.mimeType, document.documentPath)
  const isImage = isImageDocument(document.mimeType, document.documentPath)

  if (!document.documentPath || !canPreview) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-lg border bg-muted/30 text-center">
        <div className="grid gap-2 justify-items-center px-4">
          <FileText className="size-12 text-muted-foreground" />
          <p className="max-w-56 truncate text-sm font-semibold">
            {document.title}
          </p>
          <p className="max-w-64 text-xs text-muted-foreground">
            Este archivo no se puede previsualizar en el navegador.
          </p>
          <DocumentStatusBadge status={document.status} />
        </div>
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <img
          src={document.documentPath}
          alt={document.title}
          className="aspect-[4/3] w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <iframe
        src={document.documentPath}
        title={document.title}
        className="h-[420px] w-full bg-background"
      />
    </div>
  )
}

export function WorkerDocumentDetailPanel({
  document,
  onEditDocument,
  onDeleteDocument,
}: WorkerDocumentDetailPanelProps) {
  if (!document) {
    return (
      <Card className="min-h-80">
        <CardContent className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
          Selecciona un documento para ver el detalle.
        </CardContent>
      </Card>
    )
  }

  const info = buildWorkerDocumentInfo(document)
  const canOpen = Boolean(document.documentPath)

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b p-4">
        <CardTitle className="truncate text-base font-semibold">
          {document.documentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <DocumentPreview document={document} />

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            disabled={!canOpen}
            onClick={() => {
              if (document.documentPath) {
                window.open(document.documentPath, "_blank", "noopener")
              }
            }}
          >
            <ExternalLink />
            Abrir
          </Button>
          <Button type="button" variant="outline" onClick={onEditDocument}>
            <Pencil />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onDeleteDocument}
          >
            <Trash2 />
            Eliminar
          </Button>
        </div>

        <section>
          <h3 className="border-b pb-2 text-sm font-semibold">
            Informacion del documento
          </h3>
          <dl className="mt-3 grid gap-3">
            {info.map((item, index) => {
              const Icon = infoIcons[index] ?? Download

              return (
                <div
                  key={item.label}
                  className="grid grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 text-sm"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="truncate font-semibold">{item.value}</dd>
                </div>
              )
            })}
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}
