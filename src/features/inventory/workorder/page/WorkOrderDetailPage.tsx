import { ArrowLeft, AlertTriangle, Box } from "lucide-react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  WorkOrderListResponse,
  WorkOrderStatus,
} from "@/features/interface/work-orders/types"
import { WorkOrderStatusBadge } from "@/features/inventory/workorders/components/WorkOrderStatusBadge"

type WorkOrderDetail = WorkOrderListResponse & {
  internalOrderNumber: string
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDateTime(value: string | null) {
  if (!value) return "-"

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

function resolveMockStatus(id: number): WorkOrderStatus {
  if (id % 5 === 0) return "BLOCKED"
  if (id % 3 === 0) return "FINISHED"

  return "PROGRESSING"
}

function getMockWorkOrder(id: string | undefined): WorkOrderDetail {
  const numericId = Number(id)
  const resolvedId = Number.isFinite(numericId) && numericId > 0 ? numericId : 1
  const status = resolveMockStatus(resolvedId)

  return {
    id: resolvedId,
    internalOrderNumber: `OT-${String(resolvedId).padStart(5, "0")}`,
    externalOrderNumber: `EXT-${String(4200 + resolvedId)}`,
    fixedPhoneNumber: `966 ${String(120000 + resolvedId).slice(0, 3)} ${String(
      120000 + resolvedId
    ).slice(3)}`,
    address: "Calle Maestro Serrano 18, Torrevieja, Alicante",
    workerName: "Laura Martinez",
    status,
    createdAt: "2026-10-09T08:30:00.000Z",
    finishedAt: status === "FINISHED" ? "2026-10-11T16:45:00.000Z" : null,
    productCount: 4,
    incidentCount: status === "BLOCKED" ? 2 : 0,
  }
}

function WorkOrderBreadcrumb({ workOrderId }: { workOrderId: number }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/inventory/work-orders" />}>
            Órdenes de trabajo
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{workOrderId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function WorkOrderDetailPage() {
  const { workOrderId } = useParams()
  const navigate = useNavigate()
  const workOrder = getMockWorkOrder(workOrderId)

  const detailFields = [
    {
      label: "Número interno",
      value: workOrder.internalOrderNumber,
    },
    {
      label: "Número orden externa",
      value: workOrder.externalOrderNumber,
    },
    {
      label: "Número fijo cliente",
      value: workOrder.fixedPhoneNumber,
    },
    {
      label: "Dirección",
      value: workOrder.address,
    },
    {
      label: "Trabajador asignado",
      value: workOrder.workerName,
    },
    {
      label: "Estado",
      value: <WorkOrderStatusBadge status={workOrder.status} />,
    },
    {
      label: "Fecha de creación",
      value: formatDateTime(workOrder.createdAt),
    },
    ...(workOrder.finishedAt
      ? [
          {
            label: "Fecha de finalización",
            value: formatDateTime(workOrder.finishedAt),
          },
        ]
      : []),
  ]

  return (
    <section
      className="flex min-w-0 flex-col gap-6"
      aria-label="Detalle de orden de trabajo"
    >
      <div className="flex flex-col gap-4">
        <WorkOrderBreadcrumb workOrderId={workOrder.id} />

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Orden de trabajo {workOrder.id}
              </h1>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <p className="text-muted-foreground">
              Información general de la orden y navegación interna.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/work-orders")}
          >
            <ArrowLeft />
            Volver al listado
          </Button>
        </header>
      </div>

      <Card>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {detailFields.map((field) => (
              <DetailField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="min-w-0 gap-4">
        <TabsList
          variant="default"
          className="w-full min-w-50 justify-start border-b"
        >
          <TabsTrigger value="products" className="gap-2 px-4 py-2 text-sm">
            <Box />
            Productos ({workOrder.productCount})
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2 px-4 py-2 text-sm">
            <AlertTriangle />
            Incidencias ({workOrder.incidentCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="products"
          className="min-h-48 rounded-md border bg-card"
          aria-label="Contenido de productos"
        />
        <TabsContent
          value="incidents"
          className="min-h-48 rounded-md border bg-card"
          aria-label="Contenido de incidencias"
        />
      </Tabs>
    </section>
  )
}
