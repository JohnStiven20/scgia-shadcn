export type WorkerSystemAccount = {
  id: number
  username: string
  email?: string | null
  role?: string | null
  status?: "Activa" | "Inactiva" | null
}

export type WorkerAccountOption = {
  label: string
  value: number
  account: WorkerSystemAccount
}
