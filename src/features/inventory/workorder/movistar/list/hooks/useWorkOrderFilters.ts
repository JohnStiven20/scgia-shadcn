import { useMemo, useState } from "react"

import type { WorkOrderStatus } from "@/features/interface/work-orders/types"
import {
  useGetMovistarWorkOrdersQuery,
} from "../api/workOrderListApi"

export const MOVISTAR_WORK_ORDER_PAGE_SIZE_OPTIONS = [10, 20, 50]

export type WorkOrderListFilters = {
  search: string
  phone: string
  workerId: number | null
  taskTypeId: number | null
  status: WorkOrderStatus | "PENDING" | "CANCELLED" | "ALL"
  startDate: string
  endDate: string
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getDefaultWorkOrderFilters(): WorkOrderListFilters {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)

  return {
    search: "",
    phone: "",
    workerId: null,
    taskTypeId: null,
    status: "ALL",
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

export function useWorkOrderFilters(providerId?: number) {
  const [filters, setFilters] = useState(getDefaultWorkOrderFilters)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(MOVISTAR_WORK_ORDER_PAGE_SIZE_OPTIONS[0])

  const request = useMemo(
    () => ({
      providerId: providerId ?? 0,
      startDate: filters.startDate,
      endDate: filters.endDate,
      workerId: filters.workerId ?? undefined,
      taskTypeId: filters.taskTypeId ?? undefined,
      page,
      size: pageSize,
    }),
    [filters.endDate, filters.startDate, filters.taskTypeId, filters.workerId, page, pageSize, providerId]
  )

  const query = useGetMovistarWorkOrdersQuery(request, {
    skip: providerId == null,
    refetchOnMountOrArgChange: true,
  })

  function applyFilters(nextFilters: WorkOrderListFilters) {
    setFilters(nextFilters)
    setPage(0)
  }

  function resetFilters() {
    const defaults = getDefaultWorkOrderFilters()
    setFilters(defaults)
    setPage(0)
    return defaults
  }

  return {
    filters,
    applyFilters,
    resetFilters,
    setPage,
    setPageSize: (nextPageSize: number) => {
      setPageSize(nextPageSize)
      setPage(0)
    },
    query,
    rows: query.data?.content ?? [],
    page,
    pageSize,
    totalPages: Math.max(1, query.data?.totalPages ?? 1),
    totalElements: query.data?.totalElements ?? 0,
  }
}
