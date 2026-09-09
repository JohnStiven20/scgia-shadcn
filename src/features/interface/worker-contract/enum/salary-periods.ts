export const salaryPeriods = [
  { label: "Mensual", value: "month" },
  { label: "Semanal", value: "week" },
  { label: "Diario", value: "day" },
  { label: "Anual", value: "year" },
] as const

export type SalaryPeriod = (typeof salaryPeriods)[number]["value"]
