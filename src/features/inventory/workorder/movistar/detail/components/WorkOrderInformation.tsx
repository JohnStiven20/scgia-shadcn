import { CalendarDays, ClipboardList, MapPin, Phone, UserRound } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkOrderStatusBadge } from "@/features/inventory/workorders/components/WorkOrderStatusBadge"
import type { MovistarWorkOrderSummaryResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderSummaryResponse"

type WorkOrderInformationProps = {
  workOrder?: MovistarWorkOrderSummaryResponse
  providerName?: string
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function DetailValue({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2 border-b py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value || "—"}</dd>
      </div>
    </div>
  )
}

export function WorkOrderInformation({ workOrder, providerName }: WorkOrderInformationProps) {
  const createdAt = workOrder?.createdAt ? new Date(workOrder.createdAt) : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <ClipboardList className="size-5 text-primary" aria-hidden="true" />
        <CardTitle>Información general</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailValue icon={ClipboardList} label="Número de orden" value={workOrder?.externalOrderNumber ?? "—"} />
          <DetailValue icon={ClipboardList} label="Proveedor" value={providerName ?? "Movistar"} />
          <div className="flex min-w-0 items-start gap-2 border-b py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0">
            <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div><dt className="text-xs text-muted-foreground">Estado</dt><dd className="mt-1"><WorkOrderStatusBadge status={workOrder?.status ?? "PROGRESSING"} /></dd></div>
          </div>
          <DetailValue icon={UserRound} label="Técnico asignado" value={workOrder?.workerName ? `${workOrder.workerName} ${workOrder.surname}` : "Sin asignar"} />
          <DetailValue icon={Phone} label="Teléfono fijo" value={workOrder?.fixedPhoneNumber ?? "—"} />
          <DetailValue icon={MapPin} label="Dirección" value={workOrder?.address ?? "—"} />
          <DetailValue icon={CalendarDays} label="Fecha de creación" value={createdAt && !Number.isNaN(createdAt.getTime()) ? dateFormatter.format(createdAt) : "—"} />
          <DetailValue icon={ClipboardList} label="Tipo de tarea" value={workOrder?.taskType ?? "—"} />
        </dl>
      </CardContent>
    </Card>
  )
}
