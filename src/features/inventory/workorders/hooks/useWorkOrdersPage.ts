import { useMemo, useState } from "react"

// import type { WorkOrderStatus } from "src/features/interface/work-orders/types"
import {
  useGetWorkOrdersQuery,
  type WorkOrderSort,
} from "../api/workOrderApi"
import type { WorkOrderStatus } from "@/features/interface/work-orders/types"
import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"

export const WORK_ORDER_PAGE_SIZE_OPTIONS = [10, 20, 50]

export type WorkOrderFilterValues = {
  search: string
  status: WorkOrderStatus | "ALL"
  workerId: number | null
  createdFrom?: Date
  createdTo?: Date
  sort: WorkOrderSort
}

export interface  WorkPageProps { 
   provider:ProviderInventory  | undefined
}

export function getDefaultWorkOrderFilters(): WorkOrderFilterValues {
  return {
    search: "",
    status: "ALL",
    workerId: null,
    createdFrom: undefined,
    createdTo: undefined,
    sort: "createdAt,desc",
  }
}

function formatDateParam(date: Date | undefined) {
  if (!date) return undefined

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function useWorkOrdersPage(   {  provider }: WorkPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(
    WORK_ORDER_PAGE_SIZE_OPTIONS[0]
  )
  const [filters, setFilters] = useState<WorkOrderFilterValues>(
    getDefaultWorkOrderFilters
  )


  

  const request = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      status: filters.status === "ALL" ? undefined : filters.status,
      workerId: filters.workerId ?? undefined,
      createdFrom: formatDateParam(filters.createdFrom),
      createdTo: formatDateParam(filters.createdTo),
      page: page - 1,
      size: pageSize,
      sort: filters.sort,
    }),
    [filters, page, pageSize]
  )

  const { data, isLoading, isFetching, isError, refetch } =
    useGetWorkOrdersQuery(request, {
      refetchOnMountOrArgChange: true,

    })

  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const currentPage = Math.min((data?.number ?? page - 1) + 1, totalPages)

  function applyFilters(nextFilters: WorkOrderFilterValues) {
    setFilters(nextFilters)
    setPage(1)
  }

  function resetFilters() {
    const defaultFilters = getDefaultWorkOrderFilters()
    setFilters(defaultFilters)
    setPage(1)

    return defaultFilters
  }

  function setPageSize(nextPageSize: number) {
    setPageSizeState(nextPageSize)
    setPage(1)
  }

  return {
    rows: data?.content ?? [],
    isLoading,
    isFetching,
    isError,
    refetch,
    filters: {
      values: filters,
      apply: applyFilters,
      reset: resetFilters,
    },
    pagination: {
      page: currentPage,
      pageSize,
      totalPages,
      totalElements: data?.totalElements ?? 0,
      setPage,
      setPageSize,
    },
  }
}
