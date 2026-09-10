import { Minus, Package, Plus, Trash2 } from "lucide-react"

import hguImage from "@/assets/hgu_wifi_5_f.png"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  ExitConsumableDraftItem,
  ExitDraftItem,
  ExitSpecificDraftItem,
} from "../types"

type SpecificIdentifierGroup = {
  identifierId: number
  identifierCode: string
  items: ExitSpecificDraftItem[]
}

type SpecificModelGroup = {
  modelId: number
  modelName: string
  identifierGroups: SpecificIdentifierGroup[]
  total: number
}

type ConsumableModelGroup = {
  modelId: number
  modelName: string
  items: ExitConsumableDraftItem[]
  total: number
}

type ExitDraftListProps = {
  draft: ExitDraftItem[]
  onRemove: (draftId: string) => void
  onChangeConsumableQuantity: (draftId: string, quantity: number) => void
  canIncrementConsumable: (item: ExitConsumableDraftItem) => boolean
}

function quantityText(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function groupSpecificItems(items: ExitSpecificDraftItem[]) {
  const models = new Map<
    number,
    {
      modelName: string
      identifiers: Map<
        number,
        { identifierCode: string; items: ExitSpecificDraftItem[] }
      >
      total: number
    }
  >()

  for (const item of items) {
    const model = models.get(item.modelId) ?? {
      modelName: item.modelName,
      identifiers: new Map(),
      total: 0,
    }
    const identifier = model.identifiers.get(item.identifierId) ?? {
      identifierCode: item.identifierCode,
      items: [],
    }

    identifier.items.push(item)
    model.identifiers.set(item.identifierId, identifier)
    model.total += 1
    models.set(item.modelId, model)
  }

  return Array.from(models, ([modelId, model]): SpecificModelGroup => ({
    modelId,
    modelName: model.modelName,
    identifierGroups: Array.from(
      model.identifiers,
      ([identifierId, identifier]): SpecificIdentifierGroup => ({
        identifierId,
        identifierCode: identifier.identifierCode,
        items: identifier.items,
      })
    ),
    total: model.total,
  }))
}

function groupConsumableItems(items: ExitConsumableDraftItem[]) {
  const models = new Map<number, ConsumableModelGroup>()

  for (const item of items) {
    const model = models.get(item.modelId) ?? {
      modelId: item.modelId,
      modelName: item.modelName,
      items: [],
      total: 0,
    }

    model.items.push(item)
    model.total += item.quantity
    models.set(item.modelId, model)
  }

  return Array.from(models.values())
}

function SpecificGroup({
  group,
  value,
  onRemove,
}: {
  group: SpecificModelGroup
  value: string
  onRemove: (draftId: string) => void
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="items-center gap-3 p-3 no-underline hover:no-underline">
        <AspectRatio
          ratio={4 / 3}
          className="w-14 shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <img src={hguImage} alt="" className="size-full object-contain p-1" />
        </AspectRatio>
        <span className="min-w-0 truncate text-sm font-semibold">
          {group.modelName}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {quantityText(group.total)}
        </Badge>
      </AccordionTrigger>

      <AccordionContent className="space-y-3 px-3 pb-3">
        {group.identifierGroups.map((identifierGroup) => (
          <section
            key={identifierGroup.identifierId}
            aria-label={`Identificador ${identifierGroup.identifierCode}`}
            className="border-t pt-3 first:border-t-0 first:pt-0"
          >
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Identificador asociado al modelo:{" "}
                <strong className="text-foreground">
                  {identifierGroup.identifierCode}
                </strong>
              </p>
              <span className="text-xs font-medium text-primary">
                {quantityText(identifierGroup.items.length)}
              </span>
            </header>

            <ul className="space-y-2">
              {identifierGroup.items.map((item) => (
                <li
                  key={item.draftId}
                  className="flex flex-col gap-1.5 rounded-md border bg-background p-2 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold break-all">
                      {item.uniqueCodeType}: {item.uniqueCode}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Motivo: {item.reason}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="self-end text-destructive hover:text-destructive sm:self-auto"
                    aria-label={`Eliminar ${item.uniqueCode}`}
                    onClick={() => onRemove(item.draftId)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}

function ConsumableGroup({
  group,
  value,
  onRemove,
  onChangeQuantity,
  canIncrement,
}: {
  group: ConsumableModelGroup
  value: string
  onRemove: (draftId: string) => void
  onChangeQuantity: (draftId: string, quantity: number) => void
  canIncrement: (item: ExitConsumableDraftItem) => boolean
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="items-center gap-3 p-3 no-underline hover:no-underline">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Package className="size-6 stroke-[1.5]" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold">
          {group.modelName}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {quantityText(group.total)}
        </Badge>
      </AccordionTrigger>

      <AccordionContent className="px-3 pb-3">
        <ul className="divide-y rounded-md border bg-background">
          {group.items.map((item) => (
            <li
              key={item.draftId}
              className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold break-all">
                  <span className="mr-2 text-muted-foreground">
                    {item.identifierType}
                  </span>
                  {item.identifierCode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Motivo: {item.reason}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={item.quantity <= 1}
                  aria-label={`Reducir cantidad de ${item.modelName}`}
                  onClick={() =>
                    onChangeQuantity(item.draftId, item.quantity - 1)
                  }
                >
                  <Minus />
                </Button>
                <span className="min-w-20 text-center text-xs font-medium">
                  {quantityText(item.quantity)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={!canIncrement(item)}
                  aria-label={`Aumentar cantidad de ${item.modelName}`}
                  onClick={() =>
                    onChangeQuantity(item.draftId, item.quantity + 1)
                  }
                >
                  <Plus />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Eliminar ${item.modelName}`}
                  onClick={() => onRemove(item.draftId)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  )
}

export function ExitDraftList({
  draft,
  onRemove,
  onChangeConsumableQuantity,
  canIncrementConsumable,
}: ExitDraftListProps) {
  const specificGroups = groupSpecificItems(
    draft.filter(
      (item): item is ExitSpecificDraftItem => item.kind === "SPECIFIC"
    )
  )
  const consumableGroups = groupConsumableItems(
    draft.filter(
      (item): item is ExitConsumableDraftItem => item.kind === "CONSUMABLE"
    )
  )
  const defaultOpenGroups = [
    ...specificGroups.map((group) => `specific-${group.modelId}`),
    ...consumableGroups.map((group) => `consumable-${group.modelId}`),
  ]

  return (
    <Accordion
      key={defaultOpenGroups.join("|")}
      multiple
      defaultValue={defaultOpenGroups}
    >
      {specificGroups.map((group) => (
        <SpecificGroup
          key={`specific-${group.modelId}`}
          value={`specific-${group.modelId}`}
          group={group}
          onRemove={onRemove}
        />
      ))}
      {consumableGroups.map((group) => (
        <ConsumableGroup
          key={`consumable-${group.modelId}`}
          value={`consumable-${group.modelId}`}
          group={group}
          onRemove={onRemove}
          onChangeQuantity={onChangeConsumableQuantity}
          canIncrement={canIncrementConsumable}
        />
      ))}
    </Accordion>
  )
}
