import { useCallback, useEffect, useMemo, useState } from "react"
import type { MutableRefObject } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { WorkerTypeInterface } from "@/features/interface/worker-type/type/worker-type-interface"

const EMPTY_WORKER_TYPE: WorkerTypeInterface = {
  id: 0,
  name: "",
  description: "",
  active: true,
}

type WorkerTypeDialogFormRef = {
  submit: () => void
  reset: (values?: WorkerTypeInterface) => void
}

type CreateWorkerTypeDialogProps = {
  open: boolean
  title?: string
  submitLabel?: string
  isSubmitting?: boolean
  formRef?: MutableRefObject<WorkerTypeDialogFormRef | null>
  record?: unknown
  defaultValues?: WorkerTypeInterface
  onClose: () => void
  onSubmit: (values: WorkerTypeInterface) => Promise<void> | void
}

function normalizeValues(values?: WorkerTypeInterface): WorkerTypeInterface {
  return {
    ...EMPTY_WORKER_TYPE,
    ...values,
    description: values?.description ?? "",
  }
}

export function CreateWorkerTypeDialog({
  open,
  title = "Crear tipo de trabajador",
  submitLabel = "Crear tipo",
  isSubmitting = false,
  formRef,
  defaultValues,
  onClose,
  onSubmit,
}: CreateWorkerTypeDialogProps) {
  const initialValues = useMemo(
    () => normalizeValues(defaultValues),
    [defaultValues]
  )
  const formKey = `${open ? "open" : "closed"}-${initialValues.id}-${initialValues.name}-${initialValues.description ?? ""}-${initialValues.active}`

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-md">
        <WorkerTypeDialogForm
          key={formKey}
          title={title}
          submitLabel={submitLabel}
          isSubmitting={isSubmitting}
          formRef={formRef}
          initialValues={initialValues}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type WorkerTypeDialogFormProps = {
  title: string
  submitLabel: string
  isSubmitting: boolean
  formRef?: MutableRefObject<WorkerTypeDialogFormRef | null>
  initialValues: WorkerTypeInterface
  onClose: () => void
  onSubmit: (values: WorkerTypeInterface) => Promise<void> | void
}

function WorkerTypeDialogForm({
  title,
  submitLabel,
  isSubmitting,
  formRef,
  initialValues,
  onClose,
  onSubmit,
}: WorkerTypeDialogFormProps) {
  const [values, setValues] = useState(initialValues)
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    const name = values.name.trim()
    const description = values.description?.trim() ?? ""

    if (!name) {
      setNameError("El nombre es obligatorio.")
      return
    }

    setNameError(null)
    await onSubmit({
      ...values,
      name,
      description: description || null,
    })
  }, [onSubmit, values])

  useEffect(() => {
    if (!formRef) return

    formRef.current = {
      submit: () => {
        void handleSubmit()
      },
      reset: (nextValues?: WorkerTypeInterface) => {
        setValues(normalizeValues(nextValues ?? initialValues))
        setNameError(null)
      },
    }

    return () => {
      formRef.current = null
    }
  }, [formRef, handleSubmit, initialValues])

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Define el nombre, la descripcion y el estado del tipo de trabajador.
        </DialogDescription>
      </DialogHeader>

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="worker-type-name">Nombre</Label>
          <Input
            id="worker-type-name"
            value={values.name}
            disabled={isSubmitting}
            aria-invalid={Boolean(nameError)}
            placeholder="Ej. Tecnico instalador"
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }))
              if (nameError) {
                setNameError(null)
              }
            }}
          />
          {nameError ? (
            <p className="text-xs/relaxed text-destructive">{nameError}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="worker-type-description">Descripcion</Label>
          <Textarea
            id="worker-type-description"
            value={values.description ?? ""}
            disabled={isSubmitting}
            placeholder="Notas internas o detalle del tipo"
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="worker-type-active">Activo</Label>
            <p className="text-xs/relaxed text-muted-foreground">
              Los tipos inactivos no deberian usarse en nuevas altas.
            </p>
          </div>
          <Switch
            id="worker-type-active"
            checked={values.active}
            disabled={isSubmitting}
            onCheckedChange={(checked) => {
              setValues((current) => ({
                ...current,
                active: checked,
              }))
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
