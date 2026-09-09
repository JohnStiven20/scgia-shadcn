import type { CurriculumSection } from "../type/worker-document.interface"

export type WorkerTrainingDocumentRequest = {
  workerId: number
  trainingTitle: string
  trainingDate: string
  expirationDate?: string | null
  curriculumSection?: CurriculumSection | null
  remarks?: string | null
}