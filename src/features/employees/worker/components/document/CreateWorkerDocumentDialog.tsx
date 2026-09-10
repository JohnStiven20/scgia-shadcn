import { format } from "date-fns"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Upload } from "lucide-react"

import { FileFieldRHF, SelectFieldRHF } from "@/components/form"
import { DatePicker } from "@/components/general"
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
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateWorkerTrainingDocumentMutation,
  useUpdateWorkerTrainingDocumentMutation,
} from "@/features/employees/worker/api/workerDocumentApi"
import type {
  CurriculumSection,
  WorkerTrainingDocument,
} from "@/features/interface/worker-document/type/worker-document.interface"
import type { WorkerTrainingDocumentRequest } from "@/features/interface/worker-document/response/worker-document-request"
import { useGlobalError } from "@/hooks"
import {
  buildDocumentUrl,
  documentSectionOptions,
} from "../../utils/documentUtils"

type CreateWorkerDocumentDialogProps = {
  open: boolean
  workerId: number
  document?: WorkerTrainingDocument | null
  onCreated?: () => void
  onOpenChange: (open: boolean) => void
}

const selectableSections = documentSectionOptions.filter(
  (section) => section.key !== "ALL"
)

type WorkerDocumentFormValues = {
  trainingTitle: string
  trainingDate: Date | undefined
  expirationDate: Date | undefined
  curriculumSection: string
  file: File | null
  remarks: string
}

function toDateValue(value?: string | null) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

export function CreateWorkerDocumentDialog({
  open,
  workerId,
  document,
  onCreated,
  onOpenChange,
}: CreateWorkerDocumentDialogProps) {
  const [createWorkerDocument, { isLoading: isCreating }] =
    useCreateWorkerTrainingDocumentMutation()
  const [updateWorkerDocument, { isLoading: isUpdating }] =
    useUpdateWorkerTrainingDocumentMutation()
  const { handleError } = useGlobalError()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isEditMode = Boolean(document)
  const isSaving = isCreating || isUpdating
  const currentFileName =
    document?.fileName || document?.documentName || document?.trainingTitle
  const currentFileUrl = buildDocumentUrl(document?.documentPath)
  const form = useForm<WorkerDocumentFormValues>({
    defaultValues: {
      trainingTitle: document?.trainingTitle ?? "",
      trainingDate: toDateValue(document?.trainingDate),
      expirationDate: toDateValue(document?.expirationDate),
      curriculumSection: document?.curriculumSection || "UNASSIGNED",
      file: null,
      remarks: document?.remarks ?? "",
    },
  })
  const trainingDate = useWatch({
    control: form.control,
    name: "trainingDate",
  })
  const expirationDate = useWatch({
    control: form.control,
    name: "expirationDate",
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setErrorMessage(null)
      form.reset()
    }

    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: WorkerDocumentFormValues) {
    setErrorMessage(null)

    const trainingTitle = values.trainingTitle.trim()
    const selectedTrainingDate = values.trainingDate
    const selectedExpirationDate = values.expirationDate
    const remarks = values.remarks.trim()

    if (!trainingTitle || !selectedTrainingDate) {
      setErrorMessage("Indica el curso/documento y la fecha del curso.")

      return
    }

    if (!isEditMode && !values.file) {
      setErrorMessage("Selecciona un archivo para subir.")

      return
    }

    const request: WorkerTrainingDocumentRequest = {
      workerId,
      trainingTitle,
      trainingDate: format(selectedTrainingDate, "yyyy-MM-dd"),
      expirationDate: selectedExpirationDate
        ? format(selectedExpirationDate, "yyyy-MM-dd")
        : null,
      curriculumSection:
        values.curriculumSection === "UNASSIGNED"
          ? null
          : (values.curriculumSection as CurriculumSection),
      remarks: remarks || null,
    }

    try {
      if (document) {
        await updateWorkerDocument({
          id: document.id,
          request: {
            ...request,
            active: document.active ?? true,
          },
          file: values.file,
        }).unwrap()
      } else {
        await createWorkerDocument({
          request,
          file: values.file as File,
        }).unwrap()
      }

      form.reset()
      onCreated?.()
      handleOpenChange(false)
    } catch (error) {
      handleError(
        error,
        isEditMode
          ? "No se ha podido actualizar el documento."
          : "No se ha podido crear el documento."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isSaving} className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Editar documento" : "Subir documento"}
          </DialogTitle>
          <DialogDescription>
            Guarda cursos, certificados y documentos con vencimiento.
          </DialogDescription>
        </DialogHeader>

        <form
          id="worker-document-form"
          className="grid max-h-[calc(100svh-13rem)] gap-4 overflow-y-auto p-5"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="trainingTitle">Curso o documento</Label>
            <Input
              id="trainingTitle"
              {...form.register("trainingTitle")}
              placeholder="Prevencion de riesgos laborales"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              id="trainingDate"
              label="Fecha curso"
              value={trainingDate}
              onChange={(date) =>
                form.setValue("trainingDate", date, { shouldDirty: true })
              }
              placeholder="DD/MM/YYYY"
            />

            <DatePicker
              id="expirationDate"
              label="Vencimiento"
              value={expirationDate}
              onChange={(date) =>
                form.setValue("expirationDate", date, { shouldDirty: true })
              }
              minDate={trainingDate}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <SelectFieldRHF
            name="curriculumSection"
            label="Categoria"
            control={form.control}
            options={selectableSections.map((option) => ({
              label: option.label,
              value: option.value ?? "UNASSIGNED",
            }))}
            placeholder="Selecciona una categoria"
          />

          <FileFieldRHF
            name="file"
            label={isEditMode ? "Archivo nuevo opcional" : "Archivo"}
            control={form.control}
            accept=".pdf,image/*"
            currentFileName={isEditMode ? currentFileName : null}
            currentFileUrl={isEditMode ? currentFileUrl : null}
            helperText="PDF o imagen del curso, certificado o documento."
          />

          <div className="grid gap-1.5">
            <Label htmlFor="remarks">Observaciones</Label>
            <Textarea
              id="remarks"
              {...form.register("remarks")}
              className="min-h-24"
              placeholder="Notas internas sobre la formacion o documento..."
            />
          </div>
        </form>

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="worker-document-form" disabled={isSaving}>
            <Upload />
            {isSaving
              ? "Guardando..."
              : isEditMode
                ? "Guardar cambios"
                : "Subir documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
