import { ArrowLeft, Box, TriangleAlert } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetMovistarWorkOrderDetailQuery } from "../api/workOrderDetailApi"
import { WorkOrderInformation } from "../components/WorkOrderInformation"
import type { MovistarWorkOrderSummaryResponse } from "@/features/interface/worker/movistar/response/MovistarWorkOrderSummaryResponse"
import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"
import { WorkOrderProducts } from "@/features/inventory/workorder/movistar/detail/components/WorkOrderProducts.tsx"
import { WorkOrderIncidents } from "@/features/inventory/workorder/movistar/detail/components/WorkOrderIncidents.tsx"

type WorkOrderDetailLocationState = { provider?: ProviderInventory; workOrder?: MovistarWorkOrderSummaryResponse }

export function WorkOrderDetailPage() {
  const navigate = useNavigate()
  const { workOrderId } = useParams()
  const location = useLocation()
  const state = (location.state as WorkOrderDetailLocationState | null) ?? {}
  const numericId = Number(workOrderId)
  const workerId = state.workOrder?.workerId
  const detailQuery = useGetMovistarWorkOrderDetailQuery(
    { workerId: workerId ?? 0 },
    { skip: workerId == null }
  )
  const workOrder = state.workOrder
  const title = workOrder?.externalOrderNumber ?? `Orden de trabajo ${workOrderId ?? ""}`

  return (
    <section className="flex flex-col gap-5" aria-label="Detalle de orden de trabajo">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Button type="button" variant="outline" size="icon" aria-label="Volver" onClick={() => navigate(-1)}><ArrowLeft /></Button><div><p className="text-sm text-muted-foreground">Movistar · Órdenes de trabajo</p><h1 className="text-2xl font-semibold tracking-tight">{title}</h1></div></div>
      </div>
      <WorkOrderInformation workOrder={workOrder} providerName={state.provider?.name} />
      {detailQuery.isError ? <Card><CardContent className="p-4 text-sm text-destructive">No se pudo cargar el detalle de esta orden.</CardContent></Card> : null}
      <Tabs defaultValue="products" className="min-w-0 gap-4">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="products" className="gap-2"><Box /> Productos</TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2"><TriangleAlert /> Incidencias</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><Card><CardContent className="p-4">
          <WorkOrderProducts workOrderId={numericId} workerId={workOrder?.workerId} products={detailQuery.data?.specificItems ?? []} isLoading={detailQuery.isLoading} onProductAdded={() => void detailQuery.refetch()} /></CardContent></Card></TabsContent>
        <TabsContent value="incidents"><Card><CardContent className="p-4"><WorkOrderIncidents incidents={detailQuery.data?.incidents ?? []} isLoading={detailQuery.isLoading} /></CardContent></Card></TabsContent>
      </Tabs>
    </section>
  )
}
