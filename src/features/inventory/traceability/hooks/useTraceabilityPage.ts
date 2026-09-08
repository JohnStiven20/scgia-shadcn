import { useMemo, useState } from "react"

import { useSearchTraceabilityEventsQuery } from "../api/traceabilityApi"

export const TRACEABILITY_PAGE_SIZE_OPTIONS = [10, 25, 50]

function formatApiDate(date: Date, endOfDay = false) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const time = endOfDay ? "23:59:59" : "00:00:00"

  return `${year}-${month}-${day}T${time}Z`
}

function getDefaultDateRange() {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)

  return {
    startDate: formatApiDate(startDate),
    endDate: formatApiDate(endDate, true),
  }
}

export function useTraceabilityPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(
    TRACEABILITY_PAGE_SIZE_OPTIONS[0]
  )
  const dateRange = useMemo(() => getDefaultDateRange(), [])

  const request = useMemo(
    () => ({
      pageNumber: page - 1,
      pageSize,
      sortBy: "movementDate",
      sortOrder: "DESC" as const,
      object: dateRange,
    }),
    [dateRange, page, pageSize]
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

  return {
    rows: data?.content ?? [],
    dateRange,
    isLoading,
    isFetching,
    isError,
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
