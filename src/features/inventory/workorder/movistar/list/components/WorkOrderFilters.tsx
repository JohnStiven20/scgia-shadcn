import { useEffect, useState, type FormEvent } from "react"
import { RotateCcw, Search, UserRound } from "lucide-react"

import type { AccountLookupResponse } from "@/api/commonApi"
import type { MovistarWorkOrderTaskTypeResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderTaskTypeResponse"
import { DatePicker } from "@/components/general"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkOrderListFilters } from "../hooks/useWorkOrderFilters"

type WorkOrderFiltersProps = {
  values: WorkOrderListFilters
  workers: AccountLookupResponse[]
  taskTypes: MovistarWorkOrderTaskTypeResponse[]
  isLoadingWorkers: boolean
  isLoadingTaskTypes: boolean
  onApply: (values: WorkOrderListFilters) => void
  onReset: () => WorkOrderListFilters
}

function toDate(value: string) {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(value: Date | undefined) {
  if (!value) return ""
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function WorkOrderFilters({
  values,
  workers,
  taskTypes,
  isLoadingWorkers,
  isLoadingTaskTypes,
  onApply,
  onReset,
}: WorkOrderFiltersProps) {
  const [draft, setDraft] = useState(values)

  // Keep the local form in sync after applying or resetting filters.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(values), [values])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(draft)
  }

  function handleReset() {
    setDraft(onReset())
  }

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
      <Field className="min-w-[15rem] flex-[1.25_1_15rem]">
        <FieldLabel htmlFor="movistar-work-order-search">Buscar</FieldLabel>
        <InputGroup>
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput
            id="movistar-work-order-search"
            value={draft.search}
            placeholder="Número de orden o teléfono..."
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
          />
        </InputGroup>
      </Field>
      <Field className="min-w-[12rem] flex-[1_1_12rem]">
        <FieldLabel htmlFor="movistar-work-order-phone">Teléfono</FieldLabel>
        <InputGroup>
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput
            id="movistar-work-order-phone"
            value={draft.phone}
            inputMode="tel"
            placeholder="Buscar por teléfono..."
            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
          />
        </InputGroup>
      </Field>
      <Field className="min-w-[13rem] flex-[1_1_13rem]">
        <FieldLabel htmlFor="movistar-work-order-worker">Trabajador</FieldLabel>
        <Select
          value={draft.workerId == null ? "ALL" : String(draft.workerId)}
          onValueChange={(value) => setDraft((current) => ({ ...current, workerId: value === "ALL" ? null : Number(value) }))}
        >
          <SelectTrigger id="movistar-work-order-worker" disabled={isLoadingWorkers}>
            <UserRound />
            <SelectValue>{draft.workerId == null ? "Todos los trabajadores" : workers.find((worker) => worker.id === draft.workerId)?.name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los trabajadores</SelectItem>
            {workers.map((worker) => <SelectItem key={worker.id} value={String(worker.id)}>{worker.name} {worker.surname}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field className="min-w-[10rem] flex-[0.8_1_10rem]">
        <FieldLabel htmlFor="movistar-work-order-status">Estado</FieldLabel>
        <Select value={draft.status} onValueChange={(value) => setDraft((current) => ({ ...current, status: value as WorkOrderListFilters["status"] }))}>
          <SelectTrigger id="movistar-work-order-status"><SelectValue>{draft.status === "ALL" ? "Todos los estados" : draft.status === "PROGRESSING" ? "En proceso" : draft.status === "FINISHED" ? "Finalizada" : draft.status === "BLOCKED" ? "Bloqueada" : "Cancelada"}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="PROGRESSING">En progreso</SelectItem>
            <SelectItem value="FINISHED">Finalizada</SelectItem>
            <SelectItem value="BLOCKED">Bloqueada</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field className="min-w-[13rem] flex-[1_1_13rem]">
        <FieldLabel htmlFor="movistar-work-order-task-type">Tipo de tarea</FieldLabel>
        <Select
          value={draft.taskTypeId == null ? "ALL" : String(draft.taskTypeId)}
          onValueChange={(value) => setDraft((current) => ({ ...current, taskTypeId: value === "ALL" ? null : Number(value) }))}
        >
          <SelectTrigger id="movistar-work-order-task-type" disabled={isLoadingTaskTypes}>
            <SelectValue>{draft.taskTypeId == null ? "Todas las tareas" : taskTypes.find((task) => task.id === draft.taskTypeId)?.name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las tareas</SelectItem>
            {taskTypes.map((task) => <SelectItem key={task.id} value={String(task.id)}>{task.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <DatePicker className="min-w-[10rem] flex-[0.8_1_10rem]" id="movistar-work-order-start" label="Creado desde" value={toDate(draft.startDate)} maxDate={toDate(draft.endDate)} onChange={(date) => setDraft((current) => ({ ...current, startDate: toDateValue(date) }))} />
      <DatePicker className="min-w-[10rem] flex-[0.8_1_10rem]" id="movistar-work-order-end" label="Creado hasta" value={toDate(draft.endDate)} minDate={toDate(draft.startDate)} onChange={(date) => setDraft((current) => ({ ...current, endDate: toDateValue(date) }))} />
      <div className="flex min-w-fit flex-wrap items-end gap-2">
        <Button type="submit">Aplicar filtros</Button>
        <Button type="button" variant="outline" onClick={handleReset}><RotateCcw /> Limpiar</Button>
      </div>
    </form>
  )
}
