import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  Info,
  LoaderCircle,
  Package,
  ScanBarcode,
  Trash2,
  Truck,
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
import { useGlobalError } from "@/hooks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IdentificationResponse } from "@/features/interface/identification/types"
import { useIdentifyProductMutation } from "@/features/inventory/api/identificationApi"
import { useGetProvidersQuery } from "@/features/inventory/api/modelsApi"
import {
  useRegisterEntryMutation,
  type RegisterTelecommunicationsItemsRequest,
} from "@/features/inventory/api/operations.service"
import { InventoryPageHeader } from "../../components"
import { EntryDraftList } from "../components/EntryDraftList"
import { useInventoryScanner } from "../hooks/useInventoryScanner"
import type {
  GenericEntryDraftItem,
  SpecificEntryDraftItem,
} from "../types"

type ConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
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

function createTemporaryId() {
  if (
    typeof globalThis.crypto?.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function buildRegisterEntryRequest(
  specificItems: SpecificEntryDraftItem[],
  genericItems: GenericEntryDraftItem[],
): RegisterTelecommunicationsItemsRequest | null {
  const validGenericItems = genericItems.filter(
    (
      item,
    ): item is GenericEntryDraftItem & {
      telecommunicationGenericItemId: number
    } => item.telecommunicationGenericItemId !== null,
  )

  if (validGenericItems.length !== genericItems.length) {
    return null
  }

  return {
    genericItems: validGenericItems.map((item) => ({
      quantity: item.quantity,
      telecommunicationGenericId: item.telecommunicationGenericItemId,
      identifierId: item.identifierId,
    })),
    specificItems: specificItems.map((item) => ({
      uniqueCode: item.uniqueCode,
      uniqueCodeType: item.uniqueCodeType,
      telecommunicationItemModelId: item.modelId,
      telecommunicationItemModelIdentifierId: item.identifierId,
    })),
  }
}

function PreparationArea() {
  
  const [providerId, setProviderId] = useState("")
  const [pendingProviderId, setPendingProviderId] = useState<string | null>(
    null,
  )
  const [specificItems, setSpecificItems] = useState<
    SpecificEntryDraftItem[]
  >([])
  const [genericItems, setGenericItems] = useState<GenericEntryDraftItem[]>([])
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const identifyingRef = useRef(false)
  const specificItemsRef = useRef<SpecificEntryDraftItem[]>([])
  const genericItemsRef = useRef<GenericEntryDraftItem[]>([])
  const notifications = useNotifications()
  const { handleError } = useGlobalError()
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    isError: isProvidersError,
  } = useGetProvidersQuery()
  const [identifyProduct, { isLoading: isIdentifying }] =
    useIdentifyProductMutation()
  const [registerEntry, { isLoading: isRegistering }] =
    useRegisterEntryMutation()

  const activeProviders = providers.filter((provider) => provider.active)
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === providerId,
  )
  const selectedProviderId = selectedProvider?.id
  const selectedProviderName = selectedProvider?.name
  const hasProvider = selectedProviderId !== undefined
  const hasPendingItems = specificItems.length > 0 || genericItems.length > 0
  const blocker = useBlocker(hasPendingItems)

  const replaceSpecificItems = useCallback(
    (nextItems: SpecificEntryDraftItem[]) => {
      specificItemsRef.current = nextItems
      setSpecificItems(nextItems)
    },
    [],
  )

  const replaceGenericItems = useCallback(
    (nextItems: GenericEntryDraftItem[]) => {
      genericItemsRef.current = nextItems
      setGenericItems(nextItems)
    },
    [],
  )

  const clearPreparation = useCallback(() => {
    replaceSpecificItems([])
    replaceGenericItems([])
  }, [replaceGenericItems, replaceSpecificItems])

  const addIdentificationResult = useCallback(
    (result: IdentificationResponse, providerName: string, provider: number) => {
      if (result.productType === "SPECIFIC") {
        if (!result.uniqueCode || !result.uniqueCodeType) {
          notifications.error(
            "La respuesta no contiene el identificador único del producto.",
          )
          return
        }

        const isDuplicate = specificItemsRef.current.some(
          (item) => item.uniqueCode === result.uniqueCode,
        )

        if (isDuplicate) {
          notifications.notify(
            `El código ${result.uniqueCode} ya está en la preparación.`,
            "warning",
          )
          return
        }

        replaceSpecificItems([
          ...specificItemsRef.current,
          {
            id: createTemporaryId(),
            providerId: provider,
            modelId: result.model.id,
            identifierId: result.identifier.id,
            telecommunicationItemId: result.telecommunicationItemId,
            model: result.model.name,
            modelIdentifier: result.identifier.code,
            provider: providerName,
            uniqueCode: result.uniqueCode,
            uniqueCodeType: result.uniqueCodeType,
          },
        ])
        notifications.success(`${result.model.name} añadido a la preparación.`)
        return
      }

      const existingIndex = genericItemsRef.current.findIndex(
        (item) =>
          item.modelId === result.model.id &&
          item.identifierId === result.identifier.id,
      )

      if (existingIndex >= 0) {
        replaceGenericItems(
          genericItemsRef.current.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        )
      } else {
        replaceGenericItems([
          ...genericItemsRef.current,
          {
            id: createTemporaryId(),
            providerId: provider,
            modelId: result.model.id,
            identifierId: result.identifier.id,
            telecommunicationGenericItemId:
              result.telecommunicationGenericItemId,
            model: result.model.name,
            provider: providerName,
            identifier: result.identifier.code,
            identifierType: "Código",
            quantity: Math.max(1, result.quantity ?? 1),
          },
        ])
      }

      notifications.success(`${result.model.name} añadido a la preparación.`)
    },
    [notifications, replaceGenericItems, replaceSpecificItems],
  )

  async function handleScanCode(rawCode: string) {
    
    const normalizedCode = rawCode.trim()

    if (selectedProviderId === undefined || !selectedProviderName) {
      notifications.error(
        "Selecciona un proveedor antes de utilizar el escáner.",
      )
      return
    }

    if (!normalizedCode) {
      notifications.error("El código escaneado está vacío.")
      return
    }

    if (identifyingRef.current) {
      notifications.notify(
        "Espera a que termine la identificación actual.",
        "warning",
      )
      return
    }

    identifyingRef.current = true

    try {
      const result = await identifyProduct({
        operationType: "ENTRY",
        providerId: selectedProviderId,
        rawCode: normalizedCode,
      }).unwrap()

      addIdentificationResult(
        result,
        selectedProviderName,
        selectedProviderId,
      )
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

  function removeSpecificItem(id: string) {
    replaceSpecificItems(
      specificItemsRef.current.filter((item) => item.id !== id),
    )
  }

  function removeGenericItem(id: string) {
    replaceGenericItems(
      genericItemsRef.current.filter((item) => item.id !== id),
    )
  }

  function changeGenericQuantity(id: string, quantity: number) {
    if (quantity < 1) return

    replaceGenericItems(
      genericItemsRef.current.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    )
  }

  async function handleRegisterEntry() {
    const request = buildRegisterEntryRequest(
      specificItemsRef.current,
      genericItemsRef.current,
    )

    if (!request) {
      notifications.error(
        "Uno de los productos genéricos no tiene un inventario asociado.",
      )
      return
    }

    try {
      await registerEntry(request).unwrap()
      clearPreparation()
      notifications.success("Entrada registrada correctamente.")
    } catch (error) {
      handleError(error, "No se pudo registrar la entrada.")
    }
  }

  return (
    <>
      <article className="rounded-xl border bg-card p-3 sm:p-4">
        <header className="mb-4">
          <h2 className="text-lg font-semibold">Área de preparación</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona un proveedor y escanea los productos para esta entrada.
          </p>
        </header>

        <section aria-labelledby="reading-provider-title">
          <h3 id="reading-provider-title" className="mb-2 text-sm font-medium">
            Proveedor de lectura
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 sm:max-w-sm sm:flex-1">
              <Select value={providerId} onValueChange={handleProviderChange}>
                <SelectTrigger
                  className="h-9 w-full"
                  disabled={isLoadingProviders || isIdentifying}
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
                className={`h-7 w-full justify-center gap-2 px-3 text-xs font-medium sm:w-auto ${
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
                className="w-full sm:w-auto"
                disabled={!hasPendingItems || isIdentifying}
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
              códigos escaneados.
            </AlertDescription>
          </Alert>
        ) : null}

        {hasPendingItems ? (
          <EntryDraftList
            productItems={specificItems}
            genericItems={genericItems}
            onRemoveProduct={removeSpecificItem}
            onRemoveGeneric={removeGenericItem}
            onChangeGenericQuantity={changeGenericQuantity}
          />
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
                Listo para añadir productos
              </EmptyTitle>
              <EmptyDescription className="text-center text-xs">
                {hasProvider
                  ? "Escanea un producto para comenzar la preparación."
                  : "Selecciona un proveedor para activar el escáner y comenzar la preparación."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Button
          type="button"
          className="mt-4 w-full"
          disabled={!hasPendingItems || isIdentifying || isRegistering}
          onClick={() => void handleRegisterEntry()}
        >
          <Package />
          {isRegistering ? "Registrando entrada..." : "Registrar entrada"}
        </Button>
      </article>

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
        title="Preparación sin guardar"
        description="Si abandonas esta pantalla perderás todos los productos preparados."
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

export const EntryPage = () => {
  return (
    <section className="flex flex-col gap-4" aria-label="Entrada de inventario">
      <InventoryPageHeader
        title="Entrada"
        description="Registra los productos que ingresan al inventario."
      />

      <section aria-label="Área de preparación">
        <PreparationArea />
      </section>
    </section>
  )
}
