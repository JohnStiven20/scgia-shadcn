import { useEffect, useState, type FormEvent } from "react"
import { Search, RotateCcw } from "lucide-react"

import type { AccountLookupResponse } from "@/api/commonApi"
import { DatePicker } from "@/components/general"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WorkOrderFilterValues } from "../hooks/useWorkOrdersPage"

type WorkOrdersFiltersProps = {
  values: WorkOrderFilterValues
  workers: AccountLookupResponse[]
  isLoadingWorkers: boolean
  onApply: (filters: WorkOrderFilterValues) => void
  onReset: () => WorkOrderFilterValues
}

export function WorkOrdersFilters({
  values,
  workers,
  isLoadingWorkers,
  onApply,
  onReset,
}: WorkOrdersFiltersProps) {
  const [draft, setDraft] = useState(values)

  useEffect(() => {
    setDraft(values)
  }, [values])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(draft)
  }

  function handleReset() {
    setDraft(onReset())
  }

  return (
    <form
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1fr)_minmax(10rem,0.35fr)_minmax(12rem,0.45fr)_minmax(12rem,0.45fr)_minmax(12rem,0.45fr)_auto]"
      onSubmit={handleSubmit}
    >
      <Field>
        <FieldLabel htmlFor="work-order-search">Buscar</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            id="work-order-search"
            value={draft.search}
            placeholder="Buscar por n orden, n fijo, direccion..."
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </InputGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="work-order-status">Estado</FieldLabel>
        <Select
          value={draft.status}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              status: value as WorkOrderFilterValues["status"],
            }))
          }
        >
          <SelectTrigger id="work-order-status" className="w-full">
            <SelectValue>
              {draft.status === "ALL"
                ? "Todos"
                : draft.status === "PROGRESSING"
                  ? "En progreso"
                  : draft.status === "BLOCKED"
                    ? "Bloqueada"
                    : "Finalizada"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PROGRESSING">En progreso</SelectItem>
            <SelectItem value="BLOCKED">Bloqueada</SelectItem>
            <SelectItem value="FINISHED">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="work-order-worker">Trabajador</FieldLabel>
        <Select
          value={draft.workerId === null ? "ALL" : String(draft.workerId)}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              workerId: value === "ALL" ? null : Number(value),
            }))
          }
        >
          <SelectTrigger
            id="work-order-worker"
            className="w-full"
            disabled={isLoadingWorkers}
          >
            <SelectValue>
              {draft.workerId === null
                ? "Todos"
                : workers.find((worker) => worker.id === draft.workerId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={String(worker.id)}>
                {worker.name} {worker.surname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <DatePicker
        id="work-order-created-from"
        label="Fecha desde"
        value={draft.createdFrom}
        maxDate={draft.createdTo}
        placeholder="dd/mm/aaaa"
        onChange={(createdFrom) =>
          setDraft((current) => ({ ...current, createdFrom }))
        }
      />

      <DatePicker
        id="work-order-created-to"
        label="Fecha hasta"
        value={draft.createdTo}
        minDate={draft.createdFrom}
        placeholder="dd/mm/aaaa"
        onChange={(createdTo) =>
          setDraft((current) => ({ ...current, createdTo }))
        }
      />

      <div className="flex items-end gap-2">
        <Button type="submit">Aplicar</Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw />
          Limpiar
        </Button>
      </div>
    </form>
  )
}
