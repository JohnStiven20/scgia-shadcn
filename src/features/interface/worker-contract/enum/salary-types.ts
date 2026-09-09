export const salaryTypes = [
  { label: "Fijo", value: "FIXED" },
  { label: "Por hora", value: "HOURLY" },
  { label: "Variable", value: "VARIABLE" },
  { label: "Mixto", value: "MIXED" },
] as const

export type SalaryType = (typeof salaryTypes)[number]["value"]
