import type { SelectOption } from "@/components/general/options-select"

export type VehicleSettingsFormState = {
  workerId: number | null
  available: boolean
}

export type WorkerOption = SelectOption<number>
