import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InventoryPageHeader } from "@/features/inventory/components"
import { useNavigate } from "react-router-dom"
import {
  useGetAssignedWorkersQuery,
  useGetGlobalModelDistributionQuery,
} from "../api/AssignedMaterialApi"
import { AssignedMaterialSummary } from "../components/AssignedMaterialSummary"
import { AssignedWorkersTable } from "../components/AssignedWorkersTable"
import { GlobalModelDistributionChart } from "../components/GlobalModelDistributionChart"

export function AssignedMaterialPage() {
  const navigate = useNavigate()
  const modelsQuery = useGetGlobalModelDistributionQuery()
  const workersQuery = useGetAssignedWorkersQuery()
  const isLoading = modelsQuery.isLoading || workersQuery.isLoading
  const isError = modelsQuery.isError || workersQuery.isError

  return (
    <section className="flex flex-col gap-5" aria-label="Material asignado">
      <InventoryPageHeader
        title="Material asignado"
        description="Resumen global del material actualmente asignado a trabajadores."
      />

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el material asignado.</AlertTitle>
          <AlertDescription>
            Comprueba la conexión con la API e inténtalo de nuevo.
          </AlertDescription>
        </Alert>
      ) : null}

      <AssignedMaterialSummary
        models={modelsQuery.data ?? []}
        workers={workersQuery.data ?? []}
        isLoading={isLoading}
      />
      <GlobalModelDistributionChart
        models={modelsQuery.data ?? []}
        isLoading={isLoading}
      />
      <AssignedWorkersTable
        workers={workersQuery.data ?? []}
        isLoading={isLoading}
        onWorkerClick={(worker) =>
          navigate(`/inventory/assigned-material/workers/${worker.workerId}`)
        }
      />
    </section>
  )
}
