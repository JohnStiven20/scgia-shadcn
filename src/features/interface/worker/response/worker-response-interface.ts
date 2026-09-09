export type { Worker } from "../type/worker.inteface"

export type WorkerLookupResponse = {
  id: number
  name: string
  surname: string
  dni?: string | null
  email?: string | null
  employeeCode?: string | null
  workerTypeName?: string | null
}
