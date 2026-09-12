import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpToLine,
  ImageIcon,
  RotateCcw,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"

import modelImage from "@/assets/hgu_wifi_5_f.png"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TraceabilityImageGrid } from "@/features/inventory/traceability/components/TraceabilityImageGrid"
import type {
  ImageResponse,
  TelecommunicationSpecificItemHistoryEvent,
  TelecommunicationSpecificItemHistoryResponse,
} from "@/features/interface/products/telecommunicationSpecificItemHistory"
import { deriveProductUnitDetail } from "./productUnitHistory"

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const statusStyles = {
  AVAILABLE: {
    label: "Disponible",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  ASSIGNED: {
    label: "Asignado",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
  },
  IN_REPAIR: {
    label: "En reparación",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
  },
  RETIRED: {
    label: "Retirado",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  },
} as const

const movementStyles: Record<
  TelecommunicationSpecificItemHistoryEvent["movementType"],
  {
    label: string
    icon: LucideIcon
    textClassName: string
    nodeClassName: string
    surfaceClassName: string
    lineClassName: string
  }
> = {
  ENTRY: {
    label: "Entrada",
    icon: ArrowDownToLine,
    textClassName: "text-sky-600 dark:text-sky-400",
    nodeClassName:
      "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-400",
    surfaceClassName:
      "border-sky-100/80 bg-sky-50/40 dark:border-sky-950 dark:bg-sky-950/20",
    lineClassName: "bg-sky-200 dark:bg-sky-900",
  },
  EXIT: {
    label: "Salida",
    icon: ArrowUpToLine,
    textClassName: "text-orange-600 dark:text-orange-400",
    nodeClassName:
      "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400",
    surfaceClassName:
      "border-orange-100/80 bg-orange-50/40 dark:border-orange-950 dark:bg-orange-950/20",
    lineClassName: "bg-orange-200 dark:bg-orange-900",
  },
  ASSIGNMENT: {
    label: "Asignación",
    icon: UserRound,
    textClassName: "text-blue-600 dark:text-blue-400",
    nodeClassName:
      "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
    surfaceClassName:
      "border-blue-100/80 bg-blue-50/40 dark:border-blue-950 dark:bg-blue-950/20",
    lineClassName: "bg-blue-200 dark:bg-blue-900",
  },
  UNASSIGNMENT: {
    label: "Desasignación",
    icon: X,
    textClassName: "text-violet-600 dark:text-violet-400",
    nodeClassName:
      "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400",
    surfaceClassName:
      "border-violet-100/80 bg-violet-50/40 dark:border-violet-950 dark:bg-violet-950/20",
    lineClassName: "bg-violet-200 dark:bg-violet-900",
  },
  RETURN: {
    label: "Devolución",
    icon: RotateCcw,
    textClassName: "text-emerald-600 dark:text-emerald-400",
    nodeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
    surfaceClassName:
      "border-emerald-100/80 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20",
    lineClassName: "bg-emerald-200 dark:bg-emerald-900",
  },
  TRANSFER: {
    label: "Transferencia",
    icon: ArrowRightLeft,
    textClassName: "text-amber-600 dark:text-amber-400",
    nodeClassName:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
    surfaceClassName:
      "border-amber-100/80 bg-amber-50/40 dark:border-amber-950 dark:bg-amber-950/20",
    lineClassName: "bg-amber-200 dark:bg-amber-900",
  },
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function toTraceabilityImages(images: ImageResponse[]) {
  return images.map((image) => ({
    ...image,
    contentType: image.contentType ?? "",
  }))
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 border-b py-1.5 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words">{value}</dd>
    </div>
  )
}

function getMovementDescription(
  event: TelecommunicationSpecificItemHistoryEvent
) {
  switch (event.movementType) {
    case "ENTRY":
      return "Registrado en inventario"
    case "EXIT":
      return "Registrado en una salida de inventario"
    case "ASSIGNMENT":
      return event.toAccountUsername
        ? `Asignado a ${event.toAccountUsername}`
        : "Unidad asignada"
    case "UNASSIGNMENT":
      return event.fromAccountUsername
        ? `Desasignado de ${event.fromAccountUsername}`
        : "Unidad desasignada"
    case "RETURN":
      return "Devuelto al inventario"
    case "TRANSFER":
      return event.fromWarehouseName
        ? `Transferencia desde ${event.fromWarehouseName}`
        : "Transferencia registrada"
  }
}

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  const style = statusStyles[status]

  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  )
}

export function ProductUnitDetail({
  response,
}: {
  response: TelecommunicationSpecificItemHistoryResponse
}) {
  const detail = deriveProductUnitDetail(response)

  if (!detail) {
    return (
      <p
        role="alert"
        className="rounded-md border border-dashed p-4 text-center"
      >
        No se encontró información para esta unidad.
      </p>
    )
  }

  const { item, history, registeredEvent, itemImages } = detail

  return (
    <div className="grid gap-4 text-xs/relaxed">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={modelImage}
            alt=""
            className="size-full object-contain p-1"
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            {item.modelName || "Modelo sin nombre"}
          </h2>
          <p className="truncate text-muted-foreground">{item.unitCode}</p>
        </div>
      </div>

      <Card size="sm" className="[--card-spacing:--spacing(3)]">
        <CardHeader className="border-b">
          <CardTitle>Información de la unidad</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailRow
              label={item.uniqueCodeType === "MAC" ? "MAC" : "Serial"}
              value={item.unitCode}
            />
            <DetailRow label="Código" value={item.identifierCode || "—"} />
            <DetailRow
              label="Estado"
              value={<StatusBadge status={item.status} />}
            />
            <DetailRow
              label="Trabajador"
              value={detail.workerName || "Sin asignar"}
            />
            <DetailRow
              label="Almacén"
              value={detail.warehouseName || "Sin almacén"}
            />
            <DetailRow
              label="Registrado"
              value={formatDate(registeredEvent?.movementDate)}
            />
            <DetailRow
              label="Observación"
              value={detail.observation || "Sin observación"}
            />
          </dl>
        </CardContent>
      </Card>

      {itemImages.length ? (
        <Card size="sm" className="[--card-spacing:--spacing(3)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-4" />
              Imágenes de la unidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TraceabilityImageGrid
              images={toTraceabilityImages(itemImages)}
              galleryTitle="Imágenes de la unidad"
            />
          </CardContent>
        </Card>
      ) : null}

      <Card size="sm" className="[--card-spacing:--spacing(3)]">
        <CardHeader className="flex-row items-center justify-between border-b">
          <CardTitle>Historial asociado</CardTitle>
          <Badge variant="secondary">
            {history.length} {history.length === 1 ? "evento" : "eventos"}
          </Badge>
        </CardHeader>
        <CardContent>
          {history.length ? (
            <ol className="grid gap-1" aria-label="Historial de movimientos">
              {history.map((event, index) => {
                const style = movementStyles[event.movementType]
                const MovementIcon = style.icon

                return (
                  <li
                    key={`${event.movementTransactionId}-${event.telecommunicationMovementId}`}
                    className="relative flex gap-3"
                  >
                    <div className="relative flex w-8 shrink-0 justify-center">
                      {index < history.length - 1 ? (
                        <span
                          className={`absolute top-8 bottom-0 w-px ${style.lineClassName}`}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={`relative z-10 flex size-8 items-center justify-center rounded-full border ${style.nodeClassName}`}
                      >
                        <MovementIcon className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                    <article
                      className={`mb-3 min-w-0 flex-1 rounded-lg border p-3 ${style.surfaceClassName}`}
                    >
                      <header className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <strong className={style.textClassName}>
                          {style.label}
                        </strong>
                        <time
                          className="shrink-0 text-muted-foreground"
                          dateTime={event.movementDate}
                        >
                          {formatDate(event.movementDate)}
                        </time>
                      </header>
                      <p className="mt-2 font-medium">
                        {getMovementDescription(event)}
                      </p>
                      {event.performedByAccountUsername ? (
                        <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                          <UserRound className="size-3.5" aria-hidden="true" />
                          Realizado por {event.performedByAccountUsername}
                        </p>
                      ) : null}
                      {event.remarks ? (
                        <p className="mt-2 border-t pt-2 text-muted-foreground">
                          {event.remarks}
                        </p>
                      ) : null}
                      {event.eventImages?.length ? (
                        <div className="mt-3 border-t pt-2">
                          <TraceabilityImageGrid
                            images={toTraceabilityImages(event.eventImages)}
                            galleryTitle={`Imágenes de ${style.label.toLowerCase()}`}
                          />
                        </div>
                      ) : null}
                    </article>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="text-muted-foreground">
              Sin movimientos registrados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
