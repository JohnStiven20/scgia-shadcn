import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { DatePicker } from "@/components/general/date-picker"
import { OptionsSelect } from "@/components/general/options-select"
import { FileFieldRHF } from "@/components/form/FileFieldRHF"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CreateVehicleDocumentRequest } from "@/features/interface/vehicle/request/create-vehicle-document-request"
import type { UpdateVehicleDocumentRequest } from "@/features/interface/vehicle/request/update-vehicle-document-request"
import type { VehicleDocumentType } from "@/features/interface/vehicle/enum/vehicle-document-type"

import {
  VEHICLE_DOCUMENT_TYPE_META,
  VEHICLE_DOCUMENT_TYPE_OPTIONS,
} from "./constants"
import type { VehicleDocumentListItemView } from "./types"
import { toDate, toDateInputValue } from "./utils"

type VehicleDocumentFormValues = {
  documentType: VehicleDocumentType
  title: string
  issueDate?: Date
  expirationDate?: Date
  active: "true" | "false"
  notes: string
  file0: File | null
  file1: File | null
  file2: File | null
}

type VehicleDocumentDialogProps = {
  open: boolean
  vehicleId: number
  document: VehicleDocumentListItemView | null
  isSubmitting?: boolean
  onClose: () => void
  onCreate: (request: CreateVehicleDocumentRequest) => Promise<void>
  onUpdate: (id: number, request: UpdateVehicleDocumentRequest) => Promise<void>
}

export function VehicleDocumentDialog({
  open,
  vehicleId,
  document,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: VehicleDocumentDialogProps) {
  const [storedFileIdsToDelete, setStoredFileIdsToDelete] = useState<number[]>(
    []
  )
  const isEditing = Boolean(document)
  const form = useForm<VehicleDocumentFormValues>({
    defaultValues: buildDefaultValues(document),
  })

  const selectedDocumentType = form.watch("documentType")
  const requiresExpirationDate =
    VEHICLE_DOCUMENT_TYPE_META[selectedDocumentType].requiresExpirationDate
  const remainingFiles = useMemo(
    () =>
      document?.storedFiles.filter(
        (file) => !storedFileIdsToDelete.includes(file.id)
      ) ?? [],
    [document?.storedFiles, storedFileIdsToDelete]
  )

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(document))
      setStoredFileIdsToDelete([])
    }
  }, [document, form, open])

  async function handleSubmit(values: VehicleDocumentFormValues) {
    const files = [values.file0, values.file1, values.file2].filter(
      (file): file is File => file instanceof File
    )

    if (!isEditing && files.length === 0) {
      form.setError("file0", { message: "Selecciona al menos un archivo." })
      return
    }

    if (requiresExpirationDate && !values.expirationDate) {
      form.setError("expirationDate", {
        message: "La fecha de caducidad es obligatoria para este tipo.",
      })
      return
    }

    const payload = {
      vehicleId,
      documentType: values.documentType,
      title: values.title.trim(),
      issueDate: toDateInputValue(values.issueDate),
      expirationDate: toDateInputValue(values.expirationDate),
      active: values.active === "true",
      notes: values.notes.trim() || null,
      files,
    }

    if (document) {
      await onUpdate(document.id, {
        ...payload,
        storedFileIdsToDelete,
      })
    } else {
      await onCreate(payload)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>
            {isEditing ? "Editar documento" : "Subir documento"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="vehicle-document-form"
          className="grid gap-4 px-5 py-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Controller
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <OptionsSelect
                id="documentType"
                label="Tipo de documento"
                options={VEHICLE_DOCUMENT_TYPE_OPTIONS.filter(
                  (option) => option.value !== "ALL"
                )}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Field
            data-invalid={Boolean(form.formState.errors.title) || undefined}
          >
            <FieldLabel htmlFor="title">Titulo</FieldLabel>
            <Input
              id="title"
              aria-invalid={Boolean(form.formState.errors.title)}
              {...form.register("title", {
                required: "El titulo es obligatorio.",
              })}
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <DatePicker
                  id="issueDate"
                  label="Fecha de emision"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="expirationDate"
              render={({ field, fieldState }) => (
                <div className="grid gap-1.5">
                  <DatePicker
                    id="expirationDate"
                    label="Fecha de caducidad"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <OptionsSelect
                id="active"
                label="Estado"
                options={[
                  { value: "true", label: "Activo" },
                  { value: "false", label: "Inactivo" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Field>
            <FieldLabel htmlFor="notes">Notas</FieldLabel>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </Field>

          {isEditing && document?.storedFiles.length ? (
            <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">Archivos actuales</p>
              {document.storedFiles.map((file) => {
                const marked = storedFileIdsToDelete.includes(file.id)

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <span
                      className={
                        marked ? "text-muted-foreground line-through" : ""
                      }
                    >
                      {file.originalFileName}
                    </span>
                    <Button
                      type="button"
                      variant={marked ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => {
                        setStoredFileIdsToDelete((current) =>
                          marked
                            ? current.filter((id) => id !== file.id)
                            : [...current, file.id]
                        )
                      }}
                    >
                      {marked ? "Restaurar" : "Quitar"}
                    </Button>
                  </div>
                )
              })}
              {!remainingFiles.length ? (
                <p className="text-xs text-amber-700">
                  Si quitas todos los actuales, adjunta al menos uno nuevo.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <FileFieldRHF
              name="file0"
              label="Archivo 1"
              control={form.control}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FileFieldRHF
              name="file1"
              label="Archivo 2"
              control={form.control}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FileFieldRHF
              name="file2"
              label="Archivo 3"
              control={form.control}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </form>

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="vehicle-document-form"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Guardando..."
                : "Subiendo..."
              : isEditing
                ? "Guardar cambios"
                : "Subir documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function buildDefaultValues(
  document: VehicleDocumentListItemView | null
): VehicleDocumentFormValues {
  return {
    documentType: document?.documentType ?? "REGISTRATION_PERMIT",
    title: document?.title ?? "",
    issueDate: toDate(document?.issueDate),
    expirationDate: toDate(document?.expirationDate),
    active: document?.active === false ? "false" : "true",
    notes: document?.notes ?? "",
    file0: null,
    file1: null,
    file2: null,
  }
}
