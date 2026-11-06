import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InventoryPageHeader } from "@/features/inventory/components"
import {
  useGetAssignedWorkersQuery,
  useGetWorkerAssignedProductsQuery,
  useGetWorkerModelDistributionQuery,
} from "../../api/AssignedMaterialApi"
import { WorkerAssignedProductsTable } from "../components/WorkerAssignedProductsTable"
import { WorkerAssignedSummary } from "../components/WorkerAssignedSummary"
import { WorkerModelDistributionChart } from "../components/WorkerModelDistributionChart"

export function WorkerAssignedMaterialPage() {
  const navigate = useNavigate()
  const { workerId: workerIdParam } = useParams<{ workerId: string }>()
  const workerId = Number(workerIdParam)
  const isValidWorkerId = Number.isInteger(workerId) && workerId > 0

  const workerQuery = useGetAssignedWorkersQuery()
  const modelsQuery = useGetWorkerModelDistributionQuery(workerId, {
    skip: !isValidWorkerId,
  })
  const productsQuery = useGetWorkerAssignedProductsQuery(workerId, {
    skip: !isValidWorkerId,
  })

  const worker = workerQuery.data?.find((item) => item.workerId === workerId)
  const isLoading = workerQuery.isLoading || modelsQuery.isLoading || productsQuery.isLoading
  const isError = workerQuery.isError || modelsQuery.isError || productsQuery.isError
  const totalProducts = productsQuery.data?.length ?? worker?.totalProducts ?? 0
  const totalModels = modelsQuery.data?.length ?? worker?.totalModels ?? 0

  if (!isValidWorkerId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Trabajador no válido.</AlertTitle>
        <AlertDescription>El identificador del trabajador no es correcto.</AlertDescription>
      </Alert>
    )
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Material asignado del trabajador">
      <InventoryPageHeader
        title="Asignaciones de trabajador"
        description={
          worker
            ? `${worker.workerName} ${worker.workerLastName} · Consulta el material actualmente asignado.`
            : "Consulta el material actualmente asignado a este trabajador."
        }
        action={
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/assigned-material")}>
            <ArrowLeft /> Volver
          </Button>
        }
      />

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el material del trabajador.</AlertTitle>
          <AlertDescription>Comprueba la conexión con la API e inténtalo de nuevo.</AlertDescription>
        </Alert>
      ) : null}

      <WorkerAssignedSummary
        totalProducts={totalProducts}
        totalModels={totalModels}
        lastAssignment={worker?.lastAssignment ?? null}
        isLoading={isLoading}
      />
      <WorkerModelDistributionChart models={modelsQuery.data ?? []} isLoading={isLoading} />
      <WorkerAssignedProductsTable products={productsQuery.data ?? []} isLoading={isLoading} />
    </section>
  )
}
