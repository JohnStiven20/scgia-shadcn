import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function WorkOrderDetailPage() {
  const navigate = useNavigate()
  const { workOrderId } = useParams()

  return (
    <section className="flex flex-col gap-4" aria-label="Detalle de orden de trabajo">
      <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </Button>
      <h1 className="text-3xl font-semibold tracking-tight">Orden de trabajo {workOrderId}</h1>
    </section>
  )
}
