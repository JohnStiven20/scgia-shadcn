import { Minus, Package, Plus, Trash2 } from "lucide-react"

import hguImage from "@/assets/hgu_wifi_5_f.png"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReturnEvidenceUploader } from "./ReturnEvidenceUploader"
import type { ReturnGenericDraftItem, ReturnSpecificDraftItem } from "../types"

type ReturnDraftListProps = {
  specificItems: ReturnSpecificDraftItem[]
  genericItems: ReturnGenericDraftItem[]
  onRemoveSpecific: (draftId: string) => void
  onRemoveGeneric: (draftId: string) => void
  onChangeGenericQuantity: (draftId: string, quantity: number) => void
  onAddSpecificEvidence: (draftId: string, files: File[]) => void
  onRemoveSpecificEvidence: (draftId: string, localId: string) => void
  onAddGenericEvidence: (draftId: string, files: File[]) => void
  onRemoveGenericEvidence: (draftId: string, localId: string) => void
}

function quantityLabel(quantity: number) {
  return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
}

function groupByModel<T extends { modelId: number; modelName: string }>(
  items: T[]
) {
  const groups = new Map<number, { modelName: string; items: T[] }>()

  for (const item of items) {
    const group = groups.get(item.modelId) ?? {
      modelName: item.modelName,
      items: [],
    }
    group.items.push(item)
    groups.set(item.modelId, group)
  }

  return Array.from(groups, ([modelId, group]) => ({ modelId, ...group }))
}

export function ReturnDraftList({
  specificItems,
  genericItems,
  onRemoveSpecific,
  onRemoveGeneric,
  onChangeGenericQuantity,
  onAddSpecificEvidence,
  onRemoveSpecificEvidence,
  onAddGenericEvidence,
  onRemoveGenericEvidence,
}: ReturnDraftListProps) {
  const specificGroups = groupByModel(specificItems)
  const genericGroups = groupByModel(genericItems)
  const defaultOpenGroups = [
    ...specificGroups.map((group) => `specific-${group.modelId}`),
    ...genericGroups.map((group) => `generic-${group.modelId}`),
  ]

  return (
    <Accordion
      key={defaultOpenGroups.join("|")}
      multiple
      defaultValue={defaultOpenGroups}
      className="rounded-xl border"
    >
      {specificGroups.map((group) => (
        <AccordionItem
          key={`specific-${group.modelId}`}
          value={`specific-${group.modelId}`}
        >
          <AccordionTrigger className="gap-3 px-3 hover:no-underline">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
              <img
                src={hguImage}
                alt=""
                className="size-full object-contain p-1"
              />
            </span>
            <span className="min-w-0 truncate font-semibold">
              {group.modelName}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {quantityLabel(group.items.length)}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 px-3 pb-3 sm:px-4 sm:pb-4">
            {group.items.map((item) => (
              <article
                key={item.draftId}
                className="rounded-lg border bg-background p-3"
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold break-all">
                      {item.uniqueCodeType ?? "Código"}: {item.uniqueCode}
                    </p>
                    <p className="mt-1 text-sm break-all text-muted-foreground">
                      Identificador:{" "}
                      {item.identifierCode ?? "Sin identificador"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    aria-label={`Quitar ${item.uniqueCode}`}
                    onClick={() => onRemoveSpecific(item.draftId)}
                  >
                    <Trash2 />
                  </Button>
                </header>
                <div className="mt-3 border-t pt-3">
                  <ReturnEvidenceUploader
                    evidence={item.evidence}
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

      {genericGroups.map((group) => {
        const total = group.items.reduce((sum, item) => sum + item.quantity, 0)

        return (
          <AccordionItem
            key={`generic-${group.modelId}`}
            value={`generic-${group.modelId}`}
          >
            <AccordionTrigger className="gap-3 px-3 hover:no-underline">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Package />
              </span>
              <span className="min-w-0 truncate font-semibold">
                {group.modelName}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {quantityLabel(total)}
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 px-3 pb-3 sm:px-4 sm:pb-4">
              {group.items.map((item) => (
                <article
                  key={item.draftId}
                  className="rounded-lg border bg-background p-3"
                >
                  <header className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold break-all">
                        Código: {item.identifierCode ?? "Sin identificador"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Máximo retornable:{" "}
                        {quantityLabel(item.assignedQuantity)}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={item.quantity <= 1}
                        aria-label={`Reducir cantidad de ${item.modelName}`}
                        onClick={() =>
                          onChangeGenericQuantity(
                            item.draftId,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus />
                      </Button>
                      <span className="min-w-24 text-center text-sm font-semibold">
                        {quantityLabel(item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={item.quantity >= item.assignedQuantity}
                        aria-label={`Aumentar cantidad de ${item.modelName}`}
                        onClick={() =>
                          onChangeGenericQuantity(
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
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Quitar ${item.modelName}`}
                        onClick={() => onRemoveGeneric(item.draftId)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </header>
                  <div className="mt-3 border-t pt-3">
                    <ReturnEvidenceUploader
                      evidence={item.evidence}
                      onAdd={(files) =>
                        onAddGenericEvidence(item.draftId, files)
                      }
                      onRemove={(localId) =>
                        onRemoveGenericEvidence(item.draftId, localId)
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
