import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import {
  CalendarDays,
  Eye,
  FileText,
  Paperclip,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/general"
import { InventoryPageHeader } from "@/features/inventory/components"
import {
  useCreateAbsenceRequestMutation,
  useGetAbsenceRequestsByWorkerIdQuery,
} from "@/features/absences/api/absenceRequestApi"
import { useGetAbsenceTypesQuery } from "@/features/absences/api/absenceTypeApi"
import { useGlobalError } from "@/hooks"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import type { AbsenceRequestResponse } from "@/features/interface/absence-request/response/absence-request-response"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const columnHelper = createColumnHelper<
  DataTableFeatures,
  AbsenceRequestResponse
>()

const ACCEPTED_DOCUMENTS = ".pdf,.png,.jpg,.jpeg,.doc,.docx"
const MAX_DOCUMENTS = 10

const EMPTY_ABSENCE_FORM: AbsenceFormValues = {
  typeId: "",
  startDate: "",
  endDate: "",
  observation: "",
  files: [],
}

type AbsenceFormValues = {
  typeId: string
  startDate: string
  endDate: string
  observation: string
  files: File[]
}

type EditAbsenceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AbsenceFormValues) => Promise<void>
  isSubmitting: boolean
}

type PermissionClaims = {
  permissions?: unknown
  authorities?: unknown
}

function getInputDate(value: string) {
  if (!value) return undefined

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name)
  )
}

function getFileMetadata(file: File) {
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE"
  return `${extension} · ${formatFileSize(file.size)}`
}

function getPermissionValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "string") {
    return value.split(/[\s,]+/).filter(Boolean)
  }

  return []
}

function hasPermission(permission: string) {
  if (typeof window === "undefined") return false

  const storedPermissions = window.localStorage.getItem("permissions")
  if (storedPermissions) {
    try {
      const values = getPermissionValues(JSON.parse(storedPermissions))
      return values.includes(permission) || values.includes("*")
    } catch {
      return false
    }
  }

  const token =
    window.localStorage.getItem("token") ??
    window.sessionStorage.getItem("token")
  if (!token) return true

  try {
    const payload = token.split(".")[1]
    const claims = JSON.parse(atob(payload)) as PermissionClaims
    const values = [
      ...getPermissionValues(claims.permissions),
      ...getPermissionValues(claims.authorities),
    ]

    return (
      values.length === 0 || values.includes(permission) || values.includes("*")
    )
  } catch {
    return false
  }
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function EditAbsenceDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditAbsenceDialogProps) {
  const [values, setValues] = useState<AbsenceFormValues>(EMPTY_ABSENCE_FORM)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const previewUrlsRef = useRef(previewUrls)
  const [filePreview, setFilePreview] = useState<{
    file: File
    url: string
    shouldRevoke: boolean
  } | null>(null)

  const { data: absenceTypesPage, isLoading: isLoadingTypes } =
    useGetAbsenceTypesQuery(
      { page: 0, size: 100, sort: ["name,asc"] },
      { skip: !open }
    )
  const selectedAbsenceType = absenceTypesPage?.content.find(
    (absenceType) => String(absenceType.id) === values.typeId
  )

  const updateValue = <TKey extends keyof AbsenceFormValues>(
    key: TKey,
    value: AbsenceFormValues[TKey]
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const incomingFiles = Array.from(selectedFiles)
    const availableSlots = MAX_DOCUMENTS - values.files.length
    const nextFiles = incomingFiles.slice(0, availableSlots)

    setPreviewUrls((current) => {
      const next = { ...current }

      nextFiles.forEach((file) => {
        if (isImageFile(file)) {
          next[getFileKey(file)] = URL.createObjectURL(file)
        }
      })

      previewUrlsRef.current = next
      return next
    })
    updateValue("files", [...values.files, ...nextFiles])
  }

  const removeFile = (index: number) => {
    const file = values.files[index]
    if (file) {
      if (filePreview?.file === file) {
        if (filePreview.shouldRevoke) URL.revokeObjectURL(filePreview.url)
        setFilePreview(null)
      }
      const key = getFileKey(file)
      const previewUrl = previewUrlsRef.current[key]

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrls((current) => {
        const next = { ...current }
        delete next[key]
        previewUrlsRef.current = next
        return next
      })
    }

    updateValue(
      "files",
      values.files.filter((_file, fileIndex) => fileIndex !== index)
    )
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.typeId) nextErrors.typeId = "Selecciona un tipo de ausencia."
    if (!values.startDate)
      nextErrors.startDate = "Selecciona la fecha de inicio."
    if (!values.endDate) nextErrors.endDate = "Selecciona la fecha final."
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      nextErrors.endDate =
        "La fecha final debe ser igual o posterior a la fecha de inicio."
    }
    if (values.observation.length > 1000) {
      nextErrors.observation =
        "La observación no puede superar los 1000 caracteres."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit({ ...values, observation: values.observation.trim() })
  }

  const clearPreviewUrls = () => {
    if (filePreview?.shouldRevoke) URL.revokeObjectURL(filePreview.url)
    setFilePreview(null)
    Object.values(previewUrlsRef.current).forEach((url) =>
      URL.revokeObjectURL(url)
    )
    previewUrlsRef.current = {}
    setPreviewUrls({})
  }

  const openFilePreview = (file: File) => {
    const existingUrl = previewUrlsRef.current[getFileKey(file)]
    setFilePreview({
      file,
      url: existingUrl ?? URL.createObjectURL(file),
      shouldRevoke: !existingUrl,
    })
  }

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url)
      )
    }
  }, [])

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            clearPreviewUrls()
            setValues(EMPTY_ABSENCE_FORM)
            setErrors({})
          }
          onOpenChange(nextOpen)
        }}
      >
        <DialogContent className="max-h-[min(92svh,900px)] max-w-2m overflow-y-auto p-0">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b px-6 py-5 pr-12">
              <DialogTitle className="text-xl">Solicitar ausencia</DialogTitle>
              <DialogDescription>
                Completa los datos de tu solicitud y adjunta la documentación
                necesaria.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5">
              <div className="grid gap-2">
                <Label htmlFor="absence-type">Tipo de ausencia</Label>
                <Select
                  value={values.typeId}
                  onValueChange={(value) => updateValue("typeId", value ?? "")}
                >
                  <SelectTrigger
                    id="absence-type"
                    aria-invalid={Boolean(errors.typeId)}
                    className="h-10"
                  >
                    <span
                      className={
                        selectedAbsenceType
                          ? undefined
                          : "text-muted-foreground"
                      }
                    >
                      {selectedAbsenceType?.name ??
                        "Selecciona un tipo de ausencia"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {absenceTypesPage?.content.map((absenceType) => (
                      <SelectItem
                        key={absenceType.id}
                        value={String(absenceType.id)}
                      >
                        {absenceType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingTypes ? (
                  <p className="text-xs text-muted-foreground">
                    Cargando tipos de ausencia...
                  </p>
                ) : null}
                {errors.typeId ? (
                  <p className="text-xs text-destructive">{errors.typeId}</p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <DatePicker
                    id="absence-start-date"
                    label="Fecha inicio"
                    value={getInputDate(values.startDate)}
                    onChange={(date) =>
                      updateValue("startDate", toInputDate(date))
                    }
                  />
                  {errors.startDate ? (
                    <p className="text-xs text-destructive">
                      {errors.startDate}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <DatePicker
                    id="absence-end-date"
                    label="Fecha fin"
                    minDate={getInputDate(values.startDate)}
                    value={getInputDate(values.endDate)}
                    onChange={(date) =>
                      updateValue("endDate", toInputDate(date))
                    }
                  />
                  {errors.endDate ? (
                    <p className="text-xs text-destructive">{errors.endDate}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="absence-observation">Observación</Label>
                  <span className="text-xs text-muted-foreground">
                    {values.observation.length}/1000
                  </span>
                </div>
                <Textarea
                  id="absence-observation"
                  maxLength={1000}
                  placeholder="Describe el motivo de la ausencia"
                  value={values.observation}
                  aria-invalid={Boolean(errors.observation)}
                  onChange={(event) =>
                    updateValue("observation", event.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 1000 caracteres.
                </p>
                {errors.observation ? (
                  <p className="text-xs text-destructive">
                    {errors.observation}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Label>Documentación</Label>
                    <p className="text-xs text-muted-foreground">
                      Adjunta documentación si lo necesitas.
                    </p>
                  </div>
                  <Label
                    htmlFor="absence-files"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    <Upload className="size-4" /> Añadir documento
                  </Label>
                  <Input
                    id="absence-files"
                    type="file"
                    accept={ACCEPTED_DOCUMENTS}
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      addFiles(event.target.files)
                      event.currentTarget.value = ""
                    }}
                  />
                </div>
                {values.files.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    No se ha adjuntado documentación.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3">
                      <AttachmentGroup>
                        {values.files
                          .map((file, index) => ({ file, index }))
                          .filter(({ file }) => isImageFile(file))
                          .map(({ file, index }) => (
                            <Attachment
                              key={`${getFileKey(file)}-${index}`}
                              orientation="vertical"
                              className="w-30"
                            >
                              <AttachmentMedia variant="image">
                                <img
                                  src={previewUrls[getFileKey(file)]}
                                  alt={`Vista previa de ${file.name}`}
                                />
                              </AttachmentMedia>
                              <AttachmentContent>
                                <AttachmentTitle>{file.name}</AttachmentTitle>
                                <AttachmentDescription>
                                  {getFileMetadata(file)}
                                </AttachmentDescription>
                              </AttachmentContent>
                              <AttachmentActions>
                                <AttachmentAction
                                  type="button"
                                  size="sm"
                                  className="gap-1 px-1.5"
                                  onClick={() => openFilePreview(file)}
                                >
                                  <Eye />
                                  <span>Previsualizar</span>
                                </AttachmentAction>
                                <AttachmentAction
                                  type="button"
                                  aria-label={`Eliminar ${file.name}`}
                                  onClick={() => removeFile(index)}
                                >
                                  <Trash2 />
                                </AttachmentAction>
                              </AttachmentActions>
                            </Attachment>
                          ))}
                      </AttachmentGroup>
                      <div className="grid gap-2">
                        {values.files
                          .map((file, index) => ({ file, index }))
                          .filter(({ file }) => !isImageFile(file))
                          .map(({ file, index }) => (
                            <Attachment
                              key={`${getFileKey(file)}-${index}`}
                              className="w-full"
                            >
                              <AttachmentMedia>
                                <FileText />
                              </AttachmentMedia>
                              <AttachmentContent>
                                <AttachmentTitle>{file.name}</AttachmentTitle>
                                <AttachmentDescription>
                                  {getFileMetadata(file)}
                                </AttachmentDescription>
                              </AttachmentContent>
                              <AttachmentActions>
                                <AttachmentAction
                                  type="button"
                                  size="sm"
                                  className="gap-1 px-1.5"
                                  onClick={() => openFilePreview(file)}
                                >
                                  <Eye />
                                  <span>Previsualizar</span>
                                </AttachmentAction>
                                <AttachmentAction
                                  type="button"
                                  aria-label={`Eliminar ${file.name}`}
                                  onClick={() => removeFile(index)}
                                >
                                  <Trash2 />
                                </AttachmentAction>
                              </AttachmentActions>
                            </Attachment>
                          ))}
                      </div>
                    </div>
                    <ul className="hidden">
                      {values.files.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-3 rounded-md border p-3"
                        >
                          <FileText className="size-5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-sm">
                              {file.name}
                            </strong>
                            <span className="text-xs text-muted-foreground">
                              {file.type || "Documento"} ·{" "}
                              {formatFileSize(file.size)}
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${file.name}`}
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="size-3" /> Hasta {MAX_DOCUMENTS}{" "}
                  archivos: PDF, PNG, JPG, DOC o DOCX.
                </p>
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Volver
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Pencil />
                {isSubmitting ? "Guardando..." : "Guardar solicitud"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={filePreview !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (filePreview?.shouldRevoke) {
              URL.revokeObjectURL(filePreview.url)
            }
            setFilePreview(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {filePreview?.file.name ?? "Previsualización"}
            </DialogTitle>
            <DialogDescription>
              Vista previa del documento adjunto.
            </DialogDescription>
          </DialogHeader>
          {filePreview ? (
            isImageFile(filePreview.file) ? (
              <img
                src={filePreview.url}
                alt={`Previsualización de ${filePreview.file.name}`}
                className="max-h-[70svh] w-full rounded-md object-contain"
              />
            ) : filePreview.file.type === "application/pdf" ||
              /\.pdf$/i.test(filePreview.file.name) ? (
              <iframe
                src={filePreview.url}
                title={`Previsualización de ${filePreview.file.name}`}
                className="h-[70svh] w-full rounded-md border"
              />
            ) : (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                Este formato no permite una previsualización integrada.
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
}

const statusClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-600",
  PENDIENTE: "border-amber-200 bg-amber-50 text-amber-700",
  APROBADA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RECHAZADA: "border-red-200 bg-red-50 text-red-700",
  CANCELADA: "border-slate-200 bg-slate-50 text-slate-600",
}

function parseDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value?: string | null) {
  const date = parseDate(value)
  return date ? dateFormatter.format(date) : "-"
}

function formatDateTime(value?: string | null) {
  const date = parseDate(value)
  return date ? dateTimeFormatter.format(date) : "-"
}

function getAbsenceDays(request: AbsenceRequestResponse) {
  const start = parseDate(request.startDate)
  const end = parseDate(request.endDate)

  if (!start || !end) return null

  const startDay = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  )
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  const days = Math.floor((endDay - startDay) / 86_400_000) + 1

  return days > 0 ? days : null
}

function AbsenceTypeCell({ request }: { request: AbsenceRequestResponse }) {
  return (
    <div className="flex min-w-44 items-center gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
        style={
          request.calendarColor
            ? {
                backgroundColor: `${request.calendarColor}20`,
                borderColor: `${request.calendarColor}55`,
                color: request.calendarColor,
              }
            : undefined
        }
      >
        <CalendarDays className="size-4" />
      </span>
      <span className="grid min-w-0 gap-0.5">
        <strong className="truncate font-medium">
          {request.absenceTypeName ?? request.name ?? "Ausencia"}
        </strong>
        <span className="truncate text-xs text-muted-foreground">
          {request.description ?? "Sin descripción"}
        </span>
      </span>
    </div>
  )
}

function PeriodCell({ request }: { request: AbsenceRequestResponse }) {
  return (
    <div className="grid min-w-44 gap-0.5">
      <strong className="font-medium">
        {formatDate(request.startDate)} - {formatDate(request.endDate)}
      </strong>
      <span className="text-xs text-muted-foreground">
        {request.startDate && request.endDate
          ? `${parseDate(request.startDate)?.toLocaleDateString("es-ES", {
              weekday: "short",
            })} - ${parseDate(request.endDate)?.toLocaleDateString("es-ES", {
              weekday: "short",
            })}`
          : "-"}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalizedStatus = status?.toUpperCase() ?? ""

  return (
    <Badge
      variant="outline"
      className={statusClasses[normalizedStatus] ?? "text-muted-foreground"}
    >
      {statusLabels[normalizedStatus] ?? status ?? "Sin estado"}
    </Badge>
  )
}

const absenceColumns = columnHelper.columns([
  columnHelper.accessor(
    (request) => request.absenceTypeName ?? request.name ?? "",
    {
      id: "absenceType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo de ausencia" />
      ),
      cell: ({ row }) => <AbsenceTypeCell request={row.original} />,
      size: 250,
      minSize: 210,
    }
  ),
  columnHelper.display({
    id: "period",
    header: "Periodo",
    cell: ({ row }) => <PeriodCell request={row.original} />,
    size: 245,
    minSize: 210,
    enableSorting: false,
  }),
  columnHelper.display({
    id: "days",
    header: "Días",
    cell: ({ row }) => {
      const days = getAbsenceDays(row.original)
      return days ? `${days} ${days === 1 ? "día" : "días"}` : "-"
    },
    size: 100,
    minSize: 90,
    enableSorting: false,
  }),
  columnHelper.accessor((request) => request.status ?? "", {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    size: 145,
    minSize: 125,
  }),
  columnHelper.accessor(
    (request) => request.requestedAt ?? request.createdAt ?? "",
    {
      id: "requestedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Solicitada el" />
      ),
      cell: ({ row }) =>
        formatDateTime(row.original.requestedAt ?? row.original.createdAt),
      size: 175,
      minSize: 155,
    }
  ),
  columnHelper.accessor((request) => request.observation ?? "", {
    id: "observation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observación" />
    ),
    cell: ({ row }) => row.original.observation || "-",
    size: 220,
    minSize: 180,
  }),
])

export function MyAbsencesPage() {

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAbsenceId, setEditingAbsenceId] = useState<number | null>(null)
  const {
    data: absenceRequestsPage,
    isLoading,
    isFetching,
    isError,
    refetch: refetchAbsenceRequests,
  } = useGetAbsenceRequestsByWorkerIdQuery({
    page,
    size: pageSize,
    sort: ["startDate,desc"],
  })
  const [createAbsenceRequest, { isLoading: isCreating }] =
    useCreateAbsenceRequestMutation()
  const { handleError } = useGlobalError()
  const { success } = useNotifications()
  const canCreateOwnAbsence = hasPermission("absence.own.create")

  async function handleEditSubmit(values: AbsenceFormValues) {
    if (
      editingAbsenceId !== null ||
      !values.typeId ||
      !values.startDate ||
      !values.endDate ||
      !canCreateOwnAbsence
    ) {
      return
    }

    try {
      await createAbsenceRequest({
        absenceTypeId: Number(values.typeId),
        startDate: values.startDate,
        endDate: values.endDate,
        observation: values.observation.trim() || null,
        files: values.files,
      }).unwrap()
      await refetchAbsenceRequests()
      setEditDialogOpen(false)
      setEditingAbsenceId(null)
      success("Solicitud de ausencia guardada correctamente.")
    } catch (error) {
      handleError(error, "No se pudo guardar la solicitud de ausencia.")
    }
  }

  const currentRows = absenceRequestsPage?.content ?? []
  const totalPages = Math.max(1, absenceRequestsPage?.totalPages ?? 1)
  const currentPage = Math.min(
    (absenceRequestsPage?.page ?? page) + 1,
    totalPages
  )
  const columns = useMemo(() => absenceColumns, [])

  return (
    <section className="flex flex-col gap-6" aria-label="Mis ausencias">
      <InventoryPageHeader
        title="Mis ausencias"
        description="Consulta y gestiona todas tus solicitudes de ausencia."
        action={
          <Button
            type="button"
            disabled={!canCreateOwnAbsence || isCreating}
            onClick={() => {
              setEditingAbsenceId(null)
              setEditDialogOpen(true)
            }}
          >
            <Pencil />
            Solicitar ausencia
          </Button>
        }
      />

      <Card>
        <CardContent className="p-3 sm:p-5">
          <p className="sr-only" role="status" aria-live="polite">
            {isFetching ? "Actualizando ausencias" : "Ausencias actualizadas"}
          </p>
          <DataTable
            data={currentRows}
            columns={columns}
            fitColumns
            getRowId={(request) => String(request.id)}
            isLoading={isLoading}
            ariaLabel="Solicitudes de ausencia"
            emptyMessage={
              isError
                ? "No se pudieron cargar tus ausencias."
                : "Todavía no tienes solicitudes de ausencia."
            }
            serverPagination={{
              page: currentPage,
              pageSize,
              totalPages,
              totalElements: absenceRequestsPage?.totalElements ?? 0,
              onPageChange: (nextPage) => setPage(nextPage - 1),
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              onPageSizeChange: (nextPageSize) => {
                setPageSize(nextPageSize)
                setPage(0)
              },
            }}
          />
        </CardContent>
      </Card>
      <EditAbsenceDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!isCreating) setEditDialogOpen(open)
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isCreating}
      />
    </section>
  )
}
