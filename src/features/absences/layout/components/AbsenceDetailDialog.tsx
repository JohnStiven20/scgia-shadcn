import {
  CalendarDays,
  Check,
  Clock,
  FileText,
  MessageSquare,
  UserRound,
  X,
} from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { AbsenceStatusChip } from "./AbsenceStatusChip"
import type { AbsenceDetailDialogProps } from "./absencesPage.types"
import { formatDate, formatDateTime } from "./absencesPage.utils"

export function AbsenceDetailDialog({
  canApprove,
  canReject,
  isResolutionLoading,
  onApprove,
  onClose,
  onReject,
  onResolutionCommentChange,
  open,
  resolutionComment,
  selectedAbsence,
  selectedRequest,
}: AbsenceDetailDialogProps) {
  const showResolutionActions =
    selectedAbsence?.status === "PENDING" && (canApprove || canReject)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isResolutionLoading) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[min(92svh,900px)] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle>Detalle de ausencia</DialogTitle>
          <DialogDescription>
            Solicitud #{selectedRequest?.id ?? selectedAbsence?.id ?? "-"}
          </DialogDescription>
        </DialogHeader>

        {selectedAbsence ? (
          <div className="grid gap-5 px-6 py-5">
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-950">
                    {selectedAbsence.employee}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedAbsence.type}
                  </p>
                </div>
                <AbsenceStatusChip status={selectedAbsence.status} />
              </div>
              {selectedAbsence.description ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {selectedAbsence.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={<CalendarDays />}
                label="Periodo"
                value={`${formatDate(selectedAbsence.startDate)} - ${formatDate(
                  selectedAbsence.endDate
                )}`}
              />
              <DetailItem
                icon={<Clock />}
                label="Duracion"
                value={`${selectedAbsence.days} ${
                  selectedAbsence.days === 1 ? "dia" : "dias"
                }`}
              />
              <DetailItem
                icon={<UserRound />}
                label="Solicitada"
                value={formatDateTime(selectedAbsence.requestedAt)}
              />
              <DetailItem
                icon={<MessageSquare />}
                label="Observacion"
                value={selectedAbsence.observation ?? "Sin observacion"}
              />
            </div>

            <section className="grid gap-3">
              <h3 className="text-sm font-semibold text-slate-950">
                Documentos adjuntos
              </h3>
              {selectedAbsence.documents.length ? (
                <div className="grid gap-2">
                  {selectedAbsence.documents.map((document) => (
                    <a
                      key={document.id}
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-slate-50"
                    >
                      <FileText className="size-5 shrink-0 text-slate-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {document.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {document.mimeType}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No hay documentos adjuntos.
                </p>
              )}
            </section>

            {selectedAbsence.reviewedAt || selectedAbsence.cancelledAt ? (
              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Resolucion
                </h3>
                <dl className="mt-3 grid gap-2 text-sm">
                  <ResolutionRow
                    label="Revisado por"
                    value={selectedAbsence.reviewedBy}
                  />
                  <ResolutionRow
                    label="Fecha revision"
                    value={formatDateTime(selectedAbsence.reviewedAt)}
                  />
                  <ResolutionRow
                    label="Comentario"
                    value={selectedAbsence.reviewComment}
                  />
                  <ResolutionRow
                    label="Cancelado por"
                    value={selectedAbsence.cancelledBy}
                  />
                  <ResolutionRow
                    label="Fecha cancelacion"
                    value={formatDateTime(selectedAbsence.cancelledAt)}
                  />
                  <ResolutionRow
                    label="Motivo cancelacion"
                    value={selectedAbsence.cancellationReason}
                  />
                </dl>
              </section>
            ) : null}

            {showResolutionActions ? (
              <section className="grid gap-2">
                <label
                  htmlFor="absence-resolution-comment"
                  className="text-sm font-semibold text-slate-950"
                >
                  Comentario de revision
                </label>
                <Textarea
                  id="absence-resolution-comment"
                  placeholder="Comentario opcional para la resolucion"
                  value={resolutionComment}
                  disabled={isResolutionLoading}
                  onChange={(event) =>
                    onResolutionCommentChange(event.target.value)
                  }
                />
              </section>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isResolutionLoading}
            onClick={onClose}
          >
            Cerrar
          </Button>
          {showResolutionActions && canReject ? (
            <Button
              type="button"
              variant="outline"
              disabled={isResolutionLoading}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={onReject}
            >
              <X />
              Rechazar
            </Button>
          ) : null}
          {showResolutionActions && canApprove ? (
            <Button
              type="button"
              disabled={isResolutionLoading}
              onClick={onApprove}
            >
              <Check />
              Aprobar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border p-3">
      <span className="mt-0.5 text-slate-500 [&>svg]:size-5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  )
}

function ResolutionRow({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  if (!value || value === "-") {
    return null
  }

  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-slate-950">{value}</dd>
    </div>
  )
}
