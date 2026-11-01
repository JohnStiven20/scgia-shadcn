import { useEffect } from "react"

import {
  useGetOrangeProductionSummaryQuery,
  useGetOrangeProductionWorkersQuery,
  useGetOrangeTaskProductionQuery,
} from "../../api/productionOrangeApi"
import { OrangeEconomicChart } from "./components/OrangeEconomicChart"
import { OrangeProductionStats } from "./components/OrangeProductionStats"
import { OrangeTaskProductionTable } from "./components/OrangeTaskProductionTable"
import { OrangeWorkersTable } from "./components/OrangeWorkersTable"
import type { WorkerProductionResponse } from "../../interface/orange/WorkerProductionResponse"

type OrangeProductionDashboardProps = {
  providerId: number
  startDate: string
  endDate: string
  refreshToken?: number
  onWorkerClick?: (providerId: number, worker: WorkerProductionResponse) => void
}

export function OrangeProductionDashboard({
  providerId,
  startDate,
  endDate,
  refreshToken = 0,
  onWorkerClick,
}: OrangeProductionDashboardProps) {
  const workersQuery = useGetOrangeProductionWorkersQuery(
    { providerId },
    { refetchOnMountOrArgChange: true },
  )
  const productionRequest = { providerId, startDate, endDate }
  const summaryQuery = useGetOrangeProductionSummaryQuery(productionRequest, {
    refetchOnMountOrArgChange: true,
  })
  const tasksQuery = useGetOrangeTaskProductionQuery(productionRequest, {
    refetchOnMountOrArgChange: true,
  })
  const { refetch: refetchWorkers } = workersQuery
  const { refetch: refetchSummary } = summaryQuery
  const { refetch: refetchTasks } = tasksQuery

  useEffect(() => {
    if (refreshToken === 0) return
    void Promise.all([refetchWorkers(), refetchSummary(), refetchTasks()])
  }, [refreshToken, refetchWorkers, refetchSummary, refetchTasks])

  const tasks = tasksQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <OrangeProductionStats summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_1fr]">
        <OrangeEconomicChart tasks={tasks} totalAmount={summaryQuery.data?.totalAmount} isLoading={tasksQuery.isLoading} />
        <OrangeWorkersTable
          workers={workersQuery.data ?? []}
          isLoading={workersQuery.isLoading}
          isError={workersQuery.isError}
          onWorkerClick={(worker) => onWorkerClick?.(providerId, worker)}
        />
      </div>

      <OrangeTaskProductionTable tasks={tasks} isLoading={tasksQuery.isLoading} isError={tasksQuery.isError} />
    </div>
  )
}
