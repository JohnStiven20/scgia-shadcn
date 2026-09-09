
export type UpdateWorkerContractRequest = {
  workerId: number
  reference?: string | null
  employeeType: string
  startDate: string
  endDate?: string | null
  weeklyHours: number
  salaryType: string
  salaryAmount: number
  salaryPeriod: string
  employerCost?: number | null
  salaryCategoryId?: number | null
}