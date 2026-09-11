import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createColumnHelper, type ReactTable } from "@tanstack/react-table"
import {
  Archive,
  CalendarDays,
  Info,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  ScanLine,
  UserRound,
} from "lucide-react"
import { useDispatch } from "react-redux"
import { useBlocker } from "react-router-dom"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
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
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useRegisterReturnMutation,
  type MultipartAttachment,
  type MultipartOperation,
  type ReturnTelecommunicationsItemsRequest,
} from "@/features/inventory/api/operations.service"
import {
  assignmentApi,
  useGetAssignableWorkersQuery,
  useGetReturnAssignmentDetailQuery,
  useGetReturnAssignmentsByAccountQuery,
} from "@/features/inventory/assignment/api/assignmentApi"
import type {
  AssignmentGenericItemResponse,
  AssignmentGenericModelResponse,
  AssignmentSpecificItemResponse,
  AssignmentSpecificModelResponse,
  AssignmentSummaryResponse,
} from "@/features/inventory/assignment/types/assignment-api.types"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useGlobalError } from "@/hooks"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from "@/components/reui/stepper"
import { ReturnDraftList } from "../components/ReturnDraftList"
import type {
  ReturnDraft,
  ReturnLocalEvidence,
  ReturnSpecificDraftItem,
} from "../types"

type ReturnCategory = "SPECIFIC" | "GENERIC"

type ModelOption =
  | {
      key: string
      kind: "SPECIFIC"
      model: AssignmentSpecificModelResponse
    }
  | {
      key: string
      kind: "GENERIC"
      model: AssignmentGenericModelResponse
    }

type PendingContextChange =
  | { kind: "worker"; id: number | null }
  | { kind: "assignment"; id: number | null }

type ConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

type WorkflowStepProps = {
  number: number
  title: string
  open: boolean
  last?: boolean
  children: React.ReactNode
}

const initialDraft: ReturnDraft = {
  specificItems: [],
  genericItems: [],
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function quantityLabel(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function createLocalEvidence(files: File[]) {
  return files.map((file): ReturnLocalEvidence => {
    const suffix =
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    return {
      localId: `return-evidence-${suffix}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }
  })
}

function collectEvidence(
  prefix: string,
  evidence: ReturnLocalEvidence[],
  attachments: MultipartAttachment[]
) {
  return evidence.map((item, index) => {
    const key = `${prefix}-${index}`
    attachments.push({ key, file: item.file })
    return key
  })
}

function buildReturnOperation(
  assignmentId: number,
  draft: ReturnDraft
): MultipartOperation<ReturnTelecommunicationsItemsRequest> {
  const attachments: MultipartAttachment[] = []

  return {
    request: {
      assigmentId: assignmentId,
      imageKeys: [],
      specificItems: draft.specificItems.map((item) => ({
        assignmentTelecommunicationItemId:
          item.assignmentTelecommunicationItemId,
        telecommunicationItemId: item.telecommunicationItemId,
        imageKeys: collectEvidence(
          `return-specific-${item.telecommunicationItemId}`,
          item.evidence,
          attachments
        ),
      })),
      genericItems: draft.genericItems.map((item) => ({
        assignmentTelecommunicationGenericItemId:
          item.assignmentTelecommunicationGenericItemId,
        telecommunicationGenericItemId: item.telecommunicationGenericItemId,
        quantity: item.quantity,
        imageKeys: collectEvidence(
          `return-generic-${item.telecommunicationGenericItemId}`,
          item.evidence,
          attachments
        ),
      })),
    },
    attachments,
  }
}

function WorkflowStep({
  number,
  title,
  open,
  last = false,
  children,
}: WorkflowStepProps) {
  return (
    <StepperItem step={number} className="!block !flex-none">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
        <div className="flex flex-col items-center">
          <StepperIndicator>{number}</StepperIndicator>
          {!last ? (
            <StepperSeparator className="!m-0 !h-auto min-h-5 flex-1" />
          ) : null}
        </div>
        <Collapsible open={open} className="min-w-0">
          <StepperTitle className="mb-2 pt-1">{title}</StepperTitle>
          <CollapsibleContent className={last ? undefined : "pb-5"}>
            {children}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </StepperItem>
  )
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
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

function AssignmentCard({
  assignment,
  selected = false,
  onSelect,
}: {
  assignment: AssignmentSummaryResponse
  selected?: boolean
  onSelect?: () => void
}) {
  const specificCount = assignment.specificItemCount ?? 0
  const genericCount = assignment.genericQuantity ?? 0
  const content = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="flex items-center text-xs gap-2 font-semibold">
            <CalendarDays className="size-4 text-muted-foreground" />
            Asignación #{assignment.id}
          </span>
          <time
            dateTime={assignment.dateAssigned}
            className="mt-1 block text-xs text-muted-foreground"
          >
            {formatDate(assignment.dateAssigned)}
          </time>
        </span>
        <span className="rounded bg-muted px-2 py-1 text-sm font-semibold">
          {specificCount + genericCount}
        </span>
      </span>
      <span className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="secondary">
          <Archive /> {quantityLabel(specificCount)}
        </Badge>
        <Badge variant="secondary">
          <Package /> {quantityLabel(genericCount)}
        </Badge>
      </span>
      {assignment.notes ? (
        <span className="mt-2 line-clamp-2 block text-xs text-muted-foreground">
          {assignment.notes}
        </span>
      ) : null}
    </>
  )

  if (!onSelect) {
    return (
      <article className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        {content}
      </article>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none ${
        selected
          ? "border-primary bg-primary/5"
          : "bg-card hover:border-primary/40 hover:bg-muted/30"
      }`}
      onClick={onSelect}
    >
      {content}
    </button>
  )
}

function TableSearch({
  table,
  placeholder,
}: {
  table:
    | ReactTable<DataTableFeatures, AssignmentSpecificItemResponse>
    | ReactTable<DataTableFeatures, AssignmentGenericItemResponse>
  placeholder: string
}) {
  return (
    <Input
      type="search"
      value={String(table.state.globalFilter ?? "")}
      placeholder={placeholder}
      className="w-full sm:max-w-sm"
      onChange={(event) => table.setGlobalFilter(event.target.value)}
    />
  )
}

const specificColumnHelper = createColumnHelper<
  DataTableFeatures,
  AssignmentSpecificItemResponse
>()

function SpecificItemsTable({
  model,
  selectedIds,
  preparedIds,
  onToggle,
}: {
  model: AssignmentSpecificModelResponse
  selectedIds: Set<number>
  preparedIds: Set<number>
  onToggle: (item: AssignmentSpecificItemResponse) => void
}) {
  const columns = useMemo(
    () =>
      specificColumnHelper.columns([
        specificColumnHelper.display({
          id: "selection",
          header: "",
          cell: ({ row }) => {
            const item = row.original
            const id = item.assignmentTelecommunicationItemId
            const prepared = preparedIds.has(id)
            const returnable = !prepared

            return (
              <input
                type="checkbox"
                checked={prepared || selectedIds.has(id)}
                disabled={!returnable}
                aria-label={`Seleccionar ${item.uniqueCode ?? "unidad"}`}
                className="size-4 accent-primary"
                onChange={() => onToggle(item)}
              />
            )
          },
          size: 44,
          minSize: 44,
          enableSorting: false,
        }),
        specificColumnHelper.accessor("identifierCode", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Identificador" />
          ),
          cell: ({ row }) =>
            row.original.identifierCode ?? (
              <span className="text-muted-foreground">Sin identificador</span>
            ),
          size: 170,
          minSize: 150,
        }),
        specificColumnHelper.accessor("uniqueCode", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Código único" />
          ),
          cell: ({ row }) => (
            <span className="font-medium break-all">
              {row.original.uniqueCode ?? "Sin código"}
            </span>
          ),
          size: 210,
          minSize: 180,
        }),
        specificColumnHelper.accessor("uniqueCodeType", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tipo" />
          ),
          cell: ({ row }) => row.original.uniqueCodeType ?? "—",
          size: 90,
          minSize: 80,
        }),
        specificColumnHelper.accessor("status", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Estado" />
          ),
          cell: ({ row }) => {
            const prepared = preparedIds.has(
              row.original.assignmentTelecommunicationItemId
            )
            const assigned = row.original.status === "ASSIGNED"
            return (
              <Badge
                variant="outline"
                className={
                  prepared || assigned
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground"
                }
              >
                {prepared
                  ? "Preparado"
                  : assigned
                    ? "Retornable"
                    : (row.original.status ?? "Sin estado")}
              </Badge>
            )
          },
          size: 120,
          minSize: 110,
        }),
      ]),
    [onToggle, preparedIds, selectedIds]
  )

  return (
    <DataTable
      data={model.items}
      columns={columns}
      getRowId={(item) => String(item.assignmentTelecommunicationItemId)}
      pageSize={6}
      pageSizeOptions={[6, 10]}
      ariaLabel={`Unidades asignadas de ${model.modelName}`}
      emptyMessage="Este modelo no tiene unidades retornables."
      onRowClick={onToggle}
      renderToolbar={(table) => (
        <TableSearch table={table} placeholder="Buscar código o identificador" />
      )}
    />
  )
}

const genericColumnHelper = createColumnHelper<
  DataTableFeatures,
  AssignmentGenericItemResponse
>()

function GenericItemsTable({
  model,
  pendingQuantities,
  preparedQuantities,
  onChangeQuantity,
}: {
  model: AssignmentGenericModelResponse
  pendingQuantities: Map<number, number>
  preparedQuantities: Map<number, number>
  onChangeQuantity: (
    item: AssignmentGenericItemResponse,
    quantity: number
  ) => void
}) {
  const columns = useMemo(
    () =>
      genericColumnHelper.columns([
        genericColumnHelper.accessor("identifierCode", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Identificador" />
          ),
          cell: ({ row }) => (
            <span className="font-medium break-all">
              {row.original.identifierCode ?? "Sin identificador"}
            </span>
          ),
          size: 220,
          minSize: 180,
        }),
        genericColumnHelper.accessor("quantity", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Asignadas" />
          ),
          cell: ({ row }) =>
            quantityLabel(Math.max(0, row.original.quantity ?? 0)),
          size: 120,
          minSize: 110,
        }),
        genericColumnHelper.display({
          id: "preparedQuantity",
          header: "Seleccionar",
          cell: ({ row }) => {
            const item = row.original
            const id = item.assignmentTelecommunicationGenericItemId
            const pending = pendingQuantities.get(id) ?? 0
            const prepared = preparedQuantities.get(id) ?? 0
            const maximum = Math.max(0, item.quantity ?? 0)
            const remaining = Math.max(0, maximum - prepared)

            return (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={pending <= 0}
                  aria-label={`Reducir cantidad de ${model.modelName}`}
                  onClick={() => onChangeQuantity(item, pending - 1)}
                >
                  <Minus />
                </Button>
                <span className="min-w-20 text-center text-sm font-semibold">
                  {pending} / {remaining}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={remaining === 0 || pending >= remaining}
                  aria-label={`Aumentar cantidad de ${model.modelName}`}
                  onClick={() => onChangeQuantity(item, pending + 1)}
                >
                  <Plus />
                </Button>
              </div>
            )
          },
          size: 210,
          minSize: 200,
          enableSorting: false,
        }),
      ]),
    [model.modelName, onChangeQuantity, pendingQuantities, preparedQuantities]
  )

  return (
    <DataTable
      data={model.items}
      columns={columns}
      getRowId={(item) => String(item.assignmentTelecommunicationGenericItemId)}
      pageSize={6}
      pageSizeOptions={[6, 10]}
      ariaLabel={`Consumibles asignados de ${model.modelName}`}
      emptyMessage="Este modelo no tiene consumibles retornables."
      renderToolbar={(table) => (
        <TableSearch table={table} placeholder="Buscar identificador" />
      )}
    />
  )
}

export function ReturnPage() {
  const [workerId, setWorkerId] = useState<number | null>(null)
  const [assignmentId, setAssignmentId] = useState<number | null>(null)
  const [category, setCategory] = useState<ReturnCategory | null>(null)
  const [activeModelKey, setActiveModelKey] = useState<string | null>(null)
  const [selectedSpecificIds, setSelectedSpecificIds] = useState<Set<number>>(
    new Set()
  )
  const [pendingGenericQuantities, setPendingGenericQuantities] = useState<
    Map<number, number>
  >(new Map())
  const [draft, setDraft] = useState<ReturnDraft>(initialDraft)
  const [pendingContext, setPendingContext] =
    useState<PendingContextChange | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const draftRef = useRef(draft)
  const evidenceUrlsRef = useRef(new Set<string>())
  const registeringRef = useRef(false)
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const dispatch = useDispatch()

  const {
    data: workers = [],
    isLoading: isLoadingWorkers,
    isError: isWorkersError,
  } = useGetAssignableWorkersQuery()
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    isFetching: isFetchingAssignments,
    isError: isAssignmentsError,
    refetch: refetchAssignments,
  } = useGetReturnAssignmentsByAccountQuery(workerId ?? 0, {
    skip: workerId === null,
    refetchOnMountOrArgChange: true,
  })
  const {
    data: assignmentDetail,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
  } = useGetReturnAssignmentDetailQuery(assignmentId ?? 0, {
    skip: assignmentId === null,
    refetchOnMountOrArgChange: true,
  })
  const [registerReturn, { isLoading: isRegistering }] =
    useRegisterReturnMutation()

  const hasPreparedItems =
    draft.specificItems.length > 0 || draft.genericItems.length > 0
  const blocker = useBlocker(hasPreparedItems)

  const replaceDraft = useCallback((nextDraft: ReturnDraft) => {
    draftRef.current = nextDraft
    setDraft(nextDraft)
  }, [])

  const updateDraft = useCallback(
    (updater: (current: ReturnDraft) => ReturnDraft) => {
      replaceDraft(updater(draftRef.current))
    },
    [replaceDraft]
  )

  const revokeEvidence = useCallback((evidence: ReturnLocalEvidence) => {
    evidenceUrlsRef.current.delete(evidence.previewUrl)
    URL.revokeObjectURL(evidence.previewUrl)
  }, [])

  const revokeDraftEvidence = useCallback(
    (currentDraft: ReturnDraft) => {
      currentDraft.specificItems.forEach((item) =>
        item.evidence.forEach(revokeEvidence)
      )
      currentDraft.genericItems.forEach((item) =>
        item.evidence.forEach(revokeEvidence)
      )
    },
    [revokeEvidence]
  )

  const clearDraft = useCallback(() => {
    revokeDraftEvidence(draftRef.current)
    replaceDraft(initialDraft)
  }, [replaceDraft, revokeDraftEvidence])

  const clearSelection = useCallback(() => {
    setSelectedSpecificIds(new Set())
    setPendingGenericQuantities(new Map())
  }, [])

  const resetDownstream = useCallback(() => {
    setCategory(null)
    setActiveModelKey(null)
    clearSelection()
  }, [clearSelection])

  const addEvidenceUrls = useCallback((files: File[]) => {
    const evidence = createLocalEvidence(files)
    evidence.forEach((item) => evidenceUrlsRef.current.add(item.previewUrl))
    return evidence
  }, [])

  useEffect(() => {
    const evidenceUrls = evidenceUrlsRef.current
    return () => {
      evidenceUrls.forEach((url) => URL.revokeObjectURL(url))
      evidenceUrls.clear()
    }
  }, [])

  useEffect(() => {
    if (!hasPreparedItems) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasPreparedItems])

  const detailAccountMismatch = Boolean(
    assignmentDetail &&
      assignmentDetail.id === assignmentId &&
      workerId !== null &&
      assignmentDetail.accountId !== workerId
  )

  const specificModels = useMemo<ModelOption[]>(() => {
    if (
      !assignmentDetail ||
      assignmentDetail.id !== assignmentId ||
      detailAccountMismatch
    ) {
      return []
    }

    return assignmentDetail.specificModels.map((model) => ({
      key: `specific-${model.modelId}`,
      kind: "SPECIFIC" as const,
      model,
    }))
  }, [assignmentDetail, assignmentId, detailAccountMismatch])

  const genericModels = useMemo<ModelOption[]>(() => {
    if (
      !assignmentDetail ||
      assignmentDetail.id !== assignmentId ||
      detailAccountMismatch
    ) {
      return []
    }

    return assignmentDetail.genericModels.map((model) => ({
      key: `generic-${model.modelId}`,
      kind: "GENERIC" as const,
      model,
    }))
  }, [assignmentDetail, assignmentId, detailAccountMismatch])

  const categoryModels = category === "SPECIFIC" ? specificModels : genericModels
  const activeModel =
    categoryModels.find((option) => option.key === activeModelKey) ?? null
  const selectedAssignment = assignments.find(
    (assignment) => assignment.id === assignmentId
  )
  const selectedWorker = workers.find((worker) => worker.id === workerId)

  const preparedSpecificIds = useMemo(
    () =>
      new Set(
        draft.specificItems.map(
          (item) => item.assignmentTelecommunicationItemId
        )
      ),
    [draft.specificItems]
  )
  const preparedGenericQuantities = useMemo(
    () =>
      new Map(
        draft.genericItems.map((item) => [
          item.assignmentTelecommunicationGenericItemId,
          item.quantity,
        ])
      ),
    [draft.genericItems]
  )

  function applyWorker(nextWorkerId: number | null) {
    setWorkerId(nextWorkerId)
    setAssignmentId(null)
    resetDownstream()
  }

  function applyAssignment(nextAssignmentId: number | null) {
    setAssignmentId(nextAssignmentId)
    resetDownstream()
  }

  function requestWorkerChange(value: string | null) {
    const nextWorkerId = value ? Number(value) : null
    if (nextWorkerId === workerId) return

    if (hasPreparedItems) {
      setPendingContext({ kind: "worker", id: nextWorkerId })
      return
    }

    applyWorker(nextWorkerId)
  }

  function requestAssignmentChange(nextAssignmentId: number | null) {
    if (nextAssignmentId === assignmentId) return

    if (hasPreparedItems) {
      setPendingContext({ kind: "assignment", id: nextAssignmentId })
      return
    }

    applyAssignment(nextAssignmentId)
  }

  function confirmContextChange() {
    if (!pendingContext) return

    clearDraft()
    if (pendingContext.kind === "worker") {
      applyWorker(pendingContext.id)
    } else {
      applyAssignment(pendingContext.id)
    }
    setPendingContext(null)
  }

  function selectCategory(nextCategory: ReturnCategory) {
    setCategory(nextCategory)
    setActiveModelKey(null)
    clearSelection()
  }

  function selectModel(modelKey: string) {
    setActiveModelKey(modelKey)
    clearSelection()
  }

  const toggleSpecificSelection = useCallback(
    (source: AssignmentSpecificItemResponse) => {
      const id = source.assignmentTelecommunicationItemId
      if (preparedSpecificIds.has(id)) return
      setSelectedSpecificIds((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [preparedSpecificIds]
  )

  const changePendingGenericQuantity = useCallback(
    (source: AssignmentGenericItemResponse, quantity: number) => {
      const id = source.assignmentTelecommunicationGenericItemId
      const assigned = Math.max(0, source.quantity ?? 0)
      const prepared = preparedGenericQuantities.get(id) ?? 0
      const remaining = Math.max(0, assigned - prepared)
      if (quantity < 0 || quantity > remaining) return

      setPendingGenericQuantities((current) => {
        const next = new Map(current)
        if (quantity === 0) next.delete(id)
        else next.set(id, quantity)
        return next
      })
    },
    [preparedGenericQuantities]
  )

  function addSpecificSelectionToDraft() {
    if (!activeModel || activeModel.kind !== "SPECIFIC") return

    const selectedItems = activeModel.model.items.filter((item) =>
      selectedSpecificIds.has(item.assignmentTelecommunicationItemId)
    )
    const invalidItem = selectedItems.find((item) => !item.uniqueCode)
    if (invalidItem) {
      notifications.error(
        "Una de las unidades seleccionadas no contiene los datos necesarios."
      )
      return
    }

    const nextItems = selectedItems.map(
      (source): ReturnSpecificDraftItem => ({
        draftId: `return-specific-${source.assignmentTelecommunicationItemId}`,
        kind: "SPECIFIC",
        assignmentTelecommunicationItemId:
          source.assignmentTelecommunicationItemId,
        telecommunicationItemId: source.telecommunicationItemId,
        modelId: activeModel.model.modelId,
        modelName: activeModel.model.modelName,
        identifierCode: source.identifierCode,
        uniqueCode: source.uniqueCode!,
        uniqueCodeType: source.uniqueCodeType,
        status: source.status,
        evidence: [],
      })
    )

    updateDraft((current) => ({
      ...current,
      specificItems: [...current.specificItems, ...nextItems],
    }))
    setSelectedSpecificIds(new Set())
  }

  function addGenericSelectionToDraft() {
    if (!activeModel || activeModel.kind !== "GENERIC") return

    const selectedItems = activeModel.model.items.filter(
      (item) =>
        (pendingGenericQuantities.get(
          item.assignmentTelecommunicationGenericItemId
        ) ?? 0) > 0
    )

    for (const source of selectedItems) {
      if (source.identifierId === null) {
        notifications.error(
          "Uno de los consumibles no contiene un identificador válido."
        )
        return
      }

      const incompatibleLine = draftRef.current.genericItems.find(
        (item) =>
          item.telecommunicationGenericItemId ===
            source.telecommunicationGenericItemId &&
          item.assignmentTelecommunicationGenericItemId !==
            source.assignmentTelecommunicationGenericItemId
      )
      if (incompatibleLine) {
        notifications.error(
          "Este inventario genérico ya está preparado desde otra línea de asignación."
        )
        return
      }
    }

    updateDraft((current) => {
      const nextGenericItems = [...current.genericItems]

      for (const source of selectedItems) {
        const addedQuantity =
          pendingGenericQuantities.get(
            source.assignmentTelecommunicationGenericItemId
          ) ?? 0
        const existingIndex = nextGenericItems.findIndex(
          (item) =>
            item.assignmentTelecommunicationGenericItemId ===
            source.assignmentTelecommunicationGenericItemId
        )

        if (existingIndex >= 0) {
          const existing = nextGenericItems[existingIndex]
          nextGenericItems[existingIndex] = {
            ...existing,
            quantity: Math.min(
              existing.assignedQuantity,
              existing.quantity + addedQuantity
            ),
          }
          continue
        }

        nextGenericItems.push({
          draftId: `return-generic-${source.assignmentTelecommunicationGenericItemId}`,
          kind: "GENERIC",
          assignmentTelecommunicationGenericItemId:
            source.assignmentTelecommunicationGenericItemId,
          telecommunicationGenericItemId:
            source.telecommunicationGenericItemId,
          modelId: activeModel.model.modelId,
          modelName: activeModel.model.modelName,
          identifierId: source.identifierId!,
          identifierCode: source.identifierCode,
          quantity: addedQuantity,
          assignedQuantity: Math.max(0, source.quantity ?? 0),
          evidence: [],
        })
      }

      return { ...current, genericItems: nextGenericItems }
    })
    setPendingGenericQuantities(new Map())
  }

  function removeSpecific(draftId: string) {
    const existing = draftRef.current.specificItems.find(
      (item) => item.draftId === draftId
    )
    existing?.evidence.forEach(revokeEvidence)
    updateDraft((current) => ({
      ...current,
      specificItems: current.specificItems.filter(
        (item) => item.draftId !== draftId
      ),
    }))
  }

  function removeGeneric(draftId: string) {
    const existing = draftRef.current.genericItems.find(
      (item) => item.draftId === draftId
    )
    existing?.evidence.forEach(revokeEvidence)
    updateDraft((current) => ({
      ...current,
      genericItems: current.genericItems.filter(
        (item) => item.draftId !== draftId
      ),
    }))
  }

  function changeGenericDraftQuantity(draftId: string, quantity: number) {
    const existing = draftRef.current.genericItems.find(
      (item) => item.draftId === draftId
    )
    if (!existing || quantity < 1 || quantity > existing.assignedQuantity) return

    updateDraft((current) => ({
      ...current,
      genericItems: current.genericItems.map((item) =>
        item.draftId === draftId ? { ...item, quantity } : item
      ),
    }))
  }

  function addSpecificEvidence(draftId: string, files: File[]) {
    const evidence = addEvidenceUrls(files)
    updateDraft((current) => ({
      ...current,
      specificItems: current.specificItems.map((item) =>
        item.draftId === draftId
          ? { ...item, evidence: [...item.evidence, ...evidence] }
          : item
      ),
    }))
  }

  function removeSpecificEvidence(draftId: string, localId: string) {
    const evidence = draftRef.current.specificItems
      .find((item) => item.draftId === draftId)
      ?.evidence.find((item) => item.localId === localId)
    if (evidence) revokeEvidence(evidence)
    updateDraft((current) => ({
      ...current,
      specificItems: current.specificItems.map((item) =>
        item.draftId === draftId
          ? {
              ...item,
              evidence: item.evidence.filter(
                (entry) => entry.localId !== localId
              ),
            }
          : item
      ),
    }))
  }

  function addGenericEvidence(draftId: string, files: File[]) {
    const evidence = addEvidenceUrls(files)
    updateDraft((current) => ({
      ...current,
      genericItems: current.genericItems.map((item) =>
        item.draftId === draftId
          ? { ...item, evidence: [...item.evidence, ...evidence] }
          : item
      ),
    }))
  }

  function removeGenericEvidence(draftId: string, localId: string) {
    const evidence = draftRef.current.genericItems
      .find((item) => item.draftId === draftId)
      ?.evidence.find((item) => item.localId === localId)
    if (evidence) revokeEvidence(evidence)
    updateDraft((current) => ({
      ...current,
      genericItems: current.genericItems.map((item) =>
        item.draftId === draftId
          ? {
              ...item,
              evidence: item.evidence.filter(
                (entry) => entry.localId !== localId
              ),
            }
          : item
      ),
    }))
  }

  async function handleRegisterReturn() {
    if (assignmentId === null || !hasPreparedItems || registeringRef.current) {
      return
    }

    registeringRef.current = true
    try {
      await registerReturn(
        buildReturnOperation(assignmentId, draftRef.current)
      ).unwrap()
      revokeDraftEvidence(draftRef.current)
      replaceDraft(initialDraft)
      setAssignmentId(null)
      resetDownstream()
      dispatch(assignmentApi.util.invalidateTags(["Assignment"]))
      void refetchAssignments()
      notifications.success("Retorno registrado correctamente.")
    } catch (error) {
      handleError(error, "No se pudo registrar el retorno.")
    } finally {
      registeringRef.current = false
    }
  }

  const totalPrepared =
    draft.specificItems.length +
    draft.genericItems.reduce((total, item) => total + item.quantity, 0)
  const selectedSpecificCount = selectedSpecificIds.size
  const selectedGenericCount = Array.from(
    pendingGenericQuantities.values()
  ).reduce((total, quantity) => total + quantity, 0)

  const desktop = useMediaQuery("(min-width: 1024px)")
  const activeStep =
    workerId === null
      ? 1
      : assignmentId === null
        ? 2
        : category === null
          ? 3
          : 4

  const workflowPanel = (
    <article className="h-fit rounded-xl border bg-card p-3 lg:rounded-none lg:border-0 sm:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Preparar retorno</h2>
        <Badge variant="outline" className="text-primary">
          <ScanLine /> Escaneo no necesario
        </Badge>
      </header>

      <Stepper value={activeStep} orientation="vertical">
        <StepperNav className="w-full">
          <WorkflowStep
            number={1}
            title="Trabajador"
            open
            last={workerId === null}
          >
            {workerId === null ? (
              <Alert className="mb-3 border-primary/20 bg-primary/5 text-primary">
                <Info />
                <AlertDescription>
                  Selecciona un trabajador para continuar.
                </AlertDescription>
              </Alert>
            ) : null}
            <Select
              value={workerId === null ? "" : String(workerId)}
              onValueChange={requestWorkerChange}
            >
              <SelectTrigger
                className="w-full"
                disabled={isLoadingWorkers || isRegistering}
              >
                <UserRound className="text-muted-foreground" />
                <SelectValue placeholder="Selecciona un trabajador">
                  {selectedWorker?.username}
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

            {isWorkersError ? (
              <Alert variant="destructive" className="mt-2">
                <Info />
                <AlertTitle>No se pudieron cargar los trabajadores.</AlertTitle>
              </Alert>
            ) : null}
          </WorkflowStep>

          {workerId !== null ? (
            <WorkflowStep
              number={2}
              title="Asignaciones"
              open
              last={assignmentId === null}
            >
              {isLoadingAssignments ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : isAssignmentsError ? (
                <Alert variant="destructive">
                  <Info />
                  <AlertTitle>No se pudieron cargar las asignaciones.</AlertTitle>
                  <AlertDescription>
                    Vuelve a intentarlo o selecciona otro trabajador.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Collapsible open={assignmentId === null}>
                    <CollapsibleContent>
                      {assignments.length > 0 ? (
                        <ScrollArea className="h-64 pr-3">
                          <div className="space-y-2">
                            {assignments.map((assignment) => (
                              <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                onSelect={() =>
                                  requestAssignmentChange(assignment.id)
                                }
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <Alert>
                          <Info />
                          <AlertTitle>Sin asignaciones pendientes.</AlertTitle>
                          <AlertDescription>
                            Este trabajador no tiene productos asignados para
                            devolver.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={assignmentId !== null}>
                    <CollapsibleContent>
                      {selectedAssignment ? (
                        <div className="space-y-2">
                          <AssignmentCard
                            assignment={selectedAssignment}
                            selected
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isRegistering}
                            onClick={() => requestAssignmentChange(null)}
                          >
                            <RefreshCcw /> Cambiar asignación
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="animate-spin" />
                          Actualizando asignación...
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}

              {isFetchingAssignments && !isLoadingAssignments ? (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3 animate-spin" /> Actualizando
                </p>
              ) : null}
            </WorkflowStep>
          ) : null}

          {assignmentId !== null ? (
            <WorkflowStep
              number={3}
              title="Categoría"
              open
              last={category === null}
            >
              {isLoadingDetail || isFetchingDetail ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="animate-spin" />
                  Cargando productos asignados...
                </span>
              ) : isDetailError ? (
                <Alert variant="destructive">
                  <Info />
                  <AlertTitle>No se pudo cargar la asignación.</AlertTitle>
                </Alert>
              ) : detailAccountMismatch ? (
                <Alert variant="destructive">
                  <Info />
                  <AlertTitle>Asignación incompatible.</AlertTitle>
                  <AlertDescription>
                    No pertenece al trabajador seleccionado.
                  </AlertDescription>
                </Alert>
              ) : specificModels.length === 0 && genericModels.length === 0 ? (
                <Alert>
                  <Info />
                  <AlertTitle>Asignación vacía.</AlertTitle>
                  <AlertDescription>
                    No quedan elementos retornables en esta asignación.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={category === "SPECIFIC" ? "default" : "outline"}
                    className="w-full"
                    disabled={specificModels.length === 0}
                    onClick={() => selectCategory("SPECIFIC")}
                  >
                    <Archive /> Productos ({specificModels.reduce(
                      (total, option) => total + option.model.quantity,
                      0
                    )})
                  </Button>
                  <Button
                    type="button"
                    variant={category === "GENERIC" ? "default" : "outline"}
                    className="w-full"
                    disabled={genericModels.length === 0}
                    onClick={() => selectCategory("GENERIC")}
                  >
                    <Package /> Consumibles ({genericModels.reduce(
                      (total, option) => total + option.model.quantity,
                      0
                    )})
                  </Button>
                </div>
              )}
            </WorkflowStep>
          ) : null}

          {category !== null &&
          !isLoadingDetail &&
          !isFetchingDetail &&
          !isDetailError &&
          !detailAccountMismatch ? (
            <WorkflowStep
              number={4}
              title={
                category === "SPECIFIC"
                  ? "Selección de productos"
                  : "Selección de consumibles"
              }
              open
              last
            >
              <Collapsible open={activeModel === null}>
                <CollapsibleContent>
                  {categoryModels.length > 0 ? (
                    <ScrollArea className="h-52 pr-3">
                      <div className="space-y-2">
                        {categoryModels.map((option) => (
                          <Button
                            key={option.key}
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => selectModel(option.key)}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {option.kind === "SPECIFIC" ? (
                                <Archive />
                              ) : (
                                <Package />
                              )}
                              <span className="truncate">
                                {option.model.modelName}
                              </span>
                            </span>
                            <Badge variant="secondary">
                              {quantityLabel(option.model.quantity)}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <Alert>
                      <Info />
                      <AlertTitle>Sin modelos disponibles.</AlertTitle>
                    </Alert>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={activeModel !== null}>
                <CollapsibleContent>
                  {activeModel ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {activeModel.model.modelName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {quantityLabel(activeModel.model.quantity)} retornables
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setActiveModelKey(null)
                            clearSelection()
                          }}
                        >
                          Cambiar
                        </Button>
                      </div>

                      {activeModel.kind === "SPECIFIC" ? (
                        <SpecificItemsTable
                          model={activeModel.model}
                          selectedIds={selectedSpecificIds}
                          preparedIds={preparedSpecificIds}
                          onToggle={toggleSpecificSelection}
                        />
                      ) : (
                        <GenericItemsTable
                          model={activeModel.model}
                          pendingQuantities={pendingGenericQuantities}
                          preparedQuantities={preparedGenericQuantities}
                          onChangeQuantity={changePendingGenericQuantity}
                        />
                      )}

                      <Button
                        type="button"
                        className="w-full"
                        disabled={
                          isRegistering ||
                          (activeModel.kind === "SPECIFIC"
                            ? selectedSpecificCount === 0
                            : selectedGenericCount === 0)
                        }
                        onClick={
                          activeModel.kind === "SPECIFIC"
                            ? addSpecificSelectionToDraft
                            : addGenericSelectionToDraft
                        }
                      >
                        <Plus />
                        {activeModel.kind === "SPECIFIC"
                          ? `Agregar productos (${selectedSpecificCount})`
                          : `Agregar consumibles (${selectedGenericCount})`}
                      </Button>
                    </div>
                  ) : null}
                </CollapsibleContent>
              </Collapsible>
            </WorkflowStep>
          ) : null}
        </StepperNav>
      </Stepper>
    </article>
  )

  const preparationPanel = (
    <article className="flex h-full flex-col rounded-xl border bg-card p-3 lg:rounded-none lg:border-0 sm:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Área de preparación</h2>
          {hasPreparedItems ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {quantityLabel(totalPrepared)} listas para devolver.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-destructive/40 text-destructive hover:text-destructive"
          disabled={!hasPreparedItems || isRegistering}
          onClick={() => setClearDialogOpen(true)}
        >
          <RotateCcw /> Limpiar área
        </Button>
      </header>

      <div className="min-h-0 flex-1">
        {hasPreparedItems ? (
          <ReturnDraftList
            specificItems={draft.specificItems}
            genericItems={draft.genericItems}
            onRemoveSpecific={removeSpecific}
            onRemoveGeneric={removeGeneric}
            onChangeGenericQuantity={changeGenericDraftQuantity}
            onAddSpecificEvidence={addSpecificEvidence}
            onRemoveSpecificEvidence={removeSpecificEvidence}
            onAddGenericEvidence={addGenericEvidence}
            onRemoveGenericEvidence={removeGenericEvidence}
          />
        ) : (
          <Empty className="min-h-[28rem] rounded-xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>
                Aún no hay elementos en el área de preparación
              </EmptyTitle>
              <EmptyDescription>
                Selecciona material asignado y agrégalo al área para registrar
                su retorno.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <Button
        type="button"
        className="mt-4 w-full"
        disabled={isRegistering || assignmentId === null || !hasPreparedItems}
        onClick={() => void handleRegisterReturn()}
      >
        {isRegistering ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Save />
        )}
        {isRegistering ? "Registrando retorno..." : "Registrar retorno"}
      </Button>
    </article>
  )

  return (
    <section className="flex flex-col gap-5" aria-label="Retornos">
      <InventoryPageHeader
        title="Retornos"
        description="Devuelve manualmente los productos asignados a un trabajador."
      />

      {desktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-[calc(100dvh-10rem)] min-h-[38rem] gap-4 overflow-hidden bg-transparent"
        >
          <ResizablePanel defaultSize={36} minSize={28}>
            <ScrollArea className="h-full">{workflowPanel}</ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={64} minSize={40}>
            <ScrollArea className="h-full">{preparationPanel}</ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="space-y-4">
          {workflowPanel}
          {preparationPanel}
        </div>
      )}

      <ConfirmationDialog
        open={clearDialogOpen}
        title="Limpiar área de preparación"
        description="Se eliminarán todos los elementos seleccionados y sus imágenes locales."
        confirmLabel="Limpiar preparación"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={() => {
          clearDraft()
          clearSelection()
          setClearDialogOpen(false)
        }}
      />

      <ConfirmationDialog
        open={pendingContext !== null}
        title="Cambiar el contexto del retorno"
        description="Para cambiar de trabajador o asignación es necesario limpiar los elementos preparados."
        confirmLabel="Limpiar y cambiar"
        onCancel={() => setPendingContext(null)}
        onConfirm={confirmContextChange}
      />

      <ConfirmationDialog
        open={blocker.state === "blocked"}
        title="Retorno sin registrar"
        description="Si abandonas esta página perderás los elementos y las imágenes preparadas."
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
