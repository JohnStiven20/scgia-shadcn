import { useMemo, useState } from "react"

import {
  useDeleteWorkerTrainingDocumentMutation,
  useGetWorkerTrainingDocumentsByWorkerIdQuery,
} from "@/features/employees/worker/api/workerDocumentApi"
import type { WorkerTrainingDocument } from "@/features/interface/worker-document/type/worker-document.interface"
import { useGlobalError } from "@/hooks"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { mapWorkerTrainingDocumentToViewModel } from "../mapper/documentMappers"
import {
  documentSectionOptions,
  sortWorkerDocuments,
  type WorkerDocumentSectionKey,
} from "../utils/documentUtils"

type UseWorkerDocumentsTabParams = {
  workerId: number
}

export function useWorkerDocumentsTab({
  workerId,
}: UseWorkerDocumentsTabParams) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] =
    useState<WorkerDocumentSectionKey>("ALL")
  const [documentToEdit, setDocumentToEdit] =
    useState<WorkerTrainingDocument | null>(null)
  const [documentToDelete, setDocumentToDelete] =
    useState<WorkerTrainingDocument | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteWorkerDocument, { isLoading: isDeletingDocument }] =
    useDeleteWorkerTrainingDocumentMutation()
  const { handleError } = useGlobalError()
  const notifications = useNotifications()

  const canFetchDocuments = Number.isFinite(workerId) && workerId > 0
  const {
    data: documents = [],
    isFetching,
    isError,
    refetch,
  } = useGetWorkerTrainingDocumentsByWorkerIdQuery(workerId, {
    skip: !canFetchDocuments,
  })

  const sortedDocuments = useMemo(
    () => sortWorkerDocuments(documents),
    [documents]
  )

  const viewDocuments = useMemo(
    () => sortedDocuments.map(mapWorkerTrainingDocumentToViewModel),
    [sortedDocuments]
  )

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return viewDocuments.filter((document) => {
      const matchesSection =
        selectedCategory === "ALL" || document.sectionKey === selectedCategory
      const matchesQuery =
        !normalizedQuery ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.documentName.toLowerCase().includes(normalizedQuery) ||
        document.section.toLowerCase().includes(normalizedQuery)

      return matchesSection && matchesQuery
    })
  }, [query, selectedCategory, viewDocuments])

  const selectedDocument =
    filteredDocuments.find((document) => document.id === selectedDocumentId) ??
    null

  const rawSelectedDocument =
    sortedDocuments.find((document) => document.id === selectedDocument?.id) ??
    null

  function handleDocumentCreated() {
    setSelectedDocumentId(null)
  }

  function handleDocumentUpdated() {
    // Keep the detail view open. RTK Query refreshes the selected data.
  }

  function selectDocument(documentId: number) {
    setSelectedDocumentId(documentId)
  }

  function clearSelectedDocument() {
    setSelectedDocumentId(null)
  }

  function handleCategoryChange(category: WorkerDocumentSectionKey) {
    setSelectedCategory(category)
    setSelectedDocumentId(null)
  }

  function handleCreateDialogOpenChange(open: boolean) {
    setIsCreateDialogOpen(open)
  }

  function handleEditDialogOpenChange(open: boolean) {
    if (!open) {
      setDocumentToEdit(null)
    }
  }

  function handleDeleteDialogClose() {
    if (!isDeletingDocument) {
      setDocumentToDelete(null)
    }
  }

  async function confirmDeleteDocument() {
    if (!documentToDelete) {
      return
    }

    try {
      await deleteWorkerDocument({
        id: documentToDelete.id,
        workerId: documentToDelete.workerId,
      }).unwrap()
      setSelectedDocumentId(null)
      setDocumentToDelete(null)
      notifications.success("Documento eliminado correctamente.")
    } catch (error) {
      handleError(error, "No se ha podido eliminar el documento.")
    }
  }

  return {
    canFetchDocuments,
    documents: filteredDocuments,
    documentToEdit,
    documentToDelete,
    isCreateDialogOpen,
    isDeleteDialogOpen: Boolean(documentToDelete),
    isDeletingDocument,
    isEditDialogOpen: Boolean(documentToEdit),
    isError,
    isFetching,
    query,
    hasDocuments: viewDocuments.length > 0,
    hasFilteredDocuments: filteredDocuments.length > 0,
    rawSelectedDocument,
    refetch,
    selectedDocument,
    selectedCategory,
    categoryOptions: documentSectionOptions,
    confirmDeleteDocument,
    handleCreateDialogOpenChange,
    handleDeleteDialogClose,
    handleDocumentCreated,
    handleDocumentUpdated,
    handleEditDialogOpenChange,
    openCreateDialog: () => setIsCreateDialogOpen(true),
    setDocumentToDelete,
    setDocumentToEdit,
    setQuery,
    selectDocument,
    clearSelectedDocument,
    handleCategoryChange,
  }
}
