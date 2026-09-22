import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  CirclePlus,
  Info,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  Save,
  ScanBarcode,
  Search,
  Trash2,
  Truck,
  UserRound,
} from "lucide-react"
import { useBlocker } from "react-router-dom"

import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { IdentificationResponse } from "@/features/interface/identification/types"
import { useIdentifyProductMutation } from "@/features/inventory/api/identificationApi"
import {
  useLazyGetModelIdentifiersQuery,
  useGetProvidersQuery,
  useLazyGetTelecommunicationModelsSelectionQuery,
} from "@/features/inventory/api/modelsApi"
import type { TelecommunicationModelSelectionResponse } from "@/features/interface/models/types/selection.types"
import type { TelecommunicationItemModelIdentifierResponse } from "@/features/interface/models/types/model.types"
import {
  useRegisterAssignmentMutation,
  type AssignmentCreateRequest,
  type MultipartAttachment,
  type MultipartOperation,
} from "@/features/inventory/api/operations.service"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useInventoryScanner } from "@/features/inventory/entry/hooks/useInventoryScanner"
import { useGlobalError } from "@/hooks"
import {
  useGetAssignableWorkersQuery,
  useGetAvailableModelItemsQuery,
  type TelecommunicationItemSelectionResponse,
} from "../api/assignmentApi"
import { AssignmentDraftList } from "../components/AssignmentDraftList"
import { EvidenceUploader } from "../components/EvidenceUploader"
import type {
  AssignmentConsumableDraft,
  AssignmentDraft,
  AssignmentSpecificProductDraft,
  LocalEvidence,
  WorkerOption,
} from "../types/assignment.types"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from "@/components/reui/stepper"
import { CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { FieldSet } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import { createColumnHelper } from "@tanstack/react-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { skipToken } from "@reduxjs/toolkit/query"

type ConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

type PendingSelectionChange =
  { kind: "worker"; value: string } | { kind: "provider"; value: string }

type ProductType = "SPECIFIC" | "GENERIC"

const initialAssignmentDraft: AssignmentDraft = {
  worker: null,
  notes: "",
  specificProducts: [],
  consumables: [],
  generalEvidence: [],
}

function createLocalId(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function quantityText(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function collectEvidence(
  prefix: string,
  evidence: LocalEvidence[],
  attachments: MultipartAttachment[]
) {
  return evidence.map((item, index) => {
    const key = `${prefix}-${index}`
    attachments.push({ key, file: item.file })
    return key
  })
}

function buildAssignmentOperation(
  draft: AssignmentDraft
): MultipartOperation<AssignmentCreateRequest> | null {
  if (!draft.worker) return null

  const attachments: MultipartAttachment[] = []
  const imageKeys = collectEvidence(
    "assignment-movement",
    draft.generalEvidence,
    attachments
  )
  const specialItems = draft.specificProducts.map((item) => ({
    telecommunicationItemId: item.telecommunicationItemId,
    imageKeys: collectEvidence(
      `assignment-specific-${item.telecommunicationItemId}`,
      item.evidence,
      attachments
    ),
  }))
  const generalItems = draft.consumables.map((item) => ({
    telecommunicationGenericItemId: item.telecommunicationGenericItemId,
    quantity: item.quantity,
    identifierId: item.identifierId,
    imageKeys: collectEvidence(
      `assignment-generic-${item.telecommunicationGenericItemId}`,
      item.evidence,
      attachments
    ),
  }))

  return {
    request: {
      accountId: draft.worker.id,
      notes: draft.notes.trim(),
      imageKeys,
      generalItems,
      specialItems,
    },
    attachments,
  }
}

function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AssignmentPreparationAreaProps = {
  draft: AssignmentDraft
  scannerEnabled: boolean
  operationReady: boolean
  isIdentifying: boolean
  isRegistering: boolean
  onRequestClear: () => void
  onRemoveSpecific: (draftId: string) => void
  onRemoveConsumable: (draftId: string) => void
  onChangeConsumableQuantity: (draftId: string, quantity: number) => void
  onAddSpecificEvidence: (draftId: string, files: File[]) => void
  onRemoveSpecificEvidence: (draftId: string, localId: string) => void
  onAddConsumableEvidence: (draftId: string, files: File[]) => void
  onRemoveConsumableEvidence: (draftId: string, localId: string) => void
  onNotesChange: (notes: string) => void
  onAddGeneralEvidence: (files: File[]) => void
  onRemoveGeneralEvidence: (localId: string) => void
  onRegister: () => void
}

function AssignmentPreparationArea({
  draft,
  scannerEnabled,
  operationReady,
  isIdentifying,
  isRegistering,
  onRequestClear,
  onRemoveSpecific,
  onRemoveConsumable,
  onChangeConsumableQuantity,
  onAddSpecificEvidence,
  onRemoveSpecificEvidence,
  onAddConsumableEvidence,
  onRemoveConsumableEvidence,
  onNotesChange,
  onAddGeneralEvidence,
  onRemoveGeneralEvidence,
  onRegister,
}: AssignmentPreparationAreaProps) {
  const hasPreparedItems =
    draft.specificProducts.length > 0 || draft.consumables.length > 0
  const totalQuantity =
    draft.specificProducts.length +
    draft.consumables.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <article className="w-full min-w-0 rounded-xl border bg-card p-3 sm:p-4 lg:flex-2">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Área de preparación</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Añade productos o escanea unidades para preparar la asignación.
        </p>
      </header>
      <section className="flex justify-end gap-3">
        <Badge variant="secondary">
          {isIdentifying ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ScanBarcode />
          )}
          {isIdentifying
            ? "Identificando"
            : scannerEnabled
              ? "Escáner listo"
              : "Escáner desactivado"}
        </Badge>
        <Button
          type="button"
          variant="destructive"
          disabled={!hasPreparedItems || isIdentifying || isRegistering}
          onClick={onRequestClear}
        >
          <Trash2 />
          Limpiar área
        </Button>
      </section>

      {hasPreparedItems ? (
        <section className="mt-4">
          <header className="mb-2 flex justify-between gap-2">
            <h3 className="text-sm font-semibold">Productos preparados</h3>
            <p className="text-xs text-muted-foreground">
              {quantityText(totalQuantity)}
            </p>
          </header>
          <AssignmentDraftList
            specificProducts={draft.specificProducts}
            consumables={draft.consumables}
            onRemoveSpecific={onRemoveSpecific}
            onRemoveConsumable={onRemoveConsumable}
            onChangeConsumableQuantity={onChangeConsumableQuantity}
            onAddSpecificEvidence={onAddSpecificEvidence}
            onRemoveSpecificEvidence={onRemoveSpecificEvidence}
            onAddConsumableEvidence={onAddConsumableEvidence}
            onRemoveConsumableEvidence={onRemoveConsumableEvidence}
          />
          <section className="mt-4 grid gap-4 rounded-lg border p-3 lg:grid-cols-2">
            <label className="text-xs font-medium">
              Nota general
              <Textarea
                value={draft.notes}
                onChange={(event) => onNotesChange(event.target.value)}
                className="mt-1 min-h-24"
              />
            </label>
            <EvidenceUploader
              evidence={draft.generalEvidence}
              onAdd={onAddGeneralEvidence}
              onRemove={onRemoveGeneralEvidence}
            />
          </section>
        </section>
      ) : (
        <Empty className="mt-4 min-h-56 rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="default">
              <Package />
            </EmptyMedia>
            <EmptyTitle>Listo para añadir productos</EmptyTitle>
            <EmptyDescription>
              Selecciona productos disponibles o utiliza el escáner para
              comenzar.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <Button
        type="button"
        className="mt-4 w-full"
        disabled={
          !operationReady || !hasPreparedItems || isIdentifying || isRegistering
        }
        onClick={onRegister}
      >
        {isRegistering ? <LoaderCircle className="animate-spin" /> : <Save />}
        {isRegistering ? "Guardando asignación..." : "Guardar asignación"}
      </Button>
    </article>
  )
}

type WorkflowStepProps = {
  number: number
  title: string
  last?: boolean
  children: React.ReactNode
}

function WorkflowStep({
  number,
  title,
  last = false,
  children,
}: WorkflowStepProps) {
  return (
    <StepperItem step={number} className="block flex-none">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
        <div className="flex flex-col items-center">
          <StepperIndicator className="bg-black text-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=completed]:bg-black data-[state=completed]:text-white">
            {number}
          </StepperIndicator>
          {!last ? (
            <StepperSeparator className="m-0 mt-2 min-h-6 flex-1 bg-border data-[state=completed]:bg-black" />
          ) : null}
        </div>
        <section
          className={last ? "pb-0" : "pb-5"}
          aria-labelledby={`entry-step-${number}`}
        >
          <StepperTitle id={`entry-step-${number}`} className="pt-1">
            {title}
          </StepperTitle>
          <div className="pt-0">{children}</div>
        </section>
      </div>
    </StepperItem>
  )
}

const columnHelper = createColumnHelper<
  DataTableFeatures,
  TelecommunicationModelSelectionResponse
>()
const availableItemsColumnHelper = createColumnHelper<
  DataTableFeatures,
  TelecommunicationItemSelectionResponse
>()

function createModelsColumns() {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modelo" />
      ),
      cell: ({ row }) => {
        return row.original.name
      },
    }),
    columnHelper.accessor("availableQuantity", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Disponibles" />
      ),
      cell: ({ row }) => row.original.availableQuantity ?? 0,
    }),
  ])
}

type ModelsProps = {
  items: TelecommunicationModelSelectionResponse[]
  selectedModelId?: number
  onSelectModel: (model: TelecommunicationModelSelectionResponse) => void
}

function ProductModelsBrowser({
  items,
  selectedModelId,
  onSelectModel,
}: ModelsProps) {
  return (
    <section className="mt-3 space-y-3">
      <DataTable
        data={items}
        columns={createModelsColumns()}
        renderToolbar={(table) => (
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder="Buscar modelo..."
              aria-label="Buscar modelo"
            />
          </InputGroup>
        )}
        getRowId={(model) => String(model.modelId)}
        selectedRowId={
          selectedModelId === undefined ? undefined : String(selectedModelId)
        }
        onRowClick={onSelectModel}
        emptyMessage="No se encontraron modelos."
      />
    </section>
  )
}

type GenericModelsBrowserProps = {
  models: TelecommunicationModelSelectionResponse[]
  selectedModel: TelecommunicationModelSelectionResponse | null
  identifiers: TelecommunicationItemModelIdentifierResponse[]
  selectedIdentifierId: string
  quantity: number
  isLoadingIdentifiers: boolean
  onSelectModel: (model: TelecommunicationModelSelectionResponse) => void
  onChangeModel: () => void
  onSelectIdentifier: (identifierId?: string) => void
  onQuantityChange: (quantity: number) => void
  onAdd: () => void
}

function GenericModelsBrowser({
  models,
  selectedModel,
  identifiers,
  selectedIdentifierId,
  quantity,
  isLoadingIdentifiers,
  onSelectModel,
  onChangeModel,
  onSelectIdentifier,
  onQuantityChange,
  onAdd,
}: GenericModelsBrowserProps) {
  const selectedIdentifier = identifiers.find(
    (identifier) => String(identifier.id) === selectedIdentifierId
  )

  return (
    <section className="mt-3 space-y-3">
      {selectedModel ? (
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold">
              {selectedModel.name}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onChangeModel}
            >
              <RefreshCcw />
              Cambiar
            </Button>
          </div>

          <label className="block text-xs font-medium">
            Identificador
            <Select
              value={selectedIdentifierId}
              onValueChange={(event) => {
                onSelectIdentifier(event ?? undefined)
              } }
              disabled={isLoadingIdentifiers}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue
                  placeholder={
                    isLoadingIdentifiers
                      ? "Cargando identificadores..."
                      : "Selecciona un identificador"
                  }
                >
                  {selectedIdentifier?.code}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {identifiers.map((identifier) => (
                  <SelectItem key={identifier.id} value={String(identifier.id)}>
                    {identifier.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <p className="mt-3 text-xs text-muted-foreground">
            Disponible para añadir: {selectedModel.availableQuantity ?? 0}
          </p>

          <div className="mt-2 flex overflow-hidden rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-none"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(quantity - 1)}
              aria-label="Reducir cantidad"
            >
              <Minus />
            </Button>
            <span className="flex h-9 min-w-16 flex-1 items-center justify-center border-x text-sm font-medium">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-none"
              disabled={
                selectedModel.availableQuantity !== undefined &&
                quantity >= selectedModel.availableQuantity
              }
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="Aumentar cantidad"
            >
              <Plus />
            </Button>
          </div>

          <Button
            type="button"
            className="mt-3 w-full"
            disabled={
              !selectedIdentifierId ||
              quantity < 1 ||
              (selectedModel.availableQuantity !== undefined &&
                quantity > selectedModel.availableQuantity)
            }
            onClick={onAdd}
          >
            <CirclePlus />
            Agregar consumible
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {models.map((model) => (
            <Button
              key={model.modelId}
              type="button"
              variant={
                selectedModel?.modelId === model.modelId ? "default" : "outline"
              }
              className="h-auto justify-between py-3 text-left"
              onClick={() => onSelectModel(model)}
            >
              <span className="min-w-0 truncate">{model.name}</span>
              <span className="shrink-0 text-xs">
                {model.availableQuantity ?? 0} disponibles
              </span>
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}

function formatItemCreationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

type AvailableItemsBrowserProps = {
  items: TelecommunicationItemSelectionResponse[]
  selectedItems: Map<number, TelecommunicationItemSelectionResponse>
  preparedItemIds: Set<number>
  isLoading: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onToggleItem: (
    item: TelecommunicationItemSelectionResponse,
    checked: boolean
  ) => void
  onBack: () => void
  onAddSelected: () => void
}

function AvailableItemsBrowser({
  items,
  selectedItems,
  preparedItemIds,
  isLoading,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onToggleItem,
  onBack,
  onAddSelected,
}: AvailableItemsBrowserProps) {
  const columns = availableItemsColumnHelper.columns([
    availableItemsColumnHelper.display({
      id: "selection",
      header: () => <span className="sr-only">Seleccionar</span>,
      cell: ({ row }) => {
        const item = row.original
        const isSelected = selectedItems.has(item.id)
        const isPrepared = preparedItemIds.has(item.id)

        return (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isPrepared}
            onChange={(event) => onToggleItem(item, event.target.checked)}
            className="size-4 cursor-pointer accent-primary"
            aria-label={
              isPrepared
                ? `${item.uniqueCode} ya está añadido`
                : `Seleccionar ${item.uniqueCode}`
            }
          />
        )
      },
      enableSorting: false,
      size: 48,
    }),
    availableItemsColumnHelper.accessor("uniqueCode", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Código único" />
      ),
      cell: ({ row }) => row.original.uniqueCode,
    }),
    availableItemsColumnHelper.accessor("identifier", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Identificador" />
      ),
      cell: ({ row }) => row.original.identifier,
    }),
    availableItemsColumnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => formatItemCreationDate(row.original.createdAt),
    }),
  ])

  return (
    <section className="mt-3 space-y-3">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft />
        Volver a modelos
      </Button>
      <DataTable
        data={items}
        columns={columns}
        renderToolbar={(table) => (
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              onChange={(event) =>
                table
                  .getColumn("uniqueCode")
                  ?.setFilterValue(event.target.value)
              }
              placeholder="Buscar por código único..."
              aria-label="Buscar por código único"
            />
          </InputGroup>
        )}
        getRowId={(item) => String(item.id)}
        isRowDisabled={(item) => preparedItemIds.has(item.id)}
        onRowClick={(item) => onToggleItem(item, !selectedItems.has(item.id))}
        isLoading={isLoading}
        serverPagination={{
          page,
          pageSize,
          totalPages,
          totalElements,
          onPageChange,
        }}
        emptyMessage="No hay productos disponibles para este modelo."
        ariaLabel="Productos disponibles"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={selectedItems.size === 0}
          onClick={onAddSelected}
        >
          <Package />
          Añadir seleccionados ({selectedItems.size})
        </Button>
      </div>
    </section>
  )
}

export const AssignmentPage = () => {
  const [providerId, setProviderId] = useState("")
  const [productType, setProductType] = useState<ProductType | null>(null)
  const [selectedModel, setSelectedModel] =
    useState<TelecommunicationModelSelectionResponse | null>(null)
  const [selectedGenericModel, setSelectedGenericModel] =
    useState<TelecommunicationModelSelectionResponse | null>(null)
  const [selectedGenericIdentifierId, setSelectedGenericIdentifierId] =
    useState("")
  const [genericQuantity, setGenericQuantity] = useState(1)
  const [availableItemsPageIndex, setAvailableItemsPageIndex] = useState(0)
  const [selectedAvailableItems, setSelectedAvailableItems] = useState<
    Map<number, TelecommunicationItemSelectionResponse>
  >(() => new Map())
  const [draft, setDraft] = useState<AssignmentDraft>(initialAssignmentDraft)
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelectionChange | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const draftRef = useRef(draft)
  const identifyingRef = useRef(false)
  const registeringRef = useRef(false)
  const evidenceUrlsRef = useRef(new Set<string>())
  const notifications = useNotifications()
  const { handleError } = useGlobalError()

  const {
    data: workers = [],
    isLoading: isLoadingWorkers,
    isError: isWorkersError,
  } = useGetAssignableWorkersQuery()

  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    isError: isProvidersError,
  } = useGetProvidersQuery()

  const {
    data: availableItemsPage,
    isFetching: isLoadingAvailableItems,
    isError: isAvailableItemsError,
  } = useGetAvailableModelItemsQuery(
    selectedModel
      ? {
          modelId: selectedModel.modelId,
          page: availableItemsPageIndex,
        }
      : skipToken
  )

  const [
    loadSpecificModels,
    { data: models = [], isFetching: isLoadingSpecificModels },
  ] = useLazyGetTelecommunicationModelsSelectionQuery()
  const [
    loadGenericModels,
    { data: genericModels = [], isFetching: isLoadingGenericModels },
  ] = useLazyGetTelecommunicationModelsSelectionQuery()
  const [
    loadGenericIdentifiers,
    { data: genericIdentifiers = [], isFetching: isLoadingGenericIdentifiers },
  ] = useLazyGetModelIdentifiersQuery()

  const [identifyProduct, { isLoading: isIdentifying }] =
    useIdentifyProductMutation()
  const [registerAssignment, { isLoading: isRegistering }] =
    useRegisterAssignmentMutation()

  const activeProviders = providers.filter((provider) => provider.active)
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === providerId
  )
  const selectedProviderId = selectedProvider?.id
  const modelsLoading = isLoadingSpecificModels || isLoadingGenericModels

  async function handleProductTypeChange(nextProductType: ProductType) {
    if (selectedProviderId === undefined) return

    setProductType(nextProductType)
    setSelectedModel(null)
    setSelectedGenericModel(null)
    setSelectedGenericIdentifierId("")
    setGenericQuantity(1)
    setAvailableItemsPageIndex(0)
    setSelectedAvailableItems(new Map())

    try {
      if (nextProductType === "SPECIFIC") {
        await loadSpecificModels({
          providerId: selectedProviderId,
          modelType: "SPECIFIC",
          operationType: "ASSIGNMENT",
        }).unwrap()
      } else {
        await loadGenericModels({
          providerId: selectedProviderId,
          modelType: "GENERIC",
          operationType: "ASSIGNMENT",
        }).unwrap()
      }
    } catch (error) {
      handleError(error, "No se pudieron cargar los modelos disponibles.")
    }
  }

  const hasPreparedItems =
    draft.specificProducts.length > 0 || draft.consumables.length > 0
  const hasUnsavedData =
    hasPreparedItems ||
    draft.generalEvidence.length > 0 ||
    Boolean(draft.notes.trim())

  const operationReady = Boolean(
    draft.worker && selectedProviderId !== undefined
  )

  const scannerEnabled = operationReady && !isIdentifying && !isRegistering
  const blocker = useBlocker(hasUnsavedData)

  const replaceDraft = useCallback((nextDraft: AssignmentDraft) => {
    draftRef.current = nextDraft
    setDraft(nextDraft)
  }, [])

  const updateDraft = useCallback(
    (updater: (current: AssignmentDraft) => AssignmentDraft) => {
      replaceDraft(updater(draftRef.current))
    },
    [replaceDraft]
  )

  const revokeEvidence = useCallback((evidence: LocalEvidence) => {
    if (evidenceUrlsRef.current.delete(evidence.previewUrl)) {
      URL.revokeObjectURL(evidence.previewUrl)
    }
  }, [])

  const revokeDraftEvidence = useCallback(
    (currentDraft: AssignmentDraft) => {
      currentDraft.generalEvidence.forEach(revokeEvidence)
      currentDraft.specificProducts.forEach((item) =>
        item.evidence.forEach(revokeEvidence)
      )
      currentDraft.consumables.forEach((item) =>
        item.evidence.forEach(revokeEvidence)
      )
    },
    [revokeEvidence]
  )

  const createEvidence = useCallback((files: File[]) => {
    return files.map((file): LocalEvidence => {
      const previewUrl = URL.createObjectURL(file)
      evidenceUrlsRef.current.add(previewUrl)
      return {
        localId: createLocalId("evidence"),
        file,
        previewUrl,
        status: "LOCAL",
      }
    })
  }, [])

  const clearPreparedContent = useCallback(() => {
    revokeDraftEvidence(draftRef.current)
    replaceDraft({
      ...draftRef.current,
      notes: "",
      specificProducts: [],
      consumables: [],
      generalEvidence: [],
    })
  }, [replaceDraft, revokeDraftEvidence])

  useEffect(() => {
    const evidenceUrls = evidenceUrlsRef.current

    return () => {
      evidenceUrls.forEach((url) => URL.revokeObjectURL(url))
      evidenceUrls.clear()
    }
  }, [])

  useEffect(() => {
    if (!hasUnsavedData) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedData])

  useEffect(() => {
    setProductType(null)
    setSelectedModel(null)
    setSelectedGenericModel(null)
    setSelectedGenericIdentifierId("")
    setGenericQuantity(1)
    setAvailableItemsPageIndex(0)
    setSelectedAvailableItems(new Map())
  }, [providerId])

  function handleModelSelect(model: TelecommunicationModelSelectionResponse) {
    setSelectedModel(model)
    setAvailableItemsPageIndex(0)
    setSelectedAvailableItems(new Map())
  }

  function handleBackToModels() {
    setSelectedModel(null)
    setAvailableItemsPageIndex(0)
    setSelectedAvailableItems(new Map())
  }

  async function handleGenericModelSelect(
    model: TelecommunicationModelSelectionResponse
  ) {
    setSelectedGenericModel(model)
    setSelectedGenericIdentifierId("")
    setGenericQuantity(1)

    try {
      await loadGenericIdentifiers(model.modelId).unwrap()
    } catch (error) {
      handleError(
        error,
        "No se pudieron cargar los identificadores del modelo."
      )
    }
  }

  function handleGenericModelChange() {
    setSelectedGenericModel(null)
    setSelectedGenericIdentifierId("")
    setGenericQuantity(1)
  }

  function addGenericSelection() {
    if (!selectedGenericModel || !selectedGenericIdentifierId) return

    const identifier = genericIdentifiers.find(
      (item) => item.id === Number(selectedGenericIdentifierId)
    )
    if (!identifier) return

    const quantity = Math.max(1, genericQuantity)
    updateDraft((current) => {
      const existingItem = current.consumables.find(
        (item) =>
          item.telecommunicationGenericItemId ===
            selectedGenericModel.telecommunicationGenericItemId &&
          item.identifierId === identifier.id
      )

      if (existingItem) {
        return {
          ...current,
          consumables: current.consumables.map((item) =>
            item.draftId === existingItem.draftId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }

      return {
        ...current,
        consumables: [
          ...current.consumables,
          {
            draftId: `generic-${selectedGenericModel.telecommunicationGenericItemId}-${identifier.id}`,
            kind: "GENERIC",
            telecommunicationGenericItemId:
              selectedGenericModel.telecommunicationGenericItemId,
            modelId: selectedGenericModel.modelId,
            modelName: selectedGenericModel.name,
            identifierId: identifier.id,
            identifierCode: identifier.code,
            quantity,
            evidence: [],
          },
        ],
      }
    })
    setSelectedGenericIdentifierId("")
    setGenericQuantity(1)
    notifications.success(
      `${selectedGenericModel.name} añadido a la preparación.`
    )
  }

  function toggleAvailableItem(
    item: TelecommunicationItemSelectionResponse,
    checked: boolean
  ) {
    setSelectedAvailableItems((current) => {
      const next = new Map(current)

      if (checked) {
        next.set(item.id, item)
      } else {
        next.delete(item.id)
      }

      return next
    })
  }

  function addSelectedAvailableItems() {
    if (!selectedModel || !availableItemsPage) return

    const selectedItems = Array.from(selectedAvailableItems.values())
    const existingItemIds = new Set(
      draftRef.current.specificProducts.map(
        (item) => item.telecommunicationItemId
      )
    )
    const newItems = selectedItems.filter(
      (item) => !existingItemIds.has(item.id)
    )

    if (newItems.length === 0) {
      notifications.notify(
        "Los productos seleccionados ya están en la preparación.",
        "warning"
      )
      return
    }

    updateDraft((current) => ({
      ...current,
      specificProducts: [
        ...current.specificProducts,
        ...newItems.map((item): AssignmentSpecificProductDraft => ({
          draftId: `specific-${item.id}`,
          kind: "SPECIFIC",
          telecommunicationItemId: item.id,
          modelId: selectedModel.modelId,
          modelName: selectedModel.name,
          identifierId: item.identifierId,
          identifierCode: item.identifier,
          uniqueCode: item.uniqueCode,
          uniqueCodeType:
            item.uniqueCodeType as AssignmentSpecificProductDraft["uniqueCodeType"],
          status: "AVAILABLE",
          evidence: [],
        })),
      ],
    }))
    setSelectedAvailableItems(new Map())
    notifications.success(
      `${newItems.length} producto${newItems.length === 1 ? "" : "s"} añadido${
        newItems.length === 1 ? "" : "s"
      } a la preparación.`
    )
  }

  function addIdentificationResult(result: IdentificationResponse) {
    if (result.model.productType === "SPECIFIC") {
      if (
        result.telecommunicationItemId === null ||
        !result.unitCode.code ||
        !result.unitCode.productType
      ) {
        notifications.error(
          "La unidad identificada no contiene los datos necesarios para asignarla."
        )
        return
      }

      if (result.unitCode.status !== "AVAILABLE") {
        notifications.error(
          "La unidad identificada no está disponible para una asignación."
        )
        return
      }

      const duplicate = draftRef.current.specificProducts.some(
        (item) =>
          item.telecommunicationItemId === result.telecommunicationItemId
      )

      if (duplicate) {
        notifications.notify(
          `La unidad ${result.unitCode.code} ya está en la preparación.`,
          "warning"
        )
        return
      }

      const nextItem: AssignmentSpecificProductDraft = {
        draftId: `specific-${result.telecommunicationItemId}`,
        kind: "SPECIFIC",
        telecommunicationItemId: result.telecommunicationItemId,
        modelId: result.model.id,
        modelName: result.model.name,
        identifierId: result.identifier.id,
        identifierCode: result.identifier.code,
        uniqueCode: result.unitCode.code,
        uniqueCodeType: result.unitCode.productType,
        status: result.unitCode.status,
        evidence: [],
      }

      updateDraft((current) => ({
        ...current,
        specificProducts: [...current.specificProducts, nextItem],
      }))
      notifications.success(`${result.model.name} añadido a la preparación.`)
      return
    }

    const genericId = result.telecommunicationGenericItemId

    if (genericId === null) {
      notifications.error(
        "El producto genérico no tiene un inventario disponible para asignar."
      )
      return
    }

    const existingItem = draftRef.current.consumables.find(
      (item) => item.telecommunicationGenericItemId === genericId
    )

    if (existingItem && existingItem.identifierId !== result.identifier.id) {
      notifications.notify(
        "Este producto ya está preparado con otro identificador.",
        "warning"
      )
      return
    }

    const scannedQuantity = Math.max(1, result.quantity ?? 1)

    if (existingItem) {
      updateDraft((current) => ({
        ...current,
        consumables: current.consumables.map((item) =>
          item.draftId === existingItem.draftId
            ? { ...item, quantity: item.quantity + scannedQuantity }
            : item
        ),
      }))
    } else {
      const nextItem: AssignmentConsumableDraft = {
        draftId: `generic-${genericId}`,
        kind: "GENERIC",
        telecommunicationGenericItemId: genericId,
        modelId: result.model.id,
        modelName: result.model.name,
        identifierId: result.identifier.id,
        identifierCode: result.identifier.code,
        quantity: scannedQuantity,
        evidence: [],
      }

      updateDraft((current) => ({
        ...current,
        consumables: [...current.consumables, nextItem],
      }))
    }

    notifications.success(`${result.model.name} añadido a la preparación.`)
  }

  async function handleScanCode(rawCode: string) {
    const normalizedCode = rawCode.trim()

    if (!draftRef.current.worker || selectedProviderId === undefined) {
      notifications.error(
        "Selecciona un trabajador y un proveedor antes de utilizar el escáner."
      )
      return
    }

    if (!normalizedCode) {
      notifications.error("El código escaneado está vacío.")
      return
    }

    if (identifyingRef.current || registeringRef.current) {
      notifications.notify(
        "Espera a que termine la operación actual.",
        "warning"
      )
      return
    }

    identifyingRef.current = true

    try {
      const result = await identifyProduct({
        operationType: "ASSIGNMENT",
        providerId: selectedProviderId,
        rawCode: normalizedCode,
      }).unwrap()
      addIdentificationResult(result)
    } catch (error) {
      handleError(error, "No se pudo identificar el código escaneado.")
    } finally {
      identifyingRef.current = false
    }
  }

  useInventoryScanner({
    onScanCode: handleScanCode,
    enabled: scannerEnabled,
  })

  function requestWorkerChange(nextWorkerId: string | null) {
    const value = nextWorkerId ?? ""
    if (String(draft.worker?.id ?? "") === value) return

    if (hasUnsavedData) {
      setPendingSelection({ kind: "worker", value })
      return
    }

    applyWorker(value)
  }

  function applyWorker(value: string) {
    const worker = workers.find((item) => String(item.id) === value)
    const workerOption: WorkerOption | null = worker
      ? { id: worker.id, name: worker.username }
      : null
    updateDraft((current) => ({ ...current, worker: workerOption }))
  }

  function requestProviderChange(nextProviderId: string | null) {
    const value = nextProviderId ?? ""
    if (providerId === value) return

    if (hasUnsavedData) {
      setPendingSelection({ kind: "provider", value })
      return
    }

    setProviderId(value)
  }

  function confirmSelectionChange() {
    if (!pendingSelection) return

    clearPreparedContent()
    if (pendingSelection.kind === "worker") {
      applyWorker(pendingSelection.value)
    } else {
      setProviderId(pendingSelection.value)
    }
    setPendingSelection(null)
  }

  function removeSpecific(draftId: string) {
    const target = draftRef.current.specificProducts.find(
      (item) => item.draftId === draftId
    )
    target?.evidence.forEach(revokeEvidence)
    updateDraft((current) => ({
      ...current,
      specificProducts: current.specificProducts.filter(
        (item) => item.draftId !== draftId
      ),
    }))
  }

  function removeConsumable(draftId: string) {
    const target = draftRef.current.consumables.find(
      (item) => item.draftId === draftId
    )
    target?.evidence.forEach(revokeEvidence)
    updateDraft((current) => ({
      ...current,
      consumables: current.consumables.filter(
        (item) => item.draftId !== draftId
      ),
    }))
  }

  function changeConsumableQuantity(draftId: string, quantity: number) {
    if (quantity < 1) return
    updateDraft((current) => ({
      ...current,
      consumables: current.consumables.map((item) =>
        item.draftId === draftId ? { ...item, quantity } : item
      ),
    }))
  }

  function addSpecificEvidence(draftId: string, files: File[]) {
    const evidence = createEvidence(files)
    updateDraft((current) => ({
      ...current,
      specificProducts: current.specificProducts.map((item) =>
        item.draftId === draftId
          ? { ...item, evidence: [...item.evidence, ...evidence] }
          : item
      ),
    }))
  }

  function removeSpecificEvidence(draftId: string, localId: string) {
    const target = draftRef.current.specificProducts
      .find((item) => item.draftId === draftId)
      ?.evidence.find((item) => item.localId === localId)
    if (target) revokeEvidence(target)
    updateDraft((current) => ({
      ...current,
      specificProducts: current.specificProducts.map((item) =>
        item.draftId === draftId
          ? {
              ...item,
              evidence: item.evidence.filter(
                (evidence) => evidence.localId !== localId
              ),
            }
          : item
      ),
    }))
  }

  function addConsumableEvidence(draftId: string, files: File[]) {
    const evidence = createEvidence(files)
    updateDraft((current) => ({
      ...current,
      consumables: current.consumables.map((item) =>
        item.draftId === draftId
          ? { ...item, evidence: [...item.evidence, ...evidence] }
          : item
      ),
    }))
  }

  function removeConsumableEvidence(draftId: string, localId: string) {
    const target = draftRef.current.consumables
      .find((item) => item.draftId === draftId)
      ?.evidence.find((item) => item.localId === localId)
    if (target) revokeEvidence(target)
    updateDraft((current) => ({
      ...current,
      consumables: current.consumables.map((item) =>
        item.draftId === draftId
          ? {
              ...item,
              evidence: item.evidence.filter(
                (evidence) => evidence.localId !== localId
              ),
            }
          : item
      ),
    }))
  }

  function addGeneralEvidence(files: File[]) {
    const evidence = createEvidence(files)
    updateDraft((current) => ({
      ...current,
      generalEvidence: [...current.generalEvidence, ...evidence],
    }))
  }

  function removeGeneralEvidence(localId: string) {
    const target = draftRef.current.generalEvidence.find(
      (item) => item.localId === localId
    )
    if (target) revokeEvidence(target)
    updateDraft((current) => ({
      ...current,
      generalEvidence: current.generalEvidence.filter(
        (item) => item.localId !== localId
      ),
    }))
  }

  async function handleRegisterAssignment() {
    if (!operationReady || !hasPreparedItems || registeringRef.current) return

    const operation = buildAssignmentOperation(draftRef.current)
    if (!operation) {
      notifications.error("Selecciona el trabajador de la asignación.")
      return
    }

    registeringRef.current = true
    try {
      await registerAssignment(operation).unwrap()
      revokeDraftEvidence(draftRef.current)
      replaceDraft(initialAssignmentDraft)
      setProviderId("")
      notifications.success("Asignación guardada correctamente.")
    } catch (error) {
      handleError(error, "No se pudo guardar la asignación.")
    } finally {
      registeringRef.current = false
    }
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Asignaciones">
      <InventoryPageHeader
        title="Asignaciones"
        description="Prepara las asignaciones de productos."
      />

      <section className="flex w-full flex-col gap-4 lg:flex-row lg:items-start">
        <article className="w-full min-w-0 rounded border p-4 lg:flex-1">
          <Stepper orientation="vertical">
            <StepperNav className="w-full">
              <WorkflowStep title="Trabajador" number={1}>
                <label className="min-w-0 text-xs font-medium">
                  <Select
                    value={draft.worker ? String(draft.worker.id) : ""}
                    onValueChange={requestWorkerChange}
                  >
                    <SelectTrigger
                      className="mt-2 h-9 w-full min-w-0"
                      disabled={
                        isLoadingWorkers || isIdentifying || isRegistering
                      }
                    >
                      <UserRound className="size-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecciona un trabajador">
                        {draft.worker?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start">
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={String(worker.id)}>
                          {worker.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </WorkflowStep>
              <Collapsible open={Boolean(draft.worker)}>
                <CollapsibleContent>
                  <WorkflowStep title="Proveedor" number={2}>
                    <label className="min-w-0 text-xs font-medium">
                      <Select
                        value={providerId}
                        onValueChange={requestProviderChange}
                      >
                        <SelectTrigger
                          className="mt-1 h-9 w-full min-w-0"
                          disabled={
                            !draft.worker ||
                            isLoadingProviders ||
                            isIdentifying ||
                            isRegistering
                          }
                        >
                          <Truck className="size-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecciona un proveedor">
                            {selectedProvider?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="start">
                          {activeProviders.map((provider) => (
                            <SelectItem
                              key={provider.id}
                              value={String(provider.id)}
                            >
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </WorkflowStep>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={Boolean(selectedProvider)}>
                <CollapsibleContent>
                  <WorkflowStep title="Tipo de producto" number={3}>
                    <FieldSet>
                      <legend className="sr-only">Tipo de producto</legend>
                      <nav
                        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                        aria-label="Selecciona el tipo de producto"
                      >
                        <Button
                          type="button"
                          variant={
                            productType === "SPECIFIC" ? "default" : "outline"
                          }
                          aria-pressed={productType === "SPECIFIC"}
                          disabled={modelsLoading}
                          onClick={() =>
                            void handleProductTypeChange("SPECIFIC")
                          }
                        >
                          <Package />
                          Productos
                        </Button>
                        <Button
                          type="button"
                          variant={
                            productType === "GENERIC" ? "default" : "outline"
                          }
                          aria-pressed={productType === "GENERIC"}
                          disabled={modelsLoading}
                          onClick={() =>
                            void handleProductTypeChange("GENERIC")
                          }
                        >
                          <Package />
                          Genéricos
                        </Button>
                      </nav>
                    </FieldSet>
                  </WorkflowStep>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={productType === "SPECIFIC"}>
                <CollapsibleContent>
                  <WorkflowStep title="Selección de productos" number={4} last>
                    {selectedModel ? (
                      <>
                        {isAvailableItemsError ? (
                          <div className="mt-3 space-y-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleBackToModels}
                            >
                              <ArrowLeft />
                              Volver a modelos
                            </Button>
                            <Alert variant="destructive">
                              <Info />
                              <AlertTitle>
                                No se pudieron cargar los productos
                              </AlertTitle>
                              <AlertDescription>
                                Inténtalo de nuevo seleccionando el modelo.
                              </AlertDescription>
                            </Alert>
                          </div>
                        ) : (
                          <AvailableItemsBrowser
                            items={availableItemsPage?.content ?? []}
                            selectedItems={selectedAvailableItems}
                            preparedItemIds={
                              new Set(
                                draft.specificProducts.map(
                                  (item) => item.telecommunicationItemId
                                )
                              )
                            }
                            isLoading={isLoadingAvailableItems}
                            page={(availableItemsPage?.number ?? 0) + 1}
                            pageSize={availableItemsPage?.size ?? 10}
                            totalPages={availableItemsPage?.totalPages ?? 1}
                            totalElements={
                              availableItemsPage?.totalElements ?? 0
                            }
                            onPageChange={(page) =>
                              setAvailableItemsPageIndex(page - 1)
                            }
                            onToggleItem={toggleAvailableItem}
                            onBack={handleBackToModels}
                            onAddSelected={addSelectedAvailableItems}
                          />
                        )}
                      </>
                    ) : (
                      <ProductModelsBrowser
                        items={models}
                        onSelectModel={handleModelSelect}
                      />
                    )}
                  </WorkflowStep>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={productType === "GENERIC"}>
                <CollapsibleContent>
                  <WorkflowStep title="Selección de genéricos" number={4} last>
                    <GenericModelsBrowser
                      models={genericModels}
                      selectedModel={selectedGenericModel}
                      identifiers={genericIdentifiers}
                      selectedIdentifierId={selectedGenericIdentifierId}
                      quantity={genericQuantity}
                      isLoadingIdentifiers={isLoadingGenericIdentifiers}
                      onSelectModel={(model) =>
                        void handleGenericModelSelect(model)
                      }
                      onChangeModel={handleGenericModelChange}
                      onSelectIdentifier={setSelectedGenericIdentifierId}
                      onQuantityChange={setGenericQuantity}
                      onAdd={addGenericSelection}
                    />
                  </WorkflowStep>
                </CollapsibleContent>
              </Collapsible>
            </StepperNav>
          </Stepper>
        </article>
        <AssignmentPreparationArea
          draft={draft}
          scannerEnabled={scannerEnabled}
          operationReady={operationReady}
          isIdentifying={isIdentifying}
          isRegistering={isRegistering}
          onRequestClear={() => setClearDialogOpen(true)}
          onRemoveSpecific={removeSpecific}
          onRemoveConsumable={removeConsumable}
          onChangeConsumableQuantity={changeConsumableQuantity}
          onAddSpecificEvidence={addSpecificEvidence}
          onRemoveSpecificEvidence={removeSpecificEvidence}
          onAddConsumableEvidence={addConsumableEvidence}
          onRemoveConsumableEvidence={removeConsumableEvidence}
          onNotesChange={(notes) =>
            updateDraft((current) => ({ ...current, notes }))
          }
          onAddGeneralEvidence={addGeneralEvidence}
          onRemoveGeneralEvidence={removeGeneralEvidence}
          onRegister={() => void handleRegisterAssignment()}
        />
      </section>

      <ConfirmationDialog
        open={clearDialogOpen}
        title="Limpiar área de preparación"
        description="Se eliminarán los productos, la nota y todas las imágenes locales. Esta acción no se puede deshacer."
        confirmLabel="Limpiar área"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={() => {
          clearPreparedContent()
          setClearDialogOpen(false)
        }}
      />

      <ConfirmationDialog
        open={pendingSelection !== null}
        title="Cambiar la asignación"
        description="Para cambiar el trabajador o el proveedor es necesario limpiar los productos y evidencias preparados."
        confirmLabel="Limpiar y cambiar"
        onCancel={() => setPendingSelection(null)}
        onConfirm={confirmSelectionChange}
      />

      <ConfirmationDialog
        open={blocker.state === "blocked"}
        title="Asignación sin guardar"
        description="Si abandonas esta pantalla perderás los productos, la nota y las imágenes preparadas."
        confirmLabel="Abandonar página"
        onCancel={() => {
          if (blocker.state === "blocked") blocker.reset()
        }}
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed()
        }}
      />
    </section>
  )
}
