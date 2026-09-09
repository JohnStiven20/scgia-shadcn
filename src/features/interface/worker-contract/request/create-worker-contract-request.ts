export type CreateWorkerContractRequest = {
  workerId: number
  reference?: string | null
  employeeType?: string | null
  startDate: string
  endDate: string
  weeklyHours: number
  salaryType: string
  salaryAmount: number
  salaryPeriod: string
  employerCost?: number | null
  salaryCategoryId?: number | null
}