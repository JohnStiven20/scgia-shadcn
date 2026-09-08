import { Archive, Boxes, PackageOpen, QrCode } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  MovementModelGroup,
  MovementResourceGroup,
  ResourceType,
  TelecommunicationMovement,
} from "@/features/interface/traceability/types"
import { TraceabilityImageGrid } from "./TraceabilityImageGrid"

type ResourceSectionConfig = {
  title: string
  emptyMessage: string
  unitLabel: (count: number) => string
  className: string
  icon: typeof Archive
}

const resourceSectionConfig: Record<ResourceType, ResourceSectionConfig> = {
  SPECIFIC: {
    title: "Productos específicos",
    emptyMessage: "Sin productos específicos asociados.",
    unitLabel: (count) => `${count} ${count === 1 ? "unidad" : "unidades"}`,
    className: "text-blue-600",
    icon: Archive,
  },
  GENERIC: {
    title: "Productos genéricos",
    emptyMessage: "Sin productos genéricos asociados.",
    unitLabel: (count) => `${count} ${count === 1 ? "ud." : "uds."}`,
    className: "text-violet-600",
    icon: Boxes,
  },
}

function getMovementUnits(
  movement: TelecommunicationMovement,
  resourceType: ResourceType
) {
  return resourceType === "GENERIC" ? (movement.quantity ?? 0) : 1
}

function getModelUnits(model: MovementModelGroup, resourceType: ResourceType) {
  return model.identifierGroups.reduce(
    (total, identifierGroup) =>
      total +
      identifierGroup.movements.reduce(
        (movementTotal, movement) =>
          movementTotal + getMovementUnits(movement, resourceType),
        0
      ),
    0
  )
}

function getGroupUnits(
  groups: MovementResourceGroup[],
  resourceType: ResourceType
) {
  return groups.reduce(
    (total, group) =>
      total +
      group.models.reduce(
        (modelTotal, model) => modelTotal + getModelUnits(model, resourceType),
        0
      ),
    0
  )
}

function MovementItem({
  movement,
  identifierType,
  resourceType,
}: {
  movement: TelecommunicationMovement
  identifierType: string | null
  resourceType: ResourceType
}) {
  const title =
    movement.unitCode ?? `Movimiento ${movement.telecommunicationMovementId}`
  const quantity = getMovementUnits(movement, resourceType)
  const hasStock =
    movement.stockBeforeMovement !== null ||
    movement.stockAfterMovement !== null

  return (
    <li className="grid gap-1.5 border-t p-2 first:border-t-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <QrCode className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{title}</p>
            {identifierType ? (
              <p className="text-[0.6875rem] text-muted-foreground">
                Identificador: {identifierType}
              </p>
            ) : null}
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {quantity} {quantity === 1 ? "unidad" : "unidades"}
        </Badge>
      </div>

      {hasStock ? (
        <p className="text-[0.6875rem] text-muted-foreground">
          Stock: {movement.stockBeforeMovement ?? "—"} →{" "}
          {movement.stockAfterMovement ?? "—"}
        </p>
      ) : null}

      {movement.images?.length ? (
        <TraceabilityImageGrid
          images={movement.images}
          galleryTitle={`Imágenes de ${title}`}
        />
      ) : null}
    </li>
  )
}

function ModelItem({
  model,
  resourceType,
  value,
}: {
  model: MovementModelGroup
  resourceType: ResourceType
  value: string
}) {
  const config = resourceSectionConfig[resourceType]
  const units = getModelUnits(model, resourceType)

  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="items-center gap-2 p-2 no-underline hover:no-underline">
        <span className="min-w-0 truncate">{model.modelName}</span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {config.unitLabel(units)}
        </Badge>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        {model.identifierGroups.length ? (
          model.identifierGroups.map((identifierGroup, groupIndex) => (
            <section
              key={`${identifierGroup.identifierType ?? "unidentified"}-${groupIndex}`}
              aria-label={
                identifierGroup.identifierType
                  ? `Identificador ${identifierGroup.identifierType}`
                  : "Movimientos sin identificador"
              }
            >
              <ul>
                {identifierGroup.movements.map((movement) => (
                  <MovementItem
                    key={movement.telecommunicationMovementId}
                    movement={movement}
                    identifierType={identifierGroup.identifierType}
                    resourceType={resourceType}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className="p-2 text-muted-foreground">
            Este modelo no contiene movimientos.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

type TraceabilityResourceSectionProps = {
  groups: MovementResourceGroup[]
  resourceType: ResourceType
}

export function TraceabilityResourceSection({
  groups,
  resourceType,
}: TraceabilityResourceSectionProps) {
  const config = resourceSectionConfig[resourceType]
  const Icon = config.icon
  const resources = groups.filter(
    (group) => group.resourceType === resourceType
  )
  const models = resources.flatMap((group) => group.models)
  const units = getGroupUnits(resources, resourceType)

  return (
    <Card size="sm" className="[--card-spacing:--spacing(2)]">
      <CardHeader className="border-b">
        <CardTitle className={`flex items-center gap-2 ${config.className}`}>
          <Icon className="size-4" />
          {config.title}
        </CardTitle>
        <CardAction>
          <Badge variant="secondary">{config.unitLabel(units)}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-1.5">
        {models.length ? (
          <Accordion
            multiple
            defaultValue={
              models.length
                ? [`${resourceType}-${models[0].modelName}-0`]
                : undefined
            }
          >
            {models.map((model, index) => {
              const value = `${resourceType}-${model.modelName}-${index}`

              return (
                <ModelItem
                  key={value}
                  model={model}
                  resourceType={resourceType}
                  value={value}
                />
              )
            })}
          </Accordion>
        ) : (
          <div className="flex min-h-16 flex-col items-center justify-center gap-1 text-center text-muted-foreground">
            <PackageOpen className="size-4" />
            <p>{config.emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
