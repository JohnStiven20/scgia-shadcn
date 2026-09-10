import { useCallback, useEffect, useRef, useState } from "react"
import {
  Info,
  LoaderCircle,
  Package,
  ScanBarcode,
  Trash2,
  Truck,
} from "lucide-react"
import { useBlocker } from "react-router-dom"

import hguImage from "@/assets/hgu_wifi_5_f.png"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
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
  useGetProvidersQuery,
  useGetTelecommunicationModelsSelectionQuery,
} from "@/features/inventory/api/modelsApi"
import {
  useRegisterExitMutation,
  type ExitTelecommunicationsItemsRequest,
} from "@/features/inventory/api/operations.service"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useInventoryScanner } from "@/features/inventory/entry/hooks/useInventoryScanner"
import { useGlobalError } from "@/hooks"
import { ExitDraftList } from "../components/ExitDraftList"
import type {
  ExitConsumableDraftItem,
  ExitDraftItem,
  ExitSpecificDraftItem,
} from "../types"

type ConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

type ExitReasonDialogProps = {
  identification: IdentificationResponse | null
  reason: string
  onReasonChange: (reason: string) => void
  onCancel: () => void
  onConfirm: () => void
}

function createTemporaryId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function quantityText(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function buildRegisterExitRequest(
  draft: ExitDraftItem[]
): ExitTelecommunicationsItemsRequest {
  return {
    specificItems: draft
      .filter((item): item is ExitSpecificDraftItem => item.kind === "SPECIFIC")
      .map((item) => ({
        telecommunicationsItemId: item.telecommunicationsItemId,
        remarks: item.reason,
      })),
    genericItems: draft
      .filter(
        (item): item is ExitConsumableDraftItem => item.kind === "CONSUMABLE"
      )
      .map((item) => ({
        telecommunicationGenericId: item.telecommunicationGenericId,
        identifierId: item.identifierId,
        quantity: item.quantity,
        remarks: item.reason,
      })),
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

function ExitReasonDialog({
  identification,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: ExitReasonDialogProps) {
  const isSpecific = identification?.productType === "SPECIFIC"

  return (
    <Dialog
      open={identification !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Completar salida
          </DialogTitle>
          <DialogDescription>
            Antes de añadir el producto a la preparación, indica el motivo de la
            salida.
          </DialogDescription>
        </DialogHeader>

        {identification ? (
          <article className="flex gap-3 rounded-lg border p-3">
            {isSpecific ? (
              <AspectRatio
                ratio={4 / 3}
                className="w-20 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={hguImage}
                  alt=""
                  className="size-full object-contain p-1"
                />
              </AspectRatio>
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <Package className="size-8 stroke-[1.4]" />
              </span>
            )}

            <section className="min-w-0 text-xs">
              <h3 className="truncate text-sm font-semibold">
                {identification.model.name}
              </h3>
              {identification.uniqueCode ? (
                <p className="mt-1 break-all text-muted-foreground">
                  Código único: {identification.uniqueCode}
                </p>
              ) : null}
              <p className="mt-1 break-all text-muted-foreground">
                Identificador: {identification.identifier.code}
              </p>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                <span>Estado:</span>
                <Badge className="bg-emerald-50 text-emerald-700">
                  Disponible
                </Badge>
              </div>
            </section>
          </article>
        ) : null}

        <section aria-labelledby="exit-reason-label">
          <label
            id="exit-reason-label"
            htmlFor="exit-reason"
            className="mb-1.5 block text-xs font-medium"
          >
            Motivo de salida <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="exit-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Describe el motivo de la salida"
            className="min-h-20"
            maxLength={500}
            autoFocus
          />
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">
            El motivo quedará asociado al registro de salida de este producto.
          </p>
        </section>

        <DialogFooter className="flex-col-reverse border-t pt-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" disabled={!reason.trim()} onClick={onConfirm}>
            Añadir a la preparación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PreparationArea() {
  const [providerId, setProviderId] = useState("")
  const [pendingProviderId, setPendingProviderId] = useState<string | null>(
    null
  )
  const [draft, setDraft] = useState<ExitDraftItem[]>([])
  const [pendingIdentification, setPendingIdentification] =
    useState<IdentificationResponse | null>(null)
  const [reason, setReason] = useState("")
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const draftRef = useRef<ExitDraftItem[]>([])
  const identifyingRef = useRef(false)
  const registeringRef = useRef(false)
  const pendingIdentificationRef = useRef<IdentificationResponse | null>(null)
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    isError: isProvidersError,
  } = useGetProvidersQuery()
  const [identifyProduct, { isLoading: isIdentifying }] =
    useIdentifyProductMutation()
  const [registerExit, { isLoading: isRegistering }] = useRegisterExitMutation()

  const activeProviders = providers.filter((provider) => provider.active)
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === providerId
  )
  const selectedProviderId = selectedProvider?.id
  const hasProvider = selectedProviderId !== undefined
  const hasPendingItems = draft.length > 0
  const blocker = useBlocker(hasPendingItems && !isRegistering)
  const { data: genericModels = [] } =
    useGetTelecommunicationModelsSelectionQuery(
      {
        providerId: selectedProviderId ?? 0,
        modelType: "GENERIC",
        operationType: "EXIT",
      },
      { skip: selectedProviderId === undefined }
    )

  const replaceDraft = useCallback((nextDraft: ExitDraftItem[]) => {
    draftRef.current = nextDraft
    setDraft(nextDraft)
  }, [])

  const closeReasonDialog = useCallback(() => {
    pendingIdentificationRef.current = null
    setPendingIdentification(null)
    setReason("")
  }, [])

  const clearPreparation = useCallback(() => {
    replaceDraft([])
    closeReasonDialog()
  }, [closeReasonDialog, replaceDraft])

  async function handleScanCode(rawCode: string) {
    const normalizedCode = rawCode.trim()

    if (selectedProviderId === undefined) {
      notifications.error(
        "Selecciona un proveedor antes de utilizar el escáner."
      )
      return
    }

    if (!normalizedCode) {
      notifications.error("El código escaneado está vacío.")
      return
    }

    if (
      identifyingRef.current ||
      registeringRef.current ||
      pendingIdentificationRef.current
    ) {
      notifications.notify(
        "Completa la lectura actual antes de escanear otro producto.",
        "warning"
      )
      return
    }

    identifyingRef.current = true

    try {
      const result = await identifyProduct({
        operationType: "EXIT",
        providerId: selectedProviderId,
        rawCode: normalizedCode,
      }).unwrap()

      if (result.productType === "SPECIFIC") {
        if (result.telecommunicationItemId === null) {
          notifications.error(
            "La unidad identificada no tiene un registro de inventario."
          )
          return
        }

        if (result.status !== "AVAILABLE") {
          notifications.error(
            "La unidad identificada no está disponible para una salida."
          )
          return
        }

        if (!result.uniqueCode || !result.uniqueCodeType) {
          notifications.error(
            "La respuesta no contiene el código único de la unidad."
          )
          return
        }

        const isDuplicate = draftRef.current.some(
          (item) =>
            item.kind === "SPECIFIC" &&
            item.telecommunicationsItemId === result.telecommunicationItemId
        )

        if (isDuplicate) {
          notifications.notify(
            `La unidad ${result.uniqueCode} ya está en la preparación.`,
            "warning"
          )
          return
        }
      } else if (result.telecommunicationGenericItemId === null) {
        notifications.error(
          "El producto genérico no tiene un inventario asociado."
        )
        return
      }

      pendingIdentificationRef.current = result
      setPendingIdentification(result)
      setReason("")
    } catch (error) {
      handleError(error, "No se pudo identificar el código escaneado.")
    } finally {
      identifyingRef.current = false
    }
  }

  useInventoryScanner({ onScanCode: handleScanCode })

  useEffect(() => {
    if (!hasPendingItems) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasPendingItems])

  function handleProviderChange(nextProviderId: string | null) {
    const normalizedProviderId = nextProviderId ?? ""

    if (normalizedProviderId === providerId) return

    if (hasPendingItems) {
      setPendingProviderId(normalizedProviderId)
      return
    }

    setProviderId(normalizedProviderId)
  }

  function confirmProviderChange() {
    if (pendingProviderId === null) return

    clearPreparation()
    setProviderId(pendingProviderId)
    setPendingProviderId(null)
  }

  function confirmIdentification() {
    const identification = pendingIdentificationRef.current
    const normalizedReason = reason.trim()

    if (!identification || selectedProviderId === undefined) return

    if (!normalizedReason) {
      notifications.error("Indica el motivo de la salida.")
      return
    }

    if (identification.productType === "SPECIFIC") {
      const { telecommunicationItemId, uniqueCode, uniqueCodeType, status } =
        identification

      if (
        telecommunicationItemId === null ||
        !uniqueCode ||
        !uniqueCodeType ||
        status !== "AVAILABLE"
      ) {
        notifications.error(
          "La unidad ya no contiene los datos necesarios para preparar la salida."
        )
        closeReasonDialog()
        return
      }

      const nextItem: ExitSpecificDraftItem = {
        draftId: `specific-${telecommunicationItemId}`,
        kind: "SPECIFIC",
        providerId: selectedProviderId,
        provider: selectedProvider?.name ?? "",
        telecommunicationsItemId: telecommunicationItemId,
        modelId: identification.model.id,
        modelName: identification.model.name,
        identifierId: identification.identifier.id,
        identifierCode: identification.identifier.code,
        uniqueCode,
        uniqueCodeType,
        status,
        reason: normalizedReason,
      }

      replaceDraft([...draftRef.current, nextItem])
    } else {
      const genericId = identification.telecommunicationGenericItemId

      if (genericId === null) {
        notifications.error(
          "El producto genérico no tiene un inventario asociado."
        )
        closeReasonDialog()
        return
      }

      const availableQuantity =
        genericModels.find((model) => model.id === identification.model.id)
          ?.availableQuantity ?? null
      const currentQuantity = draftRef.current.reduce(
        (total, item) =>
          item.kind === "CONSUMABLE" &&
          item.telecommunicationGenericId === genericId
            ? total + item.quantity
            : total,
        0
      )

      if (availableQuantity !== null && currentQuantity >= availableQuantity) {
        notifications.error(
          "No hay más unidades disponibles de este producto genérico."
        )
        closeReasonDialog()
        return
      }

      const existingItem = draftRef.current.find(
        (item): item is ExitConsumableDraftItem =>
          item.kind === "CONSUMABLE" &&
          item.telecommunicationGenericId === genericId &&
          item.identifierId === identification.identifier.id &&
          item.reason === normalizedReason
      )

      if (existingItem) {
        replaceDraft(
          draftRef.current.map((item) =>
            item.kind === "CONSUMABLE" && item.draftId === existingItem.draftId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        )
      } else {
        const nextItem: ExitConsumableDraftItem = {
          draftId: createTemporaryId(),
          kind: "CONSUMABLE",
          providerId: selectedProviderId,
          provider: selectedProvider?.name ?? "",
          telecommunicationGenericId: genericId,
          modelId: identification.model.id,
          modelName: identification.model.name,
          identifierId: identification.identifier.id,
          identifierCode: identification.identifier.code,
          identifierType: "Código",
          availableQuantity,
          quantity: 1,
          reason: normalizedReason,
        }

        replaceDraft([...draftRef.current, nextItem])
      }
    }

    notifications.success(
      `${identification.model.name} añadido a la preparación.`
    )
    closeReasonDialog()
  }

  function removeDraftItem(draftId: string) {
    replaceDraft(draftRef.current.filter((item) => item.draftId !== draftId))
  }

  function canIncrementConsumable(item: ExitConsumableDraftItem) {
    const availableQuantity =
      item.availableQuantity ??
      genericModels.find((model) => model.id === item.modelId)
        ?.availableQuantity ??
      null

    if (availableQuantity === null) return true

    const preparedQuantity = draftRef.current.reduce(
      (total, draftItem) =>
        draftItem.kind === "CONSUMABLE" &&
        draftItem.telecommunicationGenericId === item.telecommunicationGenericId
          ? total + draftItem.quantity
          : total,
      0
    )

    return preparedQuantity < availableQuantity
  }

  function changeConsumableQuantity(draftId: string, quantity: number) {
    if (quantity < 1) return

    const target = draftRef.current.find(
      (item): item is ExitConsumableDraftItem =>
        item.kind === "CONSUMABLE" && item.draftId === draftId
    )

    if (!target) return

    const otherPreparedQuantity = draftRef.current.reduce(
      (total, item) =>
        item.kind === "CONSUMABLE" &&
        item.telecommunicationGenericId === target.telecommunicationGenericId &&
        item.draftId !== draftId
          ? total + item.quantity
          : total,
      0
    )

    const availableQuantity =
      target.availableQuantity ??
      genericModels.find((model) => model.id === target.modelId)
        ?.availableQuantity ??
      null

    if (
      availableQuantity !== null &&
      otherPreparedQuantity + quantity > availableQuantity
    ) {
      notifications.notify(
        `Solo hay ${quantityText(availableQuantity)} disponibles.`,
        "warning"
      )
      return
    }

    replaceDraft(
      draftRef.current.map((item) =>
        item.draftId === draftId ? { ...item, quantity } : item
      )
    )
  }

  async function handleRegisterExit() {
    if (!hasPendingItems || registeringRef.current) return

    registeringRef.current = true

    try {
      await registerExit(buildRegisterExitRequest(draftRef.current)).unwrap()
      clearPreparation()
      notifications.success("Salida registrada correctamente.")
    } catch (error) {
      handleError(error, "No se pudo registrar la salida.")
    } finally {
      registeringRef.current = false
    }
  }

  const draftItemCount = draft.reduce(
    (total, item) => total + (item.kind === "SPECIFIC" ? 1 : item.quantity),
    0
  )
  const draftModelCount = new Set(
    draft.map((item) => `${item.kind}:${item.modelId}`)
  ).size

  return (
    <>
      <article className="rounded-xl border bg-card p-3 sm:p-4">
        <header className="mb-4">
          <h2 className="text-lg font-semibold">Área de preparación</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona un proveedor y escanea los productos existentes para
            preparar la salida.
          </p>
        </header>

        <section aria-labelledby="exit-provider-title">
          <h3 id="exit-provider-title" className="mb-2 text-sm font-medium">
            Proveedor de lectura
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 sm:max-w-xl sm:flex-1">
              <Select value={providerId} onValueChange={handleProviderChange}>
                <SelectTrigger
                  className="h-9 w-full"
                  disabled={
                    isLoadingProviders ||
                    isIdentifying ||
                    isRegistering ||
                    pendingIdentification !== null
                  }
                  aria-label="Proveedor de lectura"
                >
                  <Truck className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Selecciona un proveedor">
                    {selectedProvider?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {activeProviders.map((provider) => (
                    <SelectItem key={provider.id} value={String(provider.id)}>
                      <span className="font-medium">{provider.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
              <Badge
                variant="secondary"
                role="status"
                aria-live="polite"
                className={`h-9 w-full justify-center gap-2 px-4 text-xs font-medium sm:w-auto ${
                  isIdentifying
                    ? "bg-blue-50 text-blue-700"
                    : hasProvider
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
                  : hasProvider
                    ? "Escáner listo"
                    : "Escáner desactivado"}
              </Badge>

              <Button
                type="button"
                variant="destructive"
                className="w-full border border-red-500 sm:w-auto"
                disabled={
                  !hasPendingItems ||
                  isIdentifying ||
                  isRegistering ||
                  pendingIdentification !== null
                }
                onClick={() => setClearDialogOpen(true)}
              >
                <Trash2 />
                Limpiar área
              </Button>
            </div>
          </div>
        </section>

        {isProvidersError ? (
          <Alert variant="destructive" className="mt-3">
            <Info />
            <AlertTitle>No se pudieron cargar los proveedores.</AlertTitle>
            <AlertDescription>
              Revisa la conexión con el servicio e inténtalo de nuevo.
            </AlertDescription>
          </Alert>
        ) : !hasProvider ? (
          <Alert className="mt-3 border-primary/30 bg-primary/5 text-primary">
            <Info />
            <AlertTitle>
              Debes seleccionar un proveedor para habilitar el escaneo.
            </AlertTitle>
            <AlertDescription>
              El proveedor es obligatorio para interpretar correctamente los
              productos escaneados para la salida.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-800">
            <ScanBarcode />
            <AlertTitle>Escáner activo.</AlertTitle>
            <AlertDescription>
              Escanea un producto y completa su motivo antes de continuar.
            </AlertDescription>
          </Alert>
        )}

        {hasPendingItems ? (
          <section className="mt-4" aria-label="Productos preparados">
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Productos preparados</h3>
              <p className="text-xs text-muted-foreground">
                {quantityText(draftItemCount)} en {draftModelCount}{" "}
                {draftModelCount === 1 ? "modelo" : "modelos"}
              </p>
            </header>
            <div className="overflow-hidden rounded-lg border">
              <ExitDraftList
                draft={draft}
                onRemove={removeDraftItem}
                onChangeConsumableQuantity={changeConsumableQuantity}
                canIncrementConsumable={canIncrementConsumable}
              />
            </div>
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
                Listo para preparar productos
              </EmptyTitle>
              <EmptyDescription className="text-center text-xs">
                {hasProvider
                  ? "Escanea un producto y añade el motivo de su salida."
                  : "Selecciona un proveedor para activar el escáner y comenzar la salida."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Button
          type="button"
          className="mt-4 w-full"
          disabled={
            !hasPendingItems ||
            isIdentifying ||
            isRegistering ||
            pendingIdentification !== null
          }
          onClick={() => void handleRegisterExit()}
        >
          {isRegistering ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Package />
          )}
          {isRegistering ? "Registrando salida..." : "Registrar salida"}
        </Button>
      </article>

      <ExitReasonDialog
        identification={pendingIdentification}
        reason={reason}
        onReasonChange={setReason}
        onCancel={closeReasonDialog}
        onConfirm={confirmIdentification}
      />

      <ConfirmationDialog
        open={clearDialogOpen}
        title="Limpiar área de preparación"
        description="Se eliminarán todos los productos preparados. Esta acción no se puede deshacer."
        confirmLabel="Limpiar área"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={() => {
          clearPreparation()
          setClearDialogOpen(false)
        }}
      />

      <ConfirmationDialog
        open={pendingProviderId !== null}
        title="Cambiar proveedor"
        description="Los productos preparados pertenecen al proveedor actual. Para cambiarlo es necesario limpiar el área."
        confirmLabel="Limpiar y cambiar"
        onCancel={() => setPendingProviderId(null)}
        onConfirm={confirmProviderChange}
      />

      <ConfirmationDialog
        open={blocker.state === "blocked"}
        title="Preparación sin registrar"
        description="Si abandonas esta pantalla perderás todos los productos preparados para la salida."
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

export const OutPage = () => {
  return (
    <section className="flex flex-col gap-4" aria-label="Salida de inventario">
      <InventoryPageHeader
        title="Salida"
        description="Registra los productos que salen del inventario."
      />
      <PreparationArea />
    </section>
  )
}
