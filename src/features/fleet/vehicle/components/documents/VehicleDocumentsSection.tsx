import { useMemo, useState } from "react"
import {
  Download,
  Eye,
  FileText,
  Filter,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { OptionsSelect } from "@/components/general/options-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { CreateVehicleDocumentRequest } from "@/features/interface/vehicle/request/create-vehicle-document-request"
import type { UpdateVehicleDocumentRequest } from "@/features/interface/vehicle/request/update-vehicle-document-request"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"
import {
  useCreateVehicleDocumentMutation,
  useDeleteVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
} from "@/features/fleet/api/apiVehicleDocument"
import { cn } from "@/lib/utils"

import {
  DEFAULT_VEHICLE_DOCUMENT_FILTERS,
  VEHICLE_DOCUMENT_FILTER_OPTIONS,
  VEHICLE_DOCUMENT_STATUS_META,
  VEHICLE_DOCUMENT_STATUS_OPTIONS,
  VEHICLE_DOCUMENT_TYPE_OPTIONS,
} from "./constants"
import { VehicleDocumentDialog } from "./VehicleDocumentDialog"
import type {
  VehicleDocumentFilters,
  VehicleDocumentGroupView,
  VehicleDocumentListItemView,
  VehicleDocumentQuickFilter,
} from "./types"
import { downloadFile, formatBytes, formatDate, getFileKind } from "./utils"
import { useVehicleDocuments } from "../../hooks/useVehicleDocuments"

type VehicleDocumentsSectionProps = {
  vehicle: Vehicle
}

export function VehicleDocumentsSection({
  vehicle,
}: VehicleDocumentsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [editingDocument, setEditingDocument] =
    useState<VehicleDocumentListItemView | null>(null)
  const [deletingDocument, setDeletingDocument] =
    useState<VehicleDocumentListItemView | null>(null)
  const [createVehicleDocument, { isLoading: isCreating }] =
    useCreateVehicleDocumentMutation()
  const [updateVehicleDocument, { isLoading: isUpdating }] =
    useUpdateVehicleDocumentMutation()
  const [deleteVehicleDocument, { isLoading: isDeleting }] =
    useDeleteVehicleDocumentMutation()
  const {
    refetch,
    isLoading,
    isFetching,
    isError,
    groups,
    counts,
    quickFilter,
    setQuickFilter,
    filters,
    setFilters,
    selectedDocument,
    selectedDocumentId,
    setSelectedDocumentId,
  } = useVehicleDocuments(vehicle.id)

  async function handleCreate(request: CreateVehicleDocumentRequest) {
    await createVehicleDocument(request).unwrap()
    setDialogOpen(false)
  }

  async function handleUpdate(
    id: number,
    request: UpdateVehicleDocumentRequest
  ) {
    await updateVehicleDocument({ id, request }).unwrap()
    setDialogOpen(false)
    setEditingDocument(null)
  }

  async function handleDelete() {
    if (!deletingDocument) return
    await deleteVehicleDocument(deletingDocument.id).unwrap()
    setDeletingDocument(null)
  }

  return (
    <Card className="border-border/80 py-4 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <CardTitle className="text-xl font-semibold">
            Documentacion del vehiculo
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            Gestiona permisos, ITV, seguro y archivos operativos asociados al
            vehiculo.
          </CardDescription>
        </div>
        <CardAction className="static row-auto flex flex-wrap gap-2 self-auto justify-self-start md:justify-self-end">
          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            <Filter />
            Filtrar
          </Button>
          <Button
            onClick={() => {
              setEditingDocument(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            Subir documento
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-3">
        {isFetching && !isLoading ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Actualizando documentos...
          </div>
        ) : null}

        <DocumentToolbar
          counts={counts}
          value={quickFilter}
          onChange={setQuickFilter}
          searchValue={filters.title}
          onSearchChange={(title) =>
            setFilters((current) => ({ ...current, title }))
          }
        />

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(18rem,0.36fr)_minmax(0,0.64fr)]">
          <DocumentList
            groups={groups}
            loading={isLoading}
            error={isError}
            selectedDocumentId={selectedDocumentId}
            onRetry={refetch}
            onSelect={setSelectedDocumentId}
            onCreate={() => {
              setEditingDocument(null)
              setDialogOpen(true)
            }}
          />
          <DocumentDetail
            document={selectedDocument}
            onEdit={(document) => {
              setEditingDocument(document)
              setDialogOpen(true)
            }}
            onDelete={setDeletingDocument}
          />
        </div>
      </CardContent>

      <VehicleDocumentDialog
        open={dialogOpen}
        vehicleId={vehicle.id}
        document={editingDocument}
        isSubmitting={isCreating || isUpdating}
        onClose={() => {
          setDialogOpen(false)
          setEditingDocument(null)
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <FilterDialog
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters)
          setFiltersOpen(false)
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingDocument)}
        title="Eliminar documento"
        subtitle={
          deletingDocument
            ? `Vas a eliminar "${deletingDocument.title}".`
            : undefined
        }
        loading={isDeleting}
        onClose={() => setDeletingDocument(null)}
        onDelete={handleDelete}
      />
    </Card>
  )
}

function DocumentToolbar({
  counts,
  value,
  onChange,
  searchValue,
  onSearchChange,
}: {
  counts: Record<VehicleDocumentQuickFilter, number>
  value: VehicleDocumentQuickFilter
  onChange: (value: VehicleDocumentQuickFilter) => void
  searchValue: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {VEHICLE_DOCUMENT_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={value === option.value ? "default" : "outline"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            <Badge variant="secondary">{counts[option.value] ?? 0}</Badge>
          </Button>
        ))}
      </div>
      <div className="relative sm:w-72">
        <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Buscar documentos"
          placeholder="Buscar documentos"
          value={searchValue}
          className="h-8 pl-7"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  )
}

function DocumentList({
  groups,
  loading,
  error,
  selectedDocumentId,
  onRetry,
  onSelect,
  onCreate,
}: {
  groups: VehicleDocumentGroupView[]
  loading: boolean
  error: boolean
  selectedDocumentId: number | null
  onRetry: () => void
  onSelect: (id: number) => void
  onCreate: () => void
}) {
  if (error) {
    return (
      <EmptyState
        title="No se pudieron cargar los documentos"
        description="Reintenta la consulta para volver a sincronizar la lista."
        action={
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw />
            Reintentar
          </Button>
        }
      />
    )
  }

  if (loading) {
    return (
      <div className="grid self-start">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="mb-2 h-16 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    )
  }

  if (!groups.length) {
    return (
      <EmptyState
        title="Sin documentos"
        description="Sube el primer documento asociado a este vehiculo."
        action={
          <Button onClick={onCreate}>
            <Plus />
            Subir documento
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid self-start rounded-lg border bg-card">
      {groups.map((group) => (
        <DocumentGroup
          key={group.key}
          group={group}
          selectedDocumentId={selectedDocumentId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function DocumentGroup({
  group,
  selectedDocumentId,
  onSelect,
}: {
  group: VehicleDocumentGroupView
  selectedDocumentId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <section className="border-b last:border-b-0">
      <div className="flex items-center justify-between bg-muted/25 px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-7 place-items-center rounded-md",
              group.iconBackground,
              group.iconColor
            )}
          >
            <FileText className="size-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{group.label}</h3>
            <p className="text-xs text-muted-foreground">
              {group.items.length} documento
              {group.items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
      <div className="divide-y">
        {group.items.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            selected={document.id === selectedDocumentId}
            onSelect={() => onSelect(document.id)}
          />
        ))}
      </div>
    </section>
  )
}

function DocumentRow({
  document,
  selected,
  onSelect,
}: {
  document: VehicleDocumentListItemView
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "grid w-full gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
        selected && "bg-blue-50/70"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{document.title}</p>
          <p className="text-xs text-muted-foreground">
            {document.categoryLabel} · {document.storedFiles.length} archivos
          </p>
        </div>
        <DocumentStatusBadge document={document} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Emitido: {formatDate(document.issueDate)}</span>
        <span>Caduca: {formatDate(document.expirationDate)}</span>
      </div>
    </button>
  )
}

function DocumentDetail({
  document,
  onEdit,
  onDelete,
}: {
  document: VehicleDocumentListItemView | null
  onEdit: (document: VehicleDocumentListItemView) => void
  onDelete: (document: VehicleDocumentListItemView) => void
}) {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const selectedFile = useMemo(() => {
    if (!document) return null
    return (
      document.storedFiles.find((file) => file.id === selectedFileId) ??
      document.primaryFile
    )
  }, [document, selectedFileId])

  if (!document) {
    return (
      <EmptyState
        title="Selecciona un documento"
        description="El detalle y la vista previa apareceran aqui."
      />
    )
  }

  return (
    <Card className="border-border/80 py-3 [--card-spacing:--spacing(3)]">
      <CardHeader className="grid-cols-[1fr_auto] items-center border-b pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate">{document.title}</CardTitle>
            <CardDescription>{document.documentTypeLabel}</CardDescription>
          </div>
          <DocumentStatusBadge document={document} />
        </div>
        <CardAction className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Editar documento"
            onClick={() => onEdit(document)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Eliminar documento"
            className="text-red-600"
            onClick={() => onDelete(document)}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <Metadata
            label="Estado"
            value={<DocumentStatusBadge document={document} />}
          />
          <Metadata label="Categoria" value={document.categoryLabel} />
          <Metadata label="Emitido el" value={formatDate(document.issueDate)} />
          <Metadata
            label="Fecha de caducidad"
            value={formatDate(document.expirationDate)}
          />
          <Metadata
            label="Responsable"
            value={document.responsible?.name ?? "Sin responsable"}
          />
          <Metadata
            label="Notas"
            value={document.notes?.trim() || "Sin notas"}
          />
        </div>

        {document.storedFiles.length > 1 ? (
          <div className="max-w-sm">
            <OptionsSelect
              id="selectedFile"
              label="Archivo"
              value={selectedFile?.id ?? document.storedFiles[0].id}
              options={document.storedFiles.map((file) => ({
                value: file.id,
                label: file.originalFileName,
              }))}
              onChange={setSelectedFileId}
            />
          </div>
        ) : null}

        <PreviewPanel file={selectedFile} />
      </CardContent>
    </Card>
  )
}

function PreviewPanel({
  file,
}: {
  file: VehicleDocumentListItemView["primaryFile"]
}) {
  if (!file) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border bg-muted/20 text-sm text-muted-foreground">
        Vista previa no disponible
      </div>
    )
  }

  const isPdf = file.contentType.includes("pdf")
  const isImage = file.contentType.startsWith("image/")

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {file.originalFileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {getFileKind(file.contentType)} · {formatBytes(file.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadFile(file.fileUrl, file.originalFileName)}
        >
          <Download />
          Descargar
        </Button>
      </div>

      {isPdf ? (
        <iframe
          title={file.originalFileName}
          src={file.fileUrl}
          className="h-[520px] w-full"
        />
      ) : isImage ? (
        <img
          src={file.fileUrl}
          alt={file.originalFileName}
          className="max-h-[520px] w-full object-contain"
        />
      ) : (
        <div className="grid min-h-64 place-items-center gap-3 p-6 text-center">
          <Eye className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Este tipo de archivo no tiene vista previa directa.
          </p>
        </div>
      )}
    </div>
  )
}

function FilterDialog({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean
  filters: VehicleDocumentFilters
  onClose: () => void
  onApply: (filters: VehicleDocumentFilters) => void
}) {
  const [draft, setDraft] = useState(filters)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Filtros de documentos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 px-5 py-4">
          <OptionsSelect
            id="filterDocumentType"
            label="Tipo"
            options={VEHICLE_DOCUMENT_TYPE_OPTIONS}
            value={draft.documentType}
            onChange={(documentType) =>
              setDraft((current) => ({ ...current, documentType }))
            }
          />
          <OptionsSelect
            id="filterStatus"
            label="Estado"
            options={VEHICLE_DOCUMENT_STATUS_OPTIONS}
            value={draft.status}
            onChange={(status) =>
              setDraft((current) => ({ ...current, status }))
            }
          />
          <div className="grid gap-1.5">
            <label htmlFor="filterTitle" className="text-xs font-medium">
              Buscar por titulo
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="filterTitle"
                value={draft.title}
                className="pl-7"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(DEFAULT_VEHICLE_DOCUMENT_FILTERS)}
          >
            Limpiar
          </Button>
          <Button type="button" onClick={() => onApply(draft)}>
            Aplicar filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DocumentStatusBadge({
  document,
}: {
  document: VehicleDocumentListItemView
}) {
  const meta = VEHICLE_DOCUMENT_STATUS_META[document.status]
  const label =
    document.status === "EXPIRING_SOON" && document.daysUntilExpiration !== null
      ? `Caduca en ${document.daysUntilExpiration} dias`
      : meta.label

  return (
    <Badge variant="outline" className={meta.className}>
      {label}
    </Badge>
  )
}

function Metadata({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 px-2.5 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
      <div className="max-w-sm">
        <FileText className="mx-auto size-9 text-muted-foreground" />
        <h3 className="mt-3 text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {action ? (
          <div className="mt-4 flex justify-center">{action}</div>
        ) : null}
      </div>
    </div>
  )
}
