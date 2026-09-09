import { formatDate } from "@/utils/dateUtils"
import type { WorkerTrainingDocument } from "@/features/interface/worker-document/type/worker-document.interface"
import type { WorkerTrainingDocumentViewModel } from "../interface/types/workerPage"
import {
  formatFileSize,
  buildDocumentUrl,
  getDaysToExpire,
  getDocumentSectionLabel,
  getWorkerDocumentStatus,
  normalizeDocumentSection,
} from "../utils/documentUtils"

export function mapWorkerTrainingDocumentToViewModel(
  document: WorkerTrainingDocument
): WorkerTrainingDocumentViewModel {
  const daysToExpire = getDaysToExpire(document.expirationDate)
  const status = getWorkerDocumentStatus(document)
  const fileName =
    document.fileName ||
    document.documentName ||
    `${document.trainingTitle || "Documento"}.pdf`

  return {
    id: document.id,
    title: document.trainingTitle || fileName,
    workerName: document.workerName || `Trabajador ${document.workerId}`,
    section: getDocumentSectionLabel(document.curriculumSection),
    sectionKey: normalizeDocumentSection(document.curriculumSection),
    trainingDate: document.trainingDate,
    trainingDateLabel: formatDate(document.trainingDate),
    expirationDate: document.expirationDate ?? null,
    expirationDateLabel: document.expirationDate
      ? formatDate(document.expirationDate)
      : "Sin vencimiento",
    documentName: fileName,
    remarks: document.remarks || "Sin observaciones",
    active: document.active ?? true,
    status,
    statusCaption: getStatusCaption(status, daysToExpire),
    daysToExpire,
    documentPath: buildDocumentUrl(document.documentPath),
    mimeType: document.mimeType || document.fileType || null,
    fileSize: document.fileSize ?? null,
    createdDateLabel: formatDate(document.createdDate),
    updatedDateLabel: formatDate(document.updatedDate),
  }
}

function getStatusCaption(
  status: WorkerTrainingDocumentViewModel["status"],
  daysToExpire: number | null
) {
  if (status === "Sin vencimiento") {
    return "No caduca"
  }

  if (daysToExpire === null) {
    return "Sin fecha"
  }

  if (daysToExpire < 0) {
    return `Caducado hace ${Math.abs(daysToExpire)} dias`
  }

  if (daysToExpire === 0) {
    return "Caduca hoy"
  }

  return `${daysToExpire} dias restantes`
}

export function buildWorkerDocumentInfo(
  document: WorkerTrainingDocumentViewModel
) {
  return [
    { label: "Trabajador", value: document.workerName },
    { label: "Categoria", value: document.section },
    { label: "Fecha curso", value: document.trainingDateLabel },
    { label: "Vencimiento", value: document.expirationDateLabel },
    { label: "Dias restantes", value: document.statusCaption },
    { label: "Archivo", value: formatFileSize(document.fileSize) },
  ]
}
