import { ImageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { MovementTransaction } from "@/features/interface/traceability/types"
import { traceabilityEventStyles } from "./traceability-event-styles"
import { TraceabilityImageGrid } from "./TraceabilityImageGrid"
import { TraceabilityResourceSection } from "./TraceabilityResourceSection"

const detailDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDetailDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : detailDateFormatter.format(date)
}

function getContentSummary(event: MovementTransaction) {
  const parts: string[] = []

  if (event.specificItemCount && event.specificItemCount > 0) {
    parts.push(
      `${event.specificItemCount} ${event.specificItemCount === 1 ? "específico" : "específicos"}`
    )
  }

  if (event.genericQuantity && event.genericQuantity > 0) {
    parts.push(
      `${event.genericQuantity} ${event.genericQuantity === 1 ? "genérico" : "genéricos"}`
    )
  }

  return parts.length ? parts.join(" · ") : "Sin contenido"
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-2 border-b py-1.5 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
    </div>
  )
}

type TraceabilityEventDetailsProps = {
  event: MovementTransaction
}

export function TraceabilityEventDetails({
  event,
}: TraceabilityEventDetailsProps) {
  const style = traceabilityEventStyles[event.inventoryMovementType]
  const counterpart = event.toAccountUsername
    ? { label: "Destino / asignado a", value: event.toAccountUsername }
    : event.fromAccountUsername
      ? { label: "Origen", value: event.fromAccountUsername }
      : null
  const warehouse =
    event.warehouseName ?? event.fromWarehouseName ?? "Sin almacén"
  const models = event.modelNames?.length
    ? event.modelNames.join(", ")
    : "Sin modelos"

  return (
    <div className="grid gap-2.5 text-xs/relaxed">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={style.badgeClassName}>
          {style.label}
        </Badge>
        <time
          dateTime={event.movementDate}
          className="text-right text-muted-foreground"
        >
          {formatDetailDate(event.movementDate)}
        </time>
      </div>

      <dl>
        <DetailRow
          label="Responsable"
          value={event.performedByAccountUsername ?? "Sin responsable"}
        />
        {counterpart ? (
          <DetailRow label={counterpart.label} value={counterpart.value} />
        ) : null}
        <DetailRow label="Almacén" value={warehouse} />
        <DetailRow label="Contenido" value={getContentSummary(event)} />
        <DetailRow label="Modelos" value={models} />
      </dl>

      {event.eventImages?.length ? (
        <Card size="sm" className="[--card-spacing:--spacing(2)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-4" />
              Imágenes del evento
            </CardTitle>
            <CardAction>
              <Badge variant="secondary">
                {event.eventImages.length}{" "}
                {event.eventImages.length === 1 ? "imagen" : "imágenes"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TraceabilityImageGrid
              images={event.eventImages}
              galleryTitle="Imágenes del evento"
            />
          </CardContent>
        </Card>
      ) : null}

      <TraceabilityResourceSection
        groups={event.detailsMovements ?? []}
        resourceType="SPECIFIC"
      />
      <TraceabilityResourceSection
        groups={event.detailsMovements ?? []}
        resourceType="GENERIC"
      />
    </div>
  )
}
