export type WorkerContract = {
  id: number
  workerId: number
  workerName: string
  reference?: string | null
  employeeType?: string | null
  startDate: string
  endDate?: string | null
  weeklyHours: number
  salaryType: string
  salaryAmount: number
  salaryPeriod: string
  employerCost?: number | null
  salaryCategoryId?: number | null
  salaryCategoryName?: string | null
  createdDate: string
  updatedDate: string
}
