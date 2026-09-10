import { useCallback, useEffect, useRef, useState } from "react"
import {
  Info,
  LoaderCircle,
  Package,
  Save,
  ScanBarcode,
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
import { useGetProvidersQuery } from "@/features/inventory/api/modelsApi"
import {
  useRegisterAssignmentMutation,
  type AssignmentCreateRequest,
  type MultipartAttachment,
  type MultipartOperation,
} from "@/features/inventory/api/operations.service"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useInventoryScanner } from "@/features/inventory/entry/hooks/useInventoryScanner"
import { useGlobalError } from "@/hooks"
import { useGetAssignableWorkersQuery } from "../api/assignmentApi"
import { AssignmentDraftList } from "../components/AssignmentDraftList"
import { EvidenceUploader } from "../components/EvidenceUploader"
import type {
  AssignmentConsumableDraft,
  AssignmentDraft,
  AssignmentSpecificProductDraft,
  LocalEvidence,
  WorkerOption,
} from "../types/assignment.types"

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

function AssignmentPreparationArea() {
  const [providerId, setProviderId] = useState("")
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
  const [identifyProduct, { isLoading: isIdentifying }] =
    useIdentifyProductMutation()
  const [registerAssignment, { isLoading: isRegistering }] =
    useRegisterAssignmentMutation()

  const activeProviders = providers.filter((provider) => provider.active)
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === providerId
  )
  const selectedProviderId = selectedProvider?.id
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

  function addIdentificationResult(result: IdentificationResponse) {
    if (result.productType === "SPECIFIC") {
      if (
        result.telecommunicationItemId === null ||
        !result.uniqueCode ||
        !result.uniqueCodeType
      ) {
        notifications.error(
          "La unidad identificada no contiene los datos necesarios para asignarla."
        )
        return
      }

      if (result.status !== "AVAILABLE") {
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
          `La unidad ${result.uniqueCode} ya está en la preparación.`,
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
        uniqueCode: result.uniqueCode,
        uniqueCodeType: result.uniqueCodeType,
        status: result.status,
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

  const totalQuantity =
    draft.specificProducts.length +
    draft.consumables.reduce((sum, item) => sum + item.quantity, 0)
  const modelCount = new Set([
    ...draft.specificProducts.map((item) => `specific-${item.modelId}`),
    ...draft.consumables.map((item) => `generic-${item.modelId}`),
  ]).size

  return (
    <>
      <article className="rounded-xl border bg-card p-3 sm:p-4">
        <header className="mb-4">
          <h2 className="text-lg font-semibold">Área de preparación</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona un trabajador y un proveedor para habilitar el escaneo y
            comenzar la asignación.
          </p>
        </header>

        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end"
          aria-label="Configuración de la asignación"
        >
          <label className="min-w-0 text-xs font-medium">
            Trabajador <span className="text-destructive">*</span>
            <Select
              value={draft.worker ? String(draft.worker.id) : ""}
              onValueChange={requestWorkerChange}
            >
              <SelectTrigger
                className="mt-1 h-9 w-full"
                disabled={isLoadingWorkers || isIdentifying || isRegistering}
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

          <label className="min-w-0 text-xs font-medium">
            Proveedor de lectura <span className="text-destructive">*</span>
            <Select value={providerId} onValueChange={requestProviderChange}>
              <SelectTrigger
                className="mt-1 h-9 w-full"
                disabled={isLoadingProviders || isIdentifying || isRegistering}
              >
                <Truck className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Selecciona un proveedor">
                  {selectedProvider?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {activeProviders.map((provider) => (
                  <SelectItem key={provider.id} value={String(provider.id)}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Badge
            variant="secondary"
            role="status"
            aria-live="polite"
            className={`h-9 w-full justify-center gap-2 px-4 text-xs font-medium sm:w-auto ${
              isIdentifying
                ? "bg-blue-50 text-blue-700"
                : scannerEnabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-muted text-muted-foreground"
            }`}
          >
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
            className="w-full border border-red-500 sm:w-auto"
            disabled={!hasUnsavedData || isIdentifying || isRegistering}
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 />
            Limpiar área
          </Button>
        </section>

        {isWorkersError || isProvidersError ? (
          <Alert variant="destructive" className="mt-3">
            <Info />
            <AlertTitle>No se pudieron cargar los datos necesarios.</AlertTitle>
            <AlertDescription>
              Revisa la conexión con los servicios de trabajadores y
              proveedores.
            </AlertDescription>
          </Alert>
        ) : operationReady ? (
          <Alert className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-800">
            <ScanBarcode />
            <AlertTitle>
              Preparación lista para {draft.worker?.name}.
            </AlertTitle>
            <AlertDescription>
              Ya puedes escanear productos disponibles y asociarlos a este
              trabajador.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mt-3 border-primary/30 bg-primary/5 text-primary">
            <Info />
            <AlertTitle>
              Selecciona un trabajador y un proveedor para habilitar el escaneo.
            </AlertTitle>
            <AlertDescription>
              Ambos campos son obligatorios antes de identificar productos.
            </AlertDescription>
          </Alert>
        )}

        {hasPreparedItems ? (
          <section className="mt-4" aria-label="Productos preparados">
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Productos preparados</h3>
              <p className="text-xs text-muted-foreground">
                {quantityText(totalQuantity)} en {modelCount}{" "}
                {modelCount === 1 ? "modelo" : "modelos"}
              </p>
            </header>

            <AssignmentDraftList
              specificProducts={draft.specificProducts}
              consumables={draft.consumables}
              onRemoveSpecific={removeSpecific}
              onRemoveConsumable={removeConsumable}
              onChangeConsumableQuantity={changeConsumableQuantity}
              onAddSpecificEvidence={addSpecificEvidence}
              onRemoveSpecificEvidence={removeSpecificEvidence}
              onAddConsumableEvidence={addConsumableEvidence}
              onRemoveConsumableEvidence={removeConsumableEvidence}
            />

            <section className="mt-4 grid gap-4 rounded-lg border p-3 lg:grid-cols-2">
              <label className="text-xs font-medium">
                Nota general
                <Textarea
                  value={draft.notes}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Añade una nota opcional sobre la asignación"
                  className="mt-1 min-h-24"
                  maxLength={1000}
                />
              </label>
              <section aria-labelledby="general-evidence-title">
                <h3 id="general-evidence-title" className="text-xs font-medium">
                  Fotos generales de la asignación
                </h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Evidencia visual de la entrega completa.
                </p>
                <EvidenceUploader
                  evidence={draft.generalEvidence}
                  onAdd={addGeneralEvidence}
                  onRemove={removeGeneralEvidence}
                />
              </section>
            </section>
          </section>
        ) : (
          <Empty className="mt-4 min-h-56 rounded-lg border border-dashed border-primary/20 bg-background px-4 py-6">
            <EmptyHeader className="max-w-lg gap-2">
              <EmptyMedia
                variant="default"
                className="mb-1 flex size-14 items-center justify-center rounded-full bg-primary/5 text-primary/70"
              >
                <Package className="size-7 stroke-[1.4]" />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-semibold">
                Listo para escanear productos
              </EmptyTitle>
              <EmptyDescription className="text-center text-xs">
                {operationReady
                  ? "Escanea dispositivos o consumibles disponibles para comenzar la asignación."
                  : "Selecciona un trabajador y un proveedor para activar el escáner."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Button
          type="button"
          className="mt-4 w-full"
          disabled={
            !operationReady ||
            !hasPreparedItems ||
            isIdentifying ||
            isRegistering
          }
          onClick={() => void handleRegisterAssignment()}
        >
          {isRegistering ? <LoaderCircle className="animate-spin" /> : <Save />}
          {isRegistering ? "Guardando asignación..." : "Guardar asignación"}
        </Button>
      </article>

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
    </>
  )
}

export const AssignmentPage = () => {
  return (
    <section className="flex flex-col gap-4" aria-label="Asignaciones">
      <InventoryPageHeader
        title="Asignaciones"
        description="Prepara las asignaciones de productos."
      />
      <AssignmentPreparationArea />
    </section>
  )
}
