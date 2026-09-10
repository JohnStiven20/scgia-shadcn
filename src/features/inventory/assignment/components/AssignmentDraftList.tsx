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
import { EvidenceUploader } from "./EvidenceUploader"
import type {
  AssignmentConsumableDraft,
  AssignmentSpecificProductDraft,
} from "../types/assignment.types"

type AssignmentDraftListProps = {
  specificProducts: AssignmentSpecificProductDraft[]
  consumables: AssignmentConsumableDraft[]
  onRemoveSpecific: (draftId: string) => void
  onRemoveConsumable: (draftId: string) => void
  onChangeConsumableQuantity: (draftId: string, quantity: number) => void
  onAddSpecificEvidence: (draftId: string, files: File[]) => void
  onRemoveSpecificEvidence: (draftId: string, localId: string) => void
  onAddConsumableEvidence: (draftId: string, files: File[]) => void
  onRemoveConsumableEvidence: (draftId: string, localId: string) => void
}

function quantityText(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function groupSpecific(items: AssignmentSpecificProductDraft[]) {
  const groups = new Map<
    number,
    {
      modelId: number
      modelName: string
      items: AssignmentSpecificProductDraft[]
    }
  >()

  for (const item of items) {
    const group = groups.get(item.modelId) ?? {
      modelId: item.modelId,
      modelName: item.modelName,
      items: [],
    }
    group.items.push(item)
    groups.set(item.modelId, group)
  }

  return Array.from(groups.values())
}

function groupConsumables(items: AssignmentConsumableDraft[]) {
  const groups = new Map<
    number,
    { modelId: number; modelName: string; items: AssignmentConsumableDraft[] }
  >()

  for (const item of items) {
    const group = groups.get(item.modelId) ?? {
      modelId: item.modelId,
      modelName: item.modelName,
      items: [],
    }
    group.items.push(item)
    groups.set(item.modelId, group)
  }

  return Array.from(groups.values())
}

export function AssignmentDraftList({
  specificProducts,
  consumables,
  onRemoveSpecific,
  onRemoveConsumable,
  onChangeConsumableQuantity,
  onAddSpecificEvidence,
  onRemoveSpecificEvidence,
  onAddConsumableEvidence,
  onRemoveConsumableEvidence,
}: AssignmentDraftListProps) {
  const specificGroups = groupSpecific(specificProducts)
  const consumableGroups = groupConsumables(consumables)
  const openGroups = [
    ...specificGroups.map((group) => `specific-${group.modelId}`),
    ...consumableGroups.map((group) => `generic-${group.modelId}`),
  ]

  return (
    <Accordion
      key={openGroups.join("|")}
      multiple
      defaultValue={openGroups}
      className="rounded-lg"
    >
      {specificGroups.map((group) => (
        <AccordionItem
          key={`specific-${group.modelId}`}
          value={`specific-${group.modelId}`}
        >
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
              {group.modelName}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {quantityText(group.items.length)}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-3 pb-3">
            {group.items.map((item) => (
              <article
                key={item.draftId}
                className="rounded-md border bg-background p-2"
              >
                <header className="flex items-start justify-between gap-2">
                  <section className="min-w-0">
                    <p className="text-xs font-semibold break-all">
                      {item.uniqueCodeType}: {item.uniqueCode}
                    </p>
                    <p className="mt-1 text-xs break-all text-muted-foreground">
                      Identificador: {item.identifierCode}
                    </p>
                  </section>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-destructive hover:text-destructive"
                    aria-label={`Eliminar ${item.uniqueCode}`}
                    onClick={() => onRemoveSpecific(item.draftId)}
                  >
                    <Trash2 />
                  </Button>
                </header>
                <div className="mt-2 border-t pt-2">
                  <EvidenceUploader
                    evidence={item.evidence}
                    label="Añadir fotos de la unidad"
                    onAdd={(files) =>
                      onAddSpecificEvidence(item.draftId, files)
                    }
                    onRemove={(localId) =>
                      onRemoveSpecificEvidence(item.draftId, localId)
                    }
                  />
                </div>
              </article>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}

      {consumableGroups.map((group) => {
        const total = group.items.reduce((sum, item) => sum + item.quantity, 0)

        return (
          <AccordionItem
            key={`generic-${group.modelId}`}
            value={`generic-${group.modelId}`}
          >
            <AccordionTrigger className="items-center gap-3 p-3 no-underline hover:no-underline">
              <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <Package className="size-6 stroke-[1.5]" />
              </span>
              <span className="min-w-0 truncate text-sm font-semibold">
                {group.modelName}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {quantityText(total)}
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 px-3 pb-3">
              {group.items.map((item) => (
                <article
                  key={item.draftId}
                  className="rounded-md border bg-background p-2"
                >
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <section className="min-w-0 flex-1">
                      <p className="text-xs font-semibold break-all">
                        Código: {item.identifierCode}
                      </p>
                    </section>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={item.quantity <= 1}
                        aria-label={`Reducir cantidad de ${item.modelName}`}
                        onClick={() =>
                          onChangeConsumableQuantity(
                            item.draftId,
                            item.quantity - 1
                          )
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
                        aria-label={`Aumentar cantidad de ${item.modelName}`}
                        onClick={() =>
                          onChangeConsumableQuantity(
                            item.draftId,
                            item.quantity + 1
                          )
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
                        onClick={() => onRemoveConsumable(item.draftId)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </header>
                  <div className="mt-2 border-t pt-2">
                    <EvidenceUploader
                      evidence={item.evidence}
                      label="Añadir fotos del producto"
                      onAdd={(files) =>
                        onAddConsumableEvidence(item.draftId, files)
                      }
                      onRemove={(localId) =>
                        onRemoveConsumableEvidence(item.draftId, localId)
                      }
                    />
                  </div>
                </article>
              ))}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
