import { format } from "date-fns"
import { X } from "lucide-react"

import { DatePicker, OptionsSelect } from "@/components/general"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useCreateWorkerContractMutation,
  useUpdateWorkerContractMutation,
} from "@/features/employees/worker/api/workerContractApi"
import {
  salaryTypes,
  type SalaryType,
} from "@/features/interface/worker-contract/enum/salary-types"
import {
  salaryPeriods,
  type SalaryPeriod,
} from "@/features/interface/worker-contract/enum/salary-periods"
import type { CreateWorkerContractRequest } from "@/features/interface/worker-contract/request/create-worker-contract-request"
import type { UpdateWorkerContractRequest } from "@/features/interface/worker-contract/request/update-worker-contract-request"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"
import { useGlobalError } from "@/hooks"
import { useEffect, useState } from "react"

type CreateWorkerContractDialogProps = {
  open: boolean
  workerId: number
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
  contract?: WorkerContract | null
}

const salaryCategories = [
  { id: 1, label: "Grupo 1" },
  { id: 2, label: "Grupo 2" },
  { id: 3, label: "Grupo 3" },
]

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

function parseNullableNumber(value: FormDataEntryValue | null) {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function parseDateValue(value?: string | null) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

function getSalaryTypeValue(value?: string | null): SalaryType {
  return salaryTypes.some((type) => type.value === value)
    ? (value as SalaryType)
    : "FIXED"
}

function getSalaryPeriodValue(value?: string | null): SalaryPeriod {
  return salaryPeriods.some((period) => period.value === value)
    ? (value as SalaryPeriod)
    : "month"
}

function DialogField({
  id,
  label,
  ...inputProps
}: React.ComponentProps<typeof Input> & {
  id: string
  label: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}

export function CreateWorkerContractDialog({
  open,
  workerId,
  onOpenChange,
  onCreated,
  contract,
}: CreateWorkerContractDialogProps) {
  const [createWorkerContract, { isLoading }] =
    useCreateWorkerContractMutation()
  const [updateWorkerContract, { isLoading: isUpdating }] =
    useUpdateWorkerContractMutation()
  const { handleError } = useGlobalError()
  const isEditMode = Boolean(contract)
  const isSaving = isLoading || isUpdating
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    parseDateValue(contract?.startDate)
  )
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    parseDateValue(contract?.endDate)
  )
  const [salaryType, setSalaryType] = useState<SalaryType>(() =>
    getSalaryTypeValue(contract?.salaryType)
  )
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(() =>
    getSalaryPeriodValue(contract?.salaryPeriod)
  )
  const [salaryCategoryId, setSalaryCategoryId] = useState<string>(
    contract?.salaryCategoryId ? String(contract.salaryCategoryId) : ""
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setStartDate(parseDateValue(contract?.startDate))
    setEndDate(parseDateValue(contract?.endDate))
    setSalaryType(getSalaryTypeValue(contract?.salaryType))
    setSalaryPeriod(getSalaryPeriodValue(contract?.salaryPeriod))
    setSalaryCategoryId(
      contract?.salaryCategoryId ? String(contract.salaryCategoryId) : ""
    )
    setErrorMessage(null)
  }, [contract, open])

  function resetFormState() {
    setStartDate(undefined)
    setEndDate(undefined)
    setSalaryType("FIXED")
    setSalaryPeriod("month")
    setSalaryCategoryId("")
    setErrorMessage(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetFormState()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    const form = event.currentTarget

    if (!startDate || !endDate) {
      setErrorMessage("Selecciona la fecha de inicio y la fecha de fin.")

      return
    }

    const formData = new FormData(form)
    const request: CreateWorkerContractRequest = {
      workerId,
      reference: String(formData.get("reference") || "").trim() || null,
      employeeType: String(formData.get("employeeType") || "").trim() || null,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      weeklyHours: parseNumber(formData.get("weeklyHours"), 40),
      salaryType,
      salaryAmount: parseNumber(formData.get("salaryAmount")),
      salaryPeriod,
      employerCost: parseNullableNumber(formData.get("employerCost")),
      salaryCategoryId: salaryCategoryId ? Number(salaryCategoryId) : null,
    }

    try {
      if (contract) {
        const updateRequest: UpdateWorkerContractRequest = {
          ...request,
          employeeType: request.employeeType || "",
        }

        await updateWorkerContract({
          id: contract.id,
          request: updateRequest,
        }).unwrap()
      } else {
        await createWorkerContract({ request }).unwrap()
      }
      form.reset()
      resetFormState()
      onCreated?.()
      onOpenChange(false)
    } catch (error) {
      handleError(
        error,
        isEditMode
          ? "No se ha podido actualizar el contrato."
          : "No se ha podido crear el contrato."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-x-auto! top-1/2! right-auto! left-1/2! h-auto max-h-[calc(100dvh-4rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border shadow-2xl"
      >
        <form
          key={contract?.id ?? "create-contract"}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="border-b px-6 py-5 pr-16">
            <DialogTitle className="text-2xl font-semibold">
              {isEditMode ? "Editar contrato" : "Nuevo contrato"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEditMode
                ? "Modifica la informacion del contrato programado."
                : "Completa la informacion del contrato para este trabajador."}
            </DialogDescription>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="absolute top-5 right-5"
                />
              }
            >
              <X />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </DialogHeader>

          <div className="grid min-h-0 gap-x-6 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
            <DialogField
              id="contract-reference"
              name="reference"
              label="Referencia"
              placeholder="Ej. CTR-2026-0013"
              defaultValue={contract?.reference ?? ""}
            />
            <DialogField
              id="contract-employee-type"
              name="employeeType"
              label="Tipo de empleado"
              placeholder="Introduce el tipo de empleado"
              defaultValue={contract?.employeeType ?? ""}
            />
            <DatePicker
              id="contract-start-date"
              label="Fecha de inicio"
              value={startDate}
              onChange={setStartDate}
              placeholder="DD/MM/YYYY"
            />
            <DatePicker
              id="contract-end-date"
              label="Fecha de fin"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              placeholder="DD/MM/YYYY"
            />
            <DialogField
              id="contract-weekly-hours"
              name="weeklyHours"
              type="number"
              min={0}
              step="0.5"
              label="Horas semanales"
              defaultValue={contract?.weeklyHours ?? 40}
              required
            />
            <OptionsSelect
              id="contract-salary-type"
              name="salaryType"
              label="Tipo de salario"
              options={salaryTypes}
              value={salaryType}
              onChange={setSalaryType}
            />
            <OptionsSelect
              id="contract-salary-period"
              name="salaryPeriod"
              label="Periodo salarial"
              options={salaryPeriods}
              value={salaryPeriod}
              onChange={setSalaryPeriod}
            />
            <DialogField
              id="contract-salary-amount"
              name="salaryAmount"
              type="number"
              min={0}
              step="0.01"
              label="Salario"
              defaultValue={contract?.salaryAmount ?? 0}
              required
            />
            <DialogField
              id="contract-employer-cost"
              name="employerCost"
              type="number"
              min={0}
              step="0.01"
              label="Coste de empresa"
              defaultValue={contract?.employerCost ?? 0}
            />

            <div className="grid gap-1.5">
              <Label htmlFor="contract-salary-category">
                Categoria salarial
              </Label>
              <Select
                name="salaryCategoryId"
                value={salaryCategoryId}
                onValueChange={(value) => setSalaryCategoryId(value ?? "")}
              >
                <SelectTrigger id="contract-salary-category" className="w-full">
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {salaryCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {errorMessage ? (
            <p className="border-t px-6 pt-4 text-xs text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <DialogFooter className="mt-0 flex-row justify-end border-t px-6 py-4">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSaving} />
              }
            >
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? isEditMode
                  ? "Guardando..."
                  : "Creando..."
                : isEditMode
                  ? "Guardar cambios"
                  : "Crear contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
