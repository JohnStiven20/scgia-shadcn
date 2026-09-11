import { useEffect, useMemo, useState } from "react"

import { useFindAllVehicleDocumentsByVehicleQuery } from "@/features/fleet/api/apiVehicleDocument"
import {
  DEFAULT_VEHICLE_DOCUMENT_FILTERS,
  VEHICLE_DOCUMENT_FILTER_OPTIONS,
} from "../components/documents/constants"
import {
  groupVehicleDocuments,
  mapVehicleDocument,
} from "../components/documents/mappers"
import type {
  VehicleDocumentFilters,
  VehicleDocumentListItemView,
  VehicleDocumentQuickFilter,
} from "../components/documents/types"

export function useVehicleDocuments(vehicleId: number) {
  const [quickFilter, setQuickFilter] =
    useState<VehicleDocumentQuickFilter>("ALL")
  const [filters, setFilters] = useState<VehicleDocumentFilters>(
    DEFAULT_VEHICLE_DOCUMENT_FILTERS
  )
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  )

  const query = useFindAllVehicleDocumentsByVehicleQuery(
    { vehicleId },
    { skip: !Number.isFinite(vehicleId) || vehicleId <= 0 }
  )

  const documents = useMemo(
    () => (query.data?.content ?? []).map(mapVehicleDocument),
    [query.data?.content]
  )

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const statusFilter = quickFilter !== "ALL" ? quickFilter : filters.status
      const matchesStatus =
        statusFilter === "ALL" || document.status === statusFilter
      const matchesType =
        filters.documentType === "ALL" ||
        document.documentType === filters.documentType
      const matchesTitle =
        !filters.title.trim() ||
        document.title
          .toLowerCase()
          .includes(filters.title.trim().toLowerCase())

      return matchesStatus && matchesType && matchesTitle
    })
  }, [documents, filters, quickFilter])

  const counts = useMemo(() => {
    return VEHICLE_DOCUMENT_FILTER_OPTIONS.reduce(
      (acc, option) => {
        acc[option.value] =
          option.value === "ALL"
            ? documents.length
            : documents.filter((document) => document.status === option.value)
                .length
        return acc
      },
      {} as Record<VehicleDocumentQuickFilter, number>
    )
  }, [documents])

  const groups = useMemo(
    () => groupVehicleDocuments(filteredDocuments),
    [filteredDocuments]
  )

  const selectedDocument = useMemo<VehicleDocumentListItemView | null>(() => {
    if (!selectedDocumentId) return null
    return (
      filteredDocuments.find(
        (document) => document.id === selectedDocumentId
      ) ?? null
    )
  }, [filteredDocuments, selectedDocumentId])

  useEffect(() => {
    if (!filteredDocuments.length) {
      setSelectedDocumentId(null)
      return
    }

    if (!selectedDocumentId) {
      setSelectedDocumentId(filteredDocuments[0].id)
      return
    }

    if (
      !filteredDocuments.some((document) => document.id === selectedDocumentId)
    ) {
      setSelectedDocumentId(filteredDocuments[0].id)
    }
  }, [filteredDocuments, selectedDocumentId])

  return {
    ...query,
    documents,
    filteredDocuments,
    groups,
    counts,
    quickFilter,
    setQuickFilter,
    filters,
    setFilters,
    selectedDocument,
    selectedDocumentId,
    setSelectedDocumentId,
  }
}
