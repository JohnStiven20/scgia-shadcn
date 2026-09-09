import { useState, type FormEvent, type ReactNode } from "react"
import { Info, Pencil, Plus, Save, Trash2, X } from "lucide-react"

import modelImage from "@/assets/hgu_wifi_5_f.png"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type {
  IdentifierFormValues,
  ModelCategory,
  ModelFormValues,
  ProviderResponse,
  SidePanelMode,
  TelecommunicationItemModelIdentifierResponse,
  TelecommunicationItemModelResponse,
} from "@/features/interface/models/types/model.types"

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function categoryLabel(category: ModelCategory) {
  return category === "SPECIFIC" ? "Específico" : "Genérico"
}

function PanelError({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
    >
      {message}
    </p>
  )
}

type IdentifierListProps = {
  identifiers: TelecommunicationItemModelIdentifierResponse[]
  isLoading: boolean
  onEdit: (identifier: TelecommunicationItemModelIdentifierResponse) => void
  onDelete: (identifier: TelecommunicationItemModelIdentifierResponse) => void
}

function IdentifierList({
  identifiers,
  isLoading,
  onEdit,
  onDelete,
}: IdentifierListProps) {
  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">
        Cargando identificadores...
      </p>
    )
  }

  if (!identifiers.length) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
        Este modelo no tiene identificadores asociados.
      </p>
    )
  }

  return (
    <ItemGroup className="gap-0]overflow-hidden rounded-md border">
      {identifiers.map((identifier, index) => (
        <Item
          key={identifier.id}
          size="xs"
          className={
            index < identifiers.length - 1
              ? "rounded-none border-b p-1"
              : "rounded-none p-1"
          }
        >
          <ItemMedia variant="icon">
            {!identifier.mutable ? (
              <Info
                className="text-muted-foreground"
                aria-label="Identificador protegido"
              />
            ) : null}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{identifier.code}</ItemTitle>
            <ItemDescription
              className={
                identifier.active ? "text-emerald-600" : "text-red-600"
              }
            >
              {identifier.active ? "Activo" : "Inactivo"}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={!identifier.mutable}
              onClick={() => onEdit(identifier)}
              aria-label={`Editar identificador ${identifier.code}`}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={!identifier.mutable}
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(identifier)}
              aria-label={`Eliminar identificador ${identifier.code}`}
            >
              <Trash2 />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}

type ModelDetailProps = IdentifierListProps & {
  model: TelecommunicationItemModelResponse
  onCreateIdentifier: () => void
  onEditModel: () => void
  onDeleteModel: () => void
}

function ModelDetail({
  model,
  identifiers,
  isLoading,
  onCreateIdentifier,
  onEdit,
  onDelete,
  onEditModel,
  onDeleteModel,
}: ModelDetailProps) {
  const canDelete = model.editable && model.deletable

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={onCreateIdentifier}
        >
          <Plus />
          Nuevo identificador
        </Button>
        <Button type="button" size="sm" variant="default" onClick={onEditModel}>
          <Pencil />
          Editar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="text-destructive hover:text-destructive"
          disabled={!canDelete}
          onClick={onDeleteModel}
        >
          <Trash2 />
          Eliminar
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <AspectRatio
          ratio={4 / 3}
          className="w-24 shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <img
            src={modelImage}
            alt="Imagen del modelo"
            className="absolute inset-0 size-full object-contain"
          />
        </AspectRatio>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{model.name}</h3>
          <p className="text-xs text-muted-foreground">
            {categoryLabel(model.telecommunicationItemType)}
          </p>
        </div>
      </div>

      <Separator />

      <dl className="grid gap-0 text-xs">
        <DetailRow
          label="Descripción"
          value={model.description || "Sin descripción"}
        />
        <DetailRow
          label="Proveedor"
          value={
            model.provider ? (
              <Badge variant="secondary">{model.provider.name}</Badge>
            ) : (
              "Sin proveedor"
            )
          }
        />
        <DetailRow
          label="Identificadores"
          value={String(model.identifierCount ?? 0)}
        />
        <DetailRow
          label="Estado de uso"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${model.active ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {model.active ? "Activo" : "Inactivo"}
            </span>
          }
        />
        <DetailRow label="Creado" value={formatDate(model.createdDate)} />
        <DetailRow
          label="Última actualización"
          value={formatDate(model.updatedDate)}
        />
      </dl>

      <section
        className="grid gap-2"
        aria-labelledby="associated-identifiers-title"
      >
        <h3 id="associated-identifiers-title" className="text-sm font-semibold">
          Identificadores asociados
        </h3>
        <IdentifierList
          identifiers={identifiers}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-3 border-b py-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{value}</dd>
    </div>
  )
}

type ModelFormProps = {
  mode: "CREATE_MODEL" | "EDIT_MODEL"
  model: TelecommunicationItemModelResponse | null
  providers: ProviderResponse[]
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (values: ModelFormValues) => Promise<boolean>
}

function ModelForm({
  mode,
  model,
  providers,
  isSubmitting,
  error,
  onCancel,
  onSubmit,
}: ModelFormProps) {
  const editing = mode === "EDIT_MODEL"
  const structuralLocked = editing && model !== null && model.editable
  const [name, setName] = useState(model?.name ?? "")
  const [description, setDescription] = useState(model?.description ?? "")
  const [providerId, setProviderId] = useState(
    model?.provider ? String(model.provider.id) : ""
  )
  const [category, setCategory] = useState<ModelCategory>(
    model?.telecommunicationItemType ?? "SPECIFIC"
  )
  const [active, setActive] = useState(model?.active ?? true)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)

    if (!structuralLocked && !name.trim()) {
      setValidationError("El nombre del modelo es obligatorio.")
      return
    }

    if (!structuralLocked && !providerId) {
      setValidationError("Selecciona un proveedor.")
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      providerId: Number(providerId),
      telecommunicationItemType: category,
      active,
    })
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
      {structuralLocked ? (
        <p className="text-xs text-muted-foreground">
          Este modelo está en uso. Solo se pueden modificar la descripción y el
          estado.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="model-name">Nombre del modelo</Label>
        <Input
          id="model-name"
          value={name}
          disabled={structuralLocked || isSubmitting}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="model-type">Tipo de modelo</Label>
        <Select
          value={category}
          disabled={structuralLocked || isSubmitting}
          onValueChange={(value) => setCategory(value as ModelCategory)}
        >
          <SelectTrigger id="model-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SPECIFIC">Específico</SelectItem>
            <SelectItem value="GENERIC">Genérico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="model-provider">Proveedor</Label>
        <Select
          value={providerId}
          disabled={structuralLocked || isSubmitting}
          onValueChange={(value) => setProviderId(value ?? "")}
        >
          <SelectTrigger id="model-provider" className="w-full">
            <SelectValue placeholder="Selecciona un proveedor" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={String(provider.id)}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="model-description">Descripción</Label>
        <Textarea
          id="model-description"
          value={description}
          maxLength={250}
          disabled={isSubmitting}
          className="min-h-28"
          onChange={(event) => setDescription(event.target.value)}
        />
        <span className="text-right text-xs text-muted-foreground">
          {description.length}/250
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="model-active"
          checked={active}
          disabled={isSubmitting}
          onCheckedChange={setActive}
        />
        <Label htmlFor="model-active">Modelo activo</Label>
      </div>

      <PanelError message={validationError ?? error} />

      <footer className="mt-2 grid grid-cols-2 gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save />
          {editing ? "Guardar cambios" : "Crear modelo"}
        </Button>
      </footer>
    </form>
  )
}

type IdentifierFormProps = IdentifierListProps & {
  mode: "CREATE_IDENTIFIER" | "EDIT_IDENTIFIER"
  model: TelecommunicationItemModelResponse
  identifier: TelecommunicationItemModelIdentifierResponse | null
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (values: IdentifierFormValues) => Promise<boolean>
}

function IdentifierForm({
  mode,
  model,
  identifier,
  identifiers,
  isLoading,
  isSubmitting,
  error,
  onCancel,
  onSubmit,
  onEdit,
  onDelete,
}: IdentifierFormProps) {
  const editing = mode === "EDIT_IDENTIFIER"
  const requiredLength =
    model.telecommunicationItemType === "SPECIFIC" ? 12 : 32
  const [code, setCode] = useState(identifier?.code ?? "")
  const [active, setActive] = useState(identifier?.active ?? true)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)

    if (code.trim().length !== requiredLength) {
      setValidationError(
        `El identificador debe tener exactamente ${requiredLength} caracteres.`
      )
      return
    }

    const saved = await onSubmit({ code: code.trim(), active })

    if (saved && !editing) {
      setCode("")
      setActive(true)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <p className="text-xs text-muted-foreground">Modelo</p>
        <p className="font-medium">{model.name}</p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="identifier-code">Identificador</Label>
        <Input
          id="identifier-code"
          value={code}
          maxLength={requiredLength}
          disabled={isSubmitting}
          placeholder={`${requiredLength} caracteres`}
          onChange={(event) => setCode(event.target.value)}
        />
        <span className="text-right text-xs text-muted-foreground">
          {code.length}/{requiredLength}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="identifier-active"
          checked={active}
          disabled={isSubmitting}
          onCheckedChange={setActive}
        />
        <Label htmlFor="identifier-active">Identificador activo</Label>
      </div>

      <PanelError message={validationError ?? error} />

      <section
        className="grid"
        aria-labelledby="identifier-form-list-title"
      >
        <h3 id="identifier-form-list-title" className="text-sm font-semibold">
          Identificadores asociados
        </h3>
        <IdentifierList
          identifiers={identifiers}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>

      <footer className="mt-2 grid grid-cols-2 gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || code.trim().length !== requiredLength}
        >
          {editing ? <Save /> : <Plus />}
          {editing ? "Guardar cambios" : "Crear identificador"}
        </Button>
      </footer>
    </form>
  )
}

type DeleteConfirmationProps = {
  title: string
  description: string
  itemLabel: string
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

function DeleteConfirmation({
  title,
  description,
  itemLabel,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
        <h3 className="font-medium text-destructive">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm font-semibold">{itemLabel}</p>
      </div>
      <PanelError message={error} />
      <footer className="grid grid-cols-2 gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={isSubmitting}
          onClick={() => void onConfirm()}
        >
          <Trash2 />
          Confirmar eliminación
        </Button>
      </footer>
    </div>
  )
}

type ModelSidePanelProps = {
  desktop: boolean
  mode: SidePanelMode
  model: TelecommunicationItemModelResponse | null
  providers: ProviderResponse[]
  identifiers: TelecommunicationItemModelIdentifierResponse[]
  editingIdentifier: TelecommunicationItemModelIdentifierResponse | null
  identifierToDelete: TelecommunicationItemModelIdentifierResponse | null
  isLoadingIdentifiers: boolean
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onBackToDetail: () => void
  onCreateIdentifier: () => void
  onEditModel: () => void
  onDeleteModel: () => void
  onEditIdentifier: (
    identifier: TelecommunicationItemModelIdentifierResponse
  ) => void
  onDeleteIdentifier: (
    identifier: TelecommunicationItemModelIdentifierResponse
  ) => void
  onSaveModel: (values: ModelFormValues) => Promise<boolean>
  onSaveIdentifier: (values: IdentifierFormValues) => Promise<boolean>
  onConfirmModelDelete: () => Promise<void>
  onConfirmIdentifierDelete: () => Promise<void>
}

function getPanelMeta(mode: SidePanelMode) {
  switch (mode) {
    case "CREATE_MODEL":
      return {
        title: "Nuevo modelo",
        description: "Crea un modelo de inventario.",
      }
    case "EDIT_MODEL":
      return {
        title: "Editar modelo",
        description: "Actualiza la información del modelo.",
      }
    case "CREATE_IDENTIFIER":
      return {
        title: "Nuevo identificador",
        description: "Añade un identificador al modelo seleccionado.",
      }
    case "EDIT_IDENTIFIER":
      return {
        title: "Editar identificador",
        description: "Actualiza el identificador seleccionado.",
      }
    case "CONFIRM_MODEL_DELETE":
      return {
        title: "Eliminar modelo",
        description: "Confirma la eliminación del modelo.",
      }
    case "CONFIRM_IDENTIFIER_DELETE":
      return {
        title: "Eliminar identificador",
        description: "Confirma la eliminación del identificador.",
      }
    default:
      return {
        title: "Detalle del modelo",
        description: "Información y acciones del modelo seleccionado.",
      }
  }
}

export function ModelSidePanel(props: ModelSidePanelProps) {
  const { desktop, mode, onClose } = props
  const open = mode !== "CLOSED"
  const meta = getPanelMeta(mode)
  const content = open ? <PanelBody {...props} /> : null

  if (desktop) {
    if (!open) return null

    return (
      <aside
        className="sticky top-3 flex max-h-[calc(100svh-5rem)] min-h-[34rem] flex-col overflow-hidden rounded-md border bg-background"
        aria-label={meta.title}
      >
        <header className="relative shrink-0 border-b p-4 pr-12">
          <h2 className="text-sm font-semibold">{meta.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {meta.description}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{content}</div>
      </aside>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full! sm:max-w-[30rem]!"
      >
        <SheetHeader className="relative shrink-0 border-b p-4 pr-12">
          <SheetTitle>{meta.title}</SheetTitle>
          <SheetDescription>{meta.description}</SheetDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X />
          </Button>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{content}</div>
      </SheetContent>
    </Sheet>
  )
}

function PanelBody(props: ModelSidePanelProps) {
  const {
    mode,
    model,
    providers,
    identifiers,
    editingIdentifier,
    identifierToDelete,
    isLoadingIdentifiers,
    isSubmitting,
    error,
    onClose,
    onBackToDetail,
    onCreateIdentifier,
    onEditModel,
    onDeleteModel,
    onEditIdentifier,
    onDeleteIdentifier,
    onSaveModel,
    onSaveIdentifier,
    onConfirmModelDelete,
    onConfirmIdentifierDelete,
  } = props

  if (mode === "CREATE_MODEL") {
    return (
      <ModelForm
        key="create-model"
        mode={mode}
        model={null}
        providers={providers}
        isSubmitting={isSubmitting}
        error={error}
        onCancel={onClose}
        onSubmit={onSaveModel}
      />
    )
  }

  if (!model) {
    return (
      <p className="text-xs text-muted-foreground">Selecciona un modelo.</p>
    )
  }

  if (mode === "EDIT_MODEL") {
    return (
      <ModelForm
        key={`edit-model-${model.id}`}
        mode={mode}
        model={model}
        providers={providers}
        isSubmitting={isSubmitting}
        error={error}
        onCancel={onBackToDetail}
        onSubmit={onSaveModel}
      />
    )
  }

  if (mode === "CREATE_IDENTIFIER" || mode === "EDIT_IDENTIFIER") {
    return (
      <IdentifierForm
        key={`${mode}-${model.id}-${editingIdentifier?.id ?? "new"}`}
        mode={mode}
        model={model}
        identifier={editingIdentifier}
        identifiers={identifiers}
        isLoading={isLoadingIdentifiers}
        isSubmitting={isSubmitting}
        error={error}
        onCancel={onBackToDetail}
        onSubmit={onSaveIdentifier}
        onEdit={onEditIdentifier}
        onDelete={onDeleteIdentifier}
      />
    )
  }

  if (mode === "CONFIRM_MODEL_DELETE") {
    return (
      <DeleteConfirmation
        title="Esta acción no se puede deshacer"
        description="Se eliminará el modelo y dejará de estar disponible en el catálogo."
        itemLabel={model.name}
        isSubmitting={isSubmitting}
        error={error}
        onCancel={onBackToDetail}
        onConfirm={onConfirmModelDelete}
      />
    )
  }

  if (mode === "CONFIRM_IDENTIFIER_DELETE" && identifierToDelete) {
    return (
      <DeleteConfirmation
        title="Esta acción no se puede deshacer"
        description="Se eliminará el identificador seleccionado."
        itemLabel={identifierToDelete.code}
        isSubmitting={isSubmitting}
        error={error}
        onCancel={onBackToDetail}
        onConfirm={onConfirmIdentifierDelete}
      />
    )
  }

  return (
    <ModelDetail
      model={model}
      identifiers={identifiers}
      isLoading={isLoadingIdentifiers}
      onCreateIdentifier={onCreateIdentifier}
      onEditModel={onEditModel}
      onDeleteModel={onDeleteModel}
      onEdit={onEditIdentifier}
      onDelete={onDeleteIdentifier}
    />
  )
}
