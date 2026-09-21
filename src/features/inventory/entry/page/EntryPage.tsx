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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
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
import { Field, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from "@/components/reui/stepper"
import { useGlobalError } from "@/hooks"
import type { IdentificationResponse } from "@/features/interface/identification/types"
import {
  useLazyGenericItemsQuery,
  type GenericItemResponse,
} from "@/features/inventory/api/generic-items.service"
import { useIdentifyProductMutation } from "@/features/inventory/api/identificationApi"
import {
  useLazyIdentifiersQuery,
  type IdentifierResponse,
} from "@/features/inventory/api/identifiers.service"
import {
  useGetProvidersQuery,
  useLazyGetTelecommunicationModelsSelectionQuery,
} from "@/features/inventory/api/modelsApi"
import {
  useRegisterEntryMutation,
  type RegisterTelecommunicationsItemsRequest,
} from "@/features/inventory/api/operations.service"
import { InventoryPageHeader } from "../../components"
import { EntryDraftList } from "../components/EntryDraftList"
import { useInventoryScanner } from "../hooks/useInventoryScanner"
import type { GenericEntryDraftItem, SpecificEntryDraftItem } from "../types"

type ProductType = "SPECIFIC" | "GENERIC"

type FlowModel = {
  modelId: number
  name: string
  genericItemId?: number
}

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
  last?: boolean
  children: React.ReactNode
}

type ModelComboboxProps = {
  id: string
  models: FlowModel[]
  value: FlowModel | null
  onValueChange: (model: FlowModel | null) => void
  placeholder: string
  disabled?: boolean
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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
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
          <div className="pt-3">{children}</div>
        </section>
      </div>
    </StepperItem>
  )
}

function ModelCombobox({
  id,
  models,
  value,
  onValueChange,
  placeholder,
  disabled = false,
}: ModelComboboxProps) {
  return (
    <Combobox
      items={models}
      value={value}
      onValueChange={onValueChange}
      itemToStringValue={(model) => model.name}
    >
      <ComboboxTrigger
        id={id}
        disabled={disabled}
        className="flex h-14 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
      >
        {value ? (
          <span className="flex min-w-0 items-center gap-3">
            <img
              src={hguImage}
              alt=""
              className="size-9 shrink-0 object-contain"
            />
            <span className="truncate font-medium">{value.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          aria-label="Buscar modelo"
          showTrigger={false}
          placeholder="Buscar modelo..."
        />
        <ComboboxEmpty>No se encontraron modelos.</ComboboxEmpty>
        <ComboboxList>
          {(model) => (
            <ComboboxItem
              key={model.modelId}
              value={model}
              className="min-h-14 gap-3 px-3 py-2 text-sm"
            >
              <img
                src={hguImage}
                alt=""
                className="size-9 shrink-0 object-contain"
              />
              <span className="truncate font-medium">{model.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}



function buildRegisterEntryRequest(
  specificItems: SpecificEntryDraftItem[],
  genericItems: GenericEntryDraftItem[]
): RegisterTelecommunicationsItemsRequest | null {
  const validGenericItems = genericItems.filter(
    (
      item
    ): item is GenericEntryDraftItem & {
      telecommunicationGenericItemId: number
    } => item.telecommunicationGenericItemId !== null
  )

  if (validGenericItems.length !== genericItems.length) return null

  return {
    genericItems: validGenericItems.map((item) => ({
      quantity: item.quantity,
      telecommunicationGenericId: item.telecommunicationGenericItemId,
      identifierId: item.identifierId,
    })),
    specificItems: specificItems.map((item) => ({
      uniqueCode: item.uniqueCode,
      telecommunicationItemModelId: item.modelId,
      telecommunicationItemModelIdentifierId: item.identifierId,
    })),
  }
}

type PreparationAreaProps = {
  hasProvider: boolean
  hasPendingItems: boolean
  isIdentifying: boolean
  isRegistering: boolean
  specificItems: SpecificEntryDraftItem[]
  genericItems: GenericEntryDraftItem[]
  onRequestClear: () => void
  onRemoveSpecificItem: (id: string) => void
  onRemoveGenericItem: (id: string) => void
  onChangeGenericQuantity: (id: string, quantity: number) => void
  onRegisterEntry: () => void
}

function PreparationArea({
  hasProvider,
  hasPendingItems,
  isIdentifying,
  isRegistering,
  specificItems,
  genericItems,
  onRequestClear,
  onRemoveSpecificItem,
  onRemoveGenericItem,
  onChangeGenericQuantity,
  onRegisterEntry,
}: PreparationAreaProps) {
  return (
    <>
      <article className="flex w-full min-w-0 flex-col rounded-xl border bg-card p-3 sm:p-4 min-h-146.25 lg:flex-2">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Área de preparación</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa el flujo o utiliza el escáner para añadir productos.
            </p>
          </div>
          <aside
            className="flex flex-wrap items-center gap-2"
            aria-label="Estado del escáner y preparación"
          >
            <Badge
              variant="secondary"
              role="status"
              aria-live="polite"
              className={`h-7 gap-2 px-3 text-xs font-medium ${isIdentifying
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
              size="sm"
              disabled={!hasPendingItems || isIdentifying}
              onClick={onRequestClear}
            >
              <Trash2 />
              Limpiar área
            </Button>
          </aside>
        </header>

        <section className="flex flex-col flex-1 gap-2 h-100">
          {hasPendingItems ? (
            <EntryDraftList
              productItems={specificItems}
              genericItems={genericItems}
              onRemoveProduct={onRemoveSpecificItem}
              onRemoveGeneric={onRemoveGenericItem}
              onChangeGenericQuantity={onChangeGenericQuantity}
            />
          ) : (
            <Empty className="mt-5 rounded-lg border border-dashed border-primary/20 bg-background px-4 py-6 flex-1">
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
                    ? "Completa el flujo o escanea un producto para comenzar la preparación."
                    : "Selecciona un proveedor para activar el flujo y el escáner."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <Button
            type="button"
            className="mt-4 w-full"
            disabled={!hasPendingItems || isIdentifying || isRegistering}
            onClick={onRegisterEntry}
          >
            <Package />
            {isRegistering ? "Registrando entrada..." : "Registrar entrada"}
          </Button>
        </section>
      </article>

    </>
  )
}

export const EntryPage = () => {

  const [providerId, setProviderId] = useState("")
  const [pendingProviderId, setPendingProviderId] = useState<string | null>(
    null
  )
  const [productType, setProductType] = useState<ProductType | null>(null)
  const [selectedModel, setSelectedModel] = useState<FlowModel | null>(null)
  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierResponse | null>(null)
  const [uniqueCode, setUniqueCode] = useState("")
  const [genericQuantity, setGenericQuantity] = useState(1)
  const [specificItems, setSpecificItems] = useState<SpecificEntryDraftItem[]>(
    []
  )
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
  const [loadSpecificModels, specificModelsResult] =
    useLazyGetTelecommunicationModelsSelectionQuery()
  const [loadGenericItems, genericItemsResult] = useLazyGenericItemsQuery()
  const [loadIdentifiers, identifiersResult] = useLazyIdentifiersQuery()
  const [identifyProduct, { isLoading: isIdentifying }] =
    useIdentifyProductMutation()
  const [registerEntry, { isLoading: isRegistering }] =
    useRegisterEntryMutation()

  const activeProviders = providers.filter((provider) => provider.active)
  const selectedProvider = activeProviders.find(
    (provider) => String(provider.id) === providerId
  )
  const selectedProviderId = selectedProvider?.id
  const selectedProviderName = selectedProvider?.name
  const hasProvider = selectedProviderId !== undefined
  const hasPendingItems = specificItems.length > 0 || genericItems.length > 0
  const blocker = useBlocker(hasPendingItems)
  const modelsLoading =
    specificModelsResult.isFetching || genericItemsResult.isFetching
  const activeStep = !hasProvider
    ? 1
    : !productType
      ? 2
      : !selectedModel
        ? 3
        : !selectedIdentifier
          ? 4
          : 5
  const specificModelOptions: FlowModel[] = (
    specificModelsResult.data ?? []
  ).map((model) => ({ modelId: model.id, name: model.name }))
  const genericModelOptions: FlowModel[] = (genericItemsResult.data ?? []).map(
    (item: GenericItemResponse) => ({
      modelId: item.modelId,
      name: item.genericItemName,
      genericItemId: item.genericItemId,
    })
  )
  const modelOptions =
    productType === "SPECIFIC" ? specificModelOptions : genericModelOptions

  const replaceSpecificItems = useCallback(
    (nextItems: SpecificEntryDraftItem[]) => {
      specificItemsRef.current = nextItems
      setSpecificItems(nextItems)
    },
    []
  )
  const replaceGenericItems = useCallback(
    (nextItems: GenericEntryDraftItem[]) => {
      genericItemsRef.current = nextItems
      setGenericItems(nextItems)
    },
    []
  )
  const resetFlow = useCallback(() => {
    setProductType(null)
    setSelectedModel(null)
    setSelectedIdentifier(null)
    setUniqueCode("")
    setGenericQuantity(1)
  }, [])
  const clearPreparation = useCallback(() => {
    replaceSpecificItems([])
    replaceGenericItems([])
    resetFlow()
  }, [replaceGenericItems, replaceSpecificItems, resetFlow])

  const addIdentificationResult = useCallback(
    (
      result: IdentificationResponse,
      providerName: string,
      provider: number
    ) => {
      if (result.productType === "SPECIFIC") {
        if (!result.uniqueCode || !result.uniqueCodeType) {
          notifications.error(
            "La respuesta no contiene el identificador único del producto."
          )
          return
        }
        if (
          specificItemsRef.current.some(
            (item) => item.uniqueCode === result.uniqueCode
          )
        ) {
          notifications.notify(
            `El código ${result.uniqueCode} ya está en la preparación.`,
            "warning"
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
          item.identifierId === result.identifier.id &&
          item.telecommunicationGenericItemId ===
          result.telecommunicationGenericItemId
      )
      if (existingIndex >= 0) {
        replaceGenericItems(
          genericItemsRef.current.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
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
    [notifications, replaceGenericItems, replaceSpecificItems]
  )

  async function handleScanCode(rawCode: string) {

    const normalizedCode = rawCode.trim()
    
    if (selectedProviderId === undefined || !selectedProviderName) {
      notifications.error(
        "Selecciona un proveedor antes de utilizar el escáner."
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
        "warning"
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

      
      addIdentificationResult(result, selectedProviderName, selectedProviderId)
      
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

  function applyProviderChange(nextProviderId: string) {
    setProviderId(nextProviderId)
    resetFlow()
  }

  function handleProviderChange(nextProviderId: string | null) {
    const normalizedProviderId = nextProviderId ?? ""
    if (normalizedProviderId === providerId) return
    if (hasPendingItems) {
      setPendingProviderId(normalizedProviderId)
      return
    }
    applyProviderChange(normalizedProviderId)
  }

  function confirmProviderChange() {
    if (pendingProviderId === null) return
    clearPreparation()
    setProviderId(pendingProviderId)
    setPendingProviderId(null)
  }

  async function handleProductTypeChange(nextProductType: ProductType) {
    if (selectedProviderId === undefined) return
    setProductType(nextProductType)
    setSelectedModel(null)
    setSelectedIdentifier(null)
    setUniqueCode("")
    setGenericQuantity(1)
    try {
      if (nextProductType === "SPECIFIC") {
        await loadSpecificModels({
          providerId: selectedProviderId,
          modelType: "SPECIFIC",
          operationType: "ENTRY",
        }).unwrap()
      } else {
        await loadGenericItems().unwrap()
      }
    } catch (error) {
      handleError(error, "No se pudieron cargar los modelos disponibles.")
    }
  }

  async function handleModelChange(model: FlowModel | null) {
    setSelectedModel(model)
    setSelectedIdentifier(null)
    setUniqueCode("")
    setGenericQuantity(1)
    if (!model) return
    try {
      await loadIdentifiers(model.modelId).unwrap()
    } catch (error) {
      handleError(
        error,
        "No se pudieron cargar los identificadores del modelo."
      )
    }
  }

  function addSpecificEntry() {
    
    const normalizedUniqueCode = uniqueCode.trim()
    if (
      !selectedProviderId ||
      !selectedProviderName ||
      !selectedModel ||
      !selectedIdentifier
    )
      return
    if (!normalizedUniqueCode) {
      notifications.error("Introduce el identificador único de la unidad.")
      return
    }
    if (
      specificItemsRef.current.some(
        (item) => item.uniqueCode === normalizedUniqueCode
      )
    ) {
      notifications.notify(
        `El código ${normalizedUniqueCode} ya está en la preparación.`,
        "warning"
      )
      return
    }
    replaceSpecificItems([
      ...specificItemsRef.current,
      {
        providerId: selectedProviderId,
        modelId: selectedModel.modelId,
        identifierId: selectedIdentifier.identifierId,
        telecommunicationItemId: null,
        model: selectedModel.name,
        modelIdentifier: selectedIdentifier.identifierCode,
        provider: selectedProviderName,
        uniqueCode: normalizedUniqueCode,
      },
    ])
    setUniqueCode("")
    notifications.success(`${selectedModel.name} añadido a la preparación.`)
  }

  function addGenericEntry() {
    if (
      !selectedProviderId ||
      !selectedProviderName ||
      !selectedModel ||
      !selectedIdentifier
    )
      return
    if (selectedModel.genericItemId === undefined) {
      notifications.error(
        "El producto genérico no tiene un identificador asociado."
      )
      return
    }
    if (!Number.isInteger(genericQuantity) || genericQuantity < 1) {
      notifications.error(
        "La cantidad debe ser un número entero mayor que cero."
      )
      return
    }

    const existingIndex = genericItemsRef.current.findIndex(
      (item) =>
        item.modelId === selectedModel.modelId &&
        item.identifierId === selectedIdentifier.identifierId &&
        item.telecommunicationGenericItemId === selectedModel.genericItemId
    )
    if (existingIndex >= 0) {
      replaceGenericItems(
        genericItemsRef.current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + genericQuantity }
            : item
        )
      )
    } else {
      replaceGenericItems([
        ...genericItemsRef.current,
        {
          id: createTemporaryId(),
          providerId: selectedProviderId,
          modelId: selectedModel.modelId,
          identifierId: selectedIdentifier.identifierId,
          telecommunicationGenericItemId: selectedModel.genericItemId,
          model: selectedModel.name,
          provider: selectedProviderName,
          identifier: selectedIdentifier.identifierCode,
          identifierType: "Identificador asociado",
          quantity: genericQuantity,
        },
      ])
    }
    setGenericQuantity(1)
    notifications.success(`${selectedModel.name} añadido a la preparación.`)
  }

  function removeSpecificItem(id: string) {
    replaceSpecificItems(
      specificItemsRef.current.filter((item) => item.id !== id)
    )
  }

  function removeGenericItem(id: string) {
    replaceGenericItems(
      genericItemsRef.current.filter((item) => item.id !== id)
    )
  }

  function changeGenericQuantity(id: string, quantity: number) {
    if (quantity < 1) return
    replaceGenericItems(
      genericItemsRef.current.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  async function handleRegisterEntry() {

    const request = buildRegisterEntryRequest(
      specificItemsRef.current,
      genericItemsRef.current
    )

    if (!request) {
      notifications.error(
        "Uno de los productos genéricos no tiene un inventario asociado."
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
    <article className="flex flex-col gap-4" aria-label="Entrada de inventario">

      <InventoryPageHeader
        title="Entrada"
        description="Registra los productos que ingresan al inventario."
      />

      <section className="flex flex-col gap-4 lg:flex-row lg:items-start">

        <article className="w-full min-w-0 rounded-xl border bg-card p-5 lg:flex-1">
          {isProvidersError ? (
            <Alert variant="destructive" className="mb-5">
              <Info />
              <AlertTitle>No se pudieron cargar los proveedores.</AlertTitle>
              <AlertDescription>
                Revisa la conexión con el servicio e inténtalo de nuevo.
              </AlertDescription>
            </Alert>
          ) : null}

          <section aria-label="Flujo de alta manual">
            <Stepper value={activeStep} orientation="vertical">
              <StepperNav className="w-full">
                <WorkflowStep number={1} title="Proveedor">
                  <FieldSet>
                    <legend className="sr-only">Selección de proveedor</legend>
                    <Field>
                      <FieldLabel htmlFor="entry-provider">
                        Proveedor de lectura
                      </FieldLabel>
                      <Select
                        value={providerId}
                        onValueChange={handleProviderChange}
                      >
                        <SelectTrigger
                          id="entry-provider"
                          className="h-11 w-full"
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
                            <SelectItem
                              key={provider.id}
                              value={String(provider.id)}
                            >
                              <span className="font-medium">{provider.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldSet>
                </WorkflowStep>

                <Collapsible open={hasProvider}>
                  <CollapsibleContent>
                    <WorkflowStep number={2} title="Tipo de producto">
                      <FieldSet>
                        <legend className="sr-only">Tipo de producto</legend>
                        <nav
                          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
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
                            Productos específicos
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
                            Productos genéricos
                          </Button>
                        </nav>
                      </FieldSet>
                    </WorkflowStep>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={productType !== null}>
                  <CollapsibleContent>
                    <WorkflowStep
                      number={3}
                      title={
                        productType === "SPECIFIC"
                          ? "Modelo específico"
                          : "Modelo genérico"
                      }
                    >
                      <FieldSet>
                        <legend className="sr-only">Selección de modelo</legend>
                        <Field>
                          <FieldLabel htmlFor="entry-model">
                            {productType === "SPECIFIC"
                              ? "Selecciona un modelo específico del catálogo."
                              : "Selecciona un modelo genérico del catálogo."}
                          </FieldLabel>
                          <ModelCombobox
                            id="entry-model"
                            models={modelOptions}
                            value={selectedModel}
                            onValueChange={handleModelChange}
                            placeholder={
                              modelsLoading
                                ? "Cargando modelos..."
                                : "Selecciona un modelo"
                            }
                            disabled={modelsLoading || modelOptions.length === 0}
                          />
                        </Field>
                        {specificModelsResult.isError ||
                          genericItemsResult.isError ? (
                          <Alert variant="destructive">
                            <Info />
                            <AlertDescription>
                              No se pudieron cargar los modelos disponibles.
                            </AlertDescription>
                          </Alert>
                        ) : null}
                      </FieldSet>
                    </WorkflowStep>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={selectedModel !== null}>
                  <CollapsibleContent>
                    <WorkflowStep number={4} title="Identificador asociado">
                      <FieldSet>
                        <legend className="sr-only">
                          Selección de identificador asociado
                        </legend>
                        <Field>
                          <FieldLabel htmlFor="entry-identifier">
                            Selecciona un identificador asociado al modelo.
                          </FieldLabel>
                          <Select
                            value={
                              selectedIdentifier
                                ? String(selectedIdentifier.code)
                                : ""
                            }
                            onValueChange={(value) => {
                              const identifier = (
                                identifiersResult.data ?? []
                              ).find(
                                (item) => String(item.code) === value
                              )
                              setSelectedIdentifier(identifier ?? null)
                              setUniqueCode("")
                              setGenericQuantity(1)
                            }}
                          >
                            <SelectTrigger
                              id="entry-identifier"
                              className="h-11 w-full"
                              disabled={identifiersResult.isFetching}
                            >
                              <SelectValue
                                placeholder={
                                  identifiersResult.isFetching
                                    ? "Cargando identificadores..."
                                    : "Selecciona un identificador"
                                }
                              >
                                {selectedIdentifier?.code}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent align="start">
                              {(identifiersResult.data ?? []).map(
                                (identifier) => (
                                  <SelectItem
                                    key={identifier.id}
                                    value={String(identifier.code)}
                                  >
                                    {identifier.code}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </Field>
                        {identifiersResult.isError ? (
                          <Alert variant="destructive">
                            <Info />
                            <AlertDescription>
                              No se pudieron cargar los identificadores del
                              modelo.
                            </AlertDescription>
                          </Alert>
                        ) : null}
                      </FieldSet>
                    </WorkflowStep>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={selectedIdentifier !== null}>
                  <CollapsibleContent>
                    <WorkflowStep
                      number={5}
                      title={
                        productType === "SPECIFIC"
                          ? "Identificador único de la unidad"
                          : "Cantidad"
                      }
                      last
                    >
                      <FieldSet>
                        <legend className="sr-only">
                          {productType === "SPECIFIC"
                            ? "Identificador único"
                            : "Cantidad del producto genérico"}
                        </legend>
                        {productType === "SPECIFIC" ? (
                          <Field>
                            <FieldLabel htmlFor="entry-unique-code">
                              Identificador único
                            </FieldLabel>
                            <Input
                              id="entry-unique-code"
                              value={uniqueCode}
                              onChange={(event) =>
                                setUniqueCode(event.target.value)
                              }
                              placeholder="Introduce el identificador único de la unidad"
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault()
                                  addSpecificEntry()
                                }
                              }}
                            />
                          </Field>
                        ) : (
                          <Field>
                            <FieldLabel htmlFor="entry-generic-quantity">
                              Cantidad
                            </FieldLabel>
                            <Input
                              id="entry-generic-quantity"
                              type="number"
                              min={1}
                              step={1}
                              value={genericQuantity}
                              onChange={(event) => {
                                const value = Number(event.target.value)
                                setGenericQuantity(
                                  Number.isFinite(value) ? Math.max(1, value) : 1
                                )
                              }}
                            />
                          </Field>
                        )}
                        <Button
                          type="button"
                          onClick={
                            productType === "SPECIFIC"
                              ? addSpecificEntry
                              : addGenericEntry
                          }
                          disabled={
                            productType === "SPECIFIC"
                              ? !uniqueCode.trim()
                              : genericQuantity < 1
                          }
                        >
                          <Package />
                          Añadir producto
                        </Button>
                      </FieldSet>
                    </WorkflowStep>
                  </CollapsibleContent>
                </Collapsible>
              </StepperNav>
            </Stepper>
          </section>
        </article>

        <PreparationArea
          hasProvider={hasProvider}
          hasPendingItems={hasPendingItems}
          isIdentifying={isIdentifying}
          isRegistering={isRegistering}
          specificItems={specificItems}
          genericItems={genericItems}
          onRequestClear={() => setClearDialogOpen(true)}
          onRemoveSpecificItem={removeSpecificItem}
          onRemoveGenericItem={removeGenericItem}
          onChangeGenericQuantity={changeGenericQuantity}
          onRegisterEntry={() => void handleRegisterEntry()}
        />

      </section>

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
    </article>
  )

}
