

export type WorkerTrainingDocument = {
  id: number
  workerId: number
  workerName?: string | null
  trainingTitle: string
  trainingDate: string
  expirationDate?: string | null
  curriculumSection?: CurriculumSection | null
  remarks?: string | null
  active?: boolean | null
  fileName?: string | null
  fileType?: string | null
  fileSize?: number | null
  documentName?: string | null
  documentPath?: string | null
  mimeType?: string | null
  createdDate?: string | null
  updatedDate?: string | null
}


export type CurriculumSection =
  | "FORMATION"
  | "SECURITY"
  | "OPERATION"
  | "WITHOUT_SECTION"
  | string
