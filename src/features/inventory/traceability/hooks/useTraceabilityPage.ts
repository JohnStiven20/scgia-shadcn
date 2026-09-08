import { useMemo, useState } from "react"

import { useSearchTraceabilityEventsQuery } from "../api/traceabilityApi"

export const TRACEABILITY_PAGE_SIZE_OPTIONS = [10, 25, 50]

export type TraceabilityFilterValues = {
  startDate: Date
  endDate: Date
  performedByAccountUsername: string
  fromWarehouseName: string
}

function formatApiDate(date: Date, endOfDay = false) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const time = endOfDay ? "23:59:59" : "00:00:00"

  return `${year}-${month}-${day}T${time}Z`
}

function getDefaultFilters(): TraceabilityFilterValues {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)

  return {
    startDate,
    endDate,
    performedByAccountUsername: "",
    fromWarehouseName: "",
  }
}

export function useTraceabilityPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(
    TRACEABILITY_PAGE_SIZE_OPTIONS[0]
  )
  const [filters, setFilters] =
    useState<TraceabilityFilterValues>(getDefaultFilters)

  const request = useMemo(
    () => ({
      pageNumber: page - 1,
      pageSize,
      sortBy: "movementDate",
      sortOrder: "DESC" as const,
      object: {
        startDate: formatApiDate(filters.startDate),
        endDate: formatApiDate(filters.endDate, true),
        ...(filters.performedByAccountUsername.trim()
          ? {
              performedByAccountUsername:
                filters.performedByAccountUsername.trim(),
            }
          : {}),
        ...(filters.fromWarehouseName.trim()
          ? { fromWarehouseName: filters.fromWarehouseName.trim() }
          : {}),
      },
    }),
    [filters, page, pageSize]
  )

  const { data, isLoading, isFetching, isError } =
    useSearchTraceabilityEventsQuery(request, {
      refetchOnMountOrArgChange: true,
    })

  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const currentPage = Math.min((data?.page ?? page - 1) + 1, totalPages)

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize)
    setPage(1)
  }

  const applyFilters = (nextFilters: TraceabilityFilterValues) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const resetFilters = () => {
    const defaultFilters = getDefaultFilters()
    setFilters(defaultFilters)
    setPage(1)

    return defaultFilters
  }

  return {
    rows: data?.content ?? [],
    isLoading,
    isFetching,
    isError,
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
