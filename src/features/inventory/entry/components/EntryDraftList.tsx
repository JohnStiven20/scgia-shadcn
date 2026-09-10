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
  GenericEntryDraftItem,
  SpecificEntryDraftItem,
} from "../types"

type SpecificIdentifierGroup = {
  identifier: string
  units: SpecificEntryDraftItem[]
}

type SpecificModelGroup = {
  modelId: number
  model: string
  identifiers: SpecificIdentifierGroup[]
  total: number
}

type GenericModelGroup = {
  modelId: number
  model: string
  identifiers: GenericEntryDraftItem[]
  total: number
}

type EntryDraftListProps = {
  productItems: SpecificEntryDraftItem[]
  genericItems: GenericEntryDraftItem[]
  onRemoveProduct: (id: string) => void
  onRemoveGeneric: (id: string) => void
  onChangeGenericQuantity: (id: string, quantity: number) => void
}

function quantityText(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function groupSpecificItems(items: SpecificEntryDraftItem[]) {
  const modelGroups = new Map<
    number,
    {
      model: string
      identifiers: Map<string, SpecificEntryDraftItem[]>
      total: number
    }
  >()

  for (const item of items) {
    const modelGroup = modelGroups.get(item.modelId) ?? {
      model: item.model,
      identifiers: new Map<string, SpecificEntryDraftItem[]>(),
      total: 0,
    }
    const units = modelGroup.identifiers.get(item.modelIdentifier) ?? []

    units.push(item)
    modelGroup.identifiers.set(item.modelIdentifier, units)
    modelGroup.total += 1
    modelGroups.set(item.modelId, modelGroup)
  }

  return Array.from(modelGroups, ([modelId, group]): SpecificModelGroup => ({
    modelId,
    model: group.model,
    identifiers: Array.from(
      group.identifiers,
      ([identifier, units]): SpecificIdentifierGroup => ({ identifier, units }),
    ),
    total: group.total,
  }))
}

function groupGenericItems(items: GenericEntryDraftItem[]) {
  const modelGroups = new Map<number, GenericModelGroup>()

  for (const item of items) {
    const modelGroup = modelGroups.get(item.modelId) ?? {
      modelId: item.modelId,
      model: item.model,
      identifiers: [],
      total: 0,
    }

    modelGroup.identifiers.push(item)
    modelGroup.total += item.quantity
    modelGroups.set(item.modelId, modelGroup)
  }

  return Array.from(modelGroups.values())
}

function SpecificModelSection({
  group,
  value,
  onRemoveProduct,
}: {
  group: SpecificModelGroup
  value: string
  onRemoveProduct: (id: string) => void
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="items-center gap-3 p-3 no-underline hover:no-underline">
        <AspectRatio
          ratio={4 / 3}
          className="w-14 shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <img
            src={hguImage}
            alt=""
            className="size-full object-contain p-1"
          />
        </AspectRatio>
        <span className="min-w-0 truncate text-sm font-semibold">
          {group.model}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {quantityText(group.total)}
        </Badge>
      </AccordionTrigger>

      <AccordionContent className="space-y-3 px-3 pb-3">
        {group.identifiers.map((identifierGroup) => (
          <section
            key={identifierGroup.identifier}
            aria-label={`Identificador ${identifierGroup.identifier}`}
            className="border-t pt-3 first:border-t-0 first:pt-0"
          >
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Identificador asociado al modelo:{" "}
                <strong className="text-foreground">
                  {identifierGroup.identifier}
                </strong>
              </p>
              <span className="text-xs font-medium text-primary">
                {quantityText(identifierGroup.units.length)}
              </span>
            </header>

            <ul className="flex flex-wrap gap-2">
              {identifierGroup.units.map((unit) => (
                <li
                  key={unit.id}
                  className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1"
                >
                  <Package className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs font-medium">
                    {unit.uniqueCodeType}: {unit.uniqueCode}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Eliminar ${unit.uniqueCode}`}
                    onClick={() => onRemoveProduct(unit.id)}
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

function GenericModelSection({
  group,
  value,
  onRemoveGeneric,
  onChangeGenericQuantity,
}: {
  group: GenericModelGroup
  value: string
  onRemoveGeneric: (id: string) => void
  onChangeGenericQuantity: (id: string, quantity: number) => void
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="items-center gap-3 p-3 no-underline hover:no-underline">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Package className="size-6 stroke-[1.5]" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold">
          {group.model}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {quantityText(group.total)}
        </Badge>
      </AccordionTrigger>

      <AccordionContent className="px-3 pb-3">
        <ul className="divide-y rounded-md border bg-background">
          {group.identifiers.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <span className="mr-2 text-xs font-medium text-muted-foreground">
                  {item.identifierType}
                </span>
                <span className="break-all text-xs font-semibold">
                  {item.identifier}
                </span>
              </div>

              <div className="flex items-center justify-end gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={item.quantity <= 1}
                  aria-label={`Reducir cantidad de ${item.model}`}
                  onClick={() =>
                    onChangeGenericQuantity(item.id, item.quantity - 1)
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
                  aria-label={`Aumentar cantidad de ${item.model}`}
                  onClick={() =>
                    onChangeGenericQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Eliminar ${item.model}`}
                  onClick={() => onRemoveGeneric(item.id)}
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

export function EntryDraftList({
  productItems,
  genericItems,
  onRemoveProduct,
  onRemoveGeneric,
  onChangeGenericQuantity,
}: EntryDraftListProps) {
  const specificGroups = groupSpecificItems(productItems)
  const genericGroups = groupGenericItems(genericItems)
  const defaultOpenGroups = [
    ...specificGroups.map((group) => `specific-${group.modelId}`),
    ...genericGroups.map((group) => `generic-${group.modelId}`),
  ]

  return (
    <Accordion
      key={defaultOpenGroups.join("|")}
      multiple
      defaultValue={defaultOpenGroups}
      className="mt-4"
    >
      {specificGroups.map((group) => (
        <SpecificModelSection
          key={`specific-${group.modelId}`}
          value={`specific-${group.modelId}`}
          group={group}
          onRemoveProduct={onRemoveProduct}
        />
      ))}

      {genericGroups.map((group) => (
        <GenericModelSection
          key={`generic-${group.modelId}`}
          value={`generic-${group.modelId}`}
          group={group}
          onRemoveGeneric={onRemoveGeneric}
          onChangeGenericQuantity={onChangeGenericQuantity}
        />
      ))}
    </Accordion>
  )
}

