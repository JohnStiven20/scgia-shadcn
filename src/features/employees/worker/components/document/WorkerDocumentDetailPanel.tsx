import {
  Calendar,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  Pencil,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react"

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
import { useIsMobile } from "@/hooks/use-mobile"
import type { WorkerTrainingDocumentViewModel } from "../../interface/types/workerPage"
import { buildWorkerDocumentInfo } from "../../mapper/documentMappers"
import { canPreviewDocument, isImageDocument } from "../../utils/documentUtils"
import { DocumentStatusBadge } from "./DocumentStatusBadge"

type WorkerDocumentDetailPanelProps = {
  document: WorkerTrainingDocumentViewModel | null
  onBack: () => void
  onEditDocument: () => void
  onDeleteDocument: () => void
}

const infoIcons = [
  UserRound,
  Tag,
  Calendar,
  Calendar,
  Clock3,
  FileText,
  Download,
  MessageSquare,
]

function DocumentPreview({
  document,
}: {
  document: WorkerTrainingDocumentViewModel
}) {
  const isMobile = useIsMobile()
  const canPreview = canPreviewDocument(
    document.mimeType,
    document.documentPath
  )
  const isImage = isImageDocument(document.mimeType, document.documentPath)

  if (!document.documentPath || !canPreview) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-lg border bg-muted/30 text-center">
        <div className="grid justify-items-center gap-2 px-4">
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
          className="max-h-[680px] min-h-64 w-full object-contain"
        />
      </div>
    )
  }

  if (isMobile) {
    return (
      <article className="grid min-h-[420px] content-center gap-5 rounded-lg border bg-background p-6">
        <header className="flex items-center gap-3 border-b pb-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate font-semibold">{document.title}</h4>
            <p className="text-sm text-muted-foreground">
              Vista previa del documento
            </p>
          </div>
        </header>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Trabajador</dt>
            <dd className="font-medium">{document.workerName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Categoría</dt>
            <dd className="font-medium">{document.section}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha del curso</dt>
            <dd className="font-medium">{document.trainingDateLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vencimiento</dt>
            <dd className="font-medium">{document.expirationDateLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Observaciones</dt>
            <dd className="font-medium">{document.remarks}</dd>
          </div>
        </dl>
        <div className="flex justify-center">
          <DocumentStatusBadge status={document.status} />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Abre el PDF para consultar su contenido completo.
        </p>
        <a
          href={document.documentPath}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ExternalLink className="size-4" />
          Abrir PDF
        </a>
      </article>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <iframe
        src={document.documentPath}
        title={document.title}
        className="h-[680px] w-full bg-background"
      />
    </div>
  )
}

export function WorkerDocumentDetailPanel({
  document,
  onBack,
  onEditDocument,
  onDeleteDocument,
}: WorkerDocumentDetailPanelProps) {
  if (!document) return null

  const info = buildWorkerDocumentInfo(document)
  const canOpen = Boolean(document.documentPath)

  return (
    <section className="grid gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<button type="button" onClick={onBack} />}>
              Documentos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<button type="button" onClick={onBack} />}>
              {document.section}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{document.documentName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="truncate text-base font-semibold">
            {document.documentName}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!canOpen}
              onClick={() => {
                if (document.documentPath) {
                  window.open(
                    document.documentPath,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              }}
            >
              <ExternalLink />
              Abrir en nueva ventana
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
        </CardHeader>

        <CardContent className="grid gap-4 p-4">
          <section>
            <h3 className="border-b pb-2 text-sm font-semibold">
              Información del documento
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {info.map((item, index) => {
                const Icon = infoIcons[index] ?? Download

                return (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-start gap-3 text-sm"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <dt className="text-muted-foreground">{item.label}</dt>
                      <dd className="font-semibold break-words">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          </section>

          <section>
            <h3 className="border-t pt-2 text-sm font-semibold">
              Vista previa del documento
            </h3>
          </section>
          <DocumentPreview document={document} />
        </CardContent>
      </Card>
    </section>
  )
}
