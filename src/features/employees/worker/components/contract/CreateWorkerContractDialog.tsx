import * as React from "react"

import { X } from "lucide-react"

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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCreateWorkerContractMutation } from "@/features/employees/worker/api/workerContractApi"
import type { CreateWorkerContractRequest } from "@/features/interface/worker-contract/request/create-worker-contract-request"

type CreateWorkerContractDialogProps = {
  open: boolean
  workerId: number
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
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
}: CreateWorkerContractDialogProps) {
  const [createWorkerContract, { isLoading }] =
    useCreateWorkerContractMutation()
  const [salaryCategoryId, setSalaryCategoryId] = React.useState<string>("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const request: CreateWorkerContractRequest = {
      workerId,
      reference: String(formData.get("reference") || "").trim() || null,
      employeeType: String(formData.get("employeeType") || "").trim() || null,
      startDate: String(formData.get("startDate") || ""),
      endDate: String(formData.get("endDate") || ""),
      weeklyHours: parseNumber(formData.get("weeklyHours"), 40),
      salaryType: String(formData.get("salaryType") || "").trim(),
      salaryAmount: parseNumber(formData.get("salaryAmount")),
      salaryPeriod: String(formData.get("salaryPeriod") || "").trim(),
      employerCost: parseNullableNumber(formData.get("employerCost")),
      salaryCategoryId: salaryCategoryId ? Number(salaryCategoryId) : null,
    }

    try {
      await createWorkerContract({ request }).unwrap()
      event.currentTarget.reset()
      setSalaryCategoryId("")
      onCreated?.()
      onOpenChange(false)
    } catch {
      setErrorMessage("No se ha podido crear el contrato. Revisa los datos.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="inset-x-auto! top-1/2! right-auto! left-1/2! h-auto max-h-[calc(100dvh-4rem)] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-6 py-5 pr-16">
            <SheetTitle className="text-2xl font-semibold">
              Nuevo contrato
            </SheetTitle>
            <SheetDescription className="text-sm">
              Completa la informacion del contrato para este trabajador.
            </SheetDescription>
            <SheetClose
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
            </SheetClose>
          </SheetHeader>

          <div className="grid min-h-0 gap-x-6 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
            <DialogField
            
              id="contract-reference"
              name="reference"
              label="Referencia"
              placeholder="Ej. CTR-2026-0013"
            />
            <DialogField
              id="contract-employee-type"
              name="employeeType"
              label="Tipo de empleado"
              placeholder="Introduce el tipo de empleado"
            />
            <DialogField
              id="contract-start-date"
              name="startDate"
              type="date"
              label="Fecha de inicio"
              required
            />
            <DialogField
              id="contract-end-date"
              name="endDate"
              type="date"
              label="Fecha de fin"
              required
            />
            <DialogField
              id="contract-weekly-hours"
              name="weeklyHours"
              type="number"
              min={0}
              step="0.5"
              label="Horas semanales"
              defaultValue={40}
              required
            />
            <DialogField
              id="contract-salary-type"
              name="salaryType"
              label="Tipo de salario"
              placeholder="Mensual"
              defaultValue="Mensual"
              required
            />
            <DialogField
              id="contract-salary-period"
              name="salaryPeriod"
              label="Periodo salarial"
              placeholder="month"
              defaultValue="month"
              required
            />
            <DialogField
              id="contract-salary-amount"
              name="salaryAmount"
              type="number"
              min={0}
              step="0.01"
              label="Salario"
              defaultValue={0}
              required
            />
            <DialogField
              id="contract-employer-cost"
              name="employerCost"
              type="number"
              min={0}
              step="0.01"
              label="Coste de empresa"
              defaultValue={0}
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

          <SheetFooter className="mt-0 flex-row justify-end border-t px-6 py-4">
            <SheetClose
              render={
                <Button type="button" variant="outline" disabled={isLoading} />
              }
            >
              Cancelar
            </SheetClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear contrato"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
