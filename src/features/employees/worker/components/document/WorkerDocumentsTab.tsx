import { Layers3, Plus, Search, Upload } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWorkerDocumentsTab } from "../../hook/useWorkerDocumentsTab"
import { CreateWorkerDocumentDialog } from "./CreateWorkerDocumentDialog"
import { WorkerDocumentDetailPanel } from "./WorkerDocumentDetailPanel"
import { WorkerDocumentList } from "./WorkerDocumentList"

type WorkerDocumentsTabProps = {
  workerId: number
}

export function WorkerDocumentsTab({ workerId }: WorkerDocumentsTabProps) {
  const {
    canFetchDocuments,
    documents,
    documentToDelete,
    documentToEdit,
    hasDocuments,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    isDeletingDocument,
    isEditDialogOpen,
    isError,
    isFetching,
    query,
    rawSelectedDocument,
    refetch,
    selectedCategory,
    selectedDocument,
    categoryOptions,
    confirmDeleteDocument,
    handleCategoryChange,
    handleCreateDialogOpenChange,
    handleDeleteDialogClose,
    handleDocumentCreated,
    handleDocumentUpdated,
    handleEditDialogOpenChange,
    openCreateDialog,
    setDocumentToDelete,
    setDocumentToEdit,
    setQuery,
    selectDocument,
    clearSelectedDocument,
  } = useWorkerDocumentsTab({ workerId })

  const isListView = selectedDocument === null

  return (
    <section className="grid w-full min-w-0 gap-5">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">
            Formaciones y documentos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cursos, certificados y documentación con vencimiento del trabajador.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={!canFetchDocuments}
            onClick={openCreateDialog}
          >
            <Plus />
            Añadir curso
          </Button>
          <Button
            type="button"
            disabled={!canFetchDocuments}
            onClick={openCreateDialog}
          >
            <Upload />
            Subir documento
          </Button>
        </div>
      </header>

      {isListView ? (
        <>
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full min-w-0 md:max-w-xl">
              <label htmlFor="worker-document-search">
                Buscar documentos
              </label>
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id="worker-document-search"
                  value={query}
                  placeholder="Buscar documentos..."
                  onChange={(event) => setQuery(event.target.value)}
                />
              </InputGroup>
            </div>

            <div className="w-full min-w-0 md:max-w-sm">
              <label
                htmlFor="worker-document-category"
              >
                Categoría
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  handleCategoryChange(
                    value as (typeof categoryOptions)[number]["key"]
                  )
                }
              >
                <SelectTrigger
                  id="worker-document-category"
                  className="h-10 w-full"
                >
                  <Layers3 className="text-muted-foreground" />
                  <SelectValue placeholder="Selecciona una categoría">
                    {categoryOptions.find(
                      (option) => option.key === selectedCategory
                    )?.label ?? "Todos"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              No se han podido cargar los documentos.
              <Button
                type="button"
                variant="link"
                className="ml-1 h-auto px-0 text-xs"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : null}

          <WorkerDocumentList
            documents={documents}
            hasDocuments={hasDocuments}
            isLoading={isFetching}
            onSelectDocument={selectDocument}
          />
        </>
      ) : (
        <WorkerDocumentDetailPanel
          document={selectedDocument}
          onBack={clearSelectedDocument}
          onEditDocument={() => {
            if (rawSelectedDocument) setDocumentToEdit(rawSelectedDocument)
          }}
          onDeleteDocument={() => {
            if (rawSelectedDocument) setDocumentToDelete(rawSelectedDocument)
          }}
        />
      )}

      {isCreateDialogOpen ? (
        <CreateWorkerDocumentDialog
          open={isCreateDialogOpen}
          workerId={workerId}
          onCreated={handleDocumentCreated}
          onOpenChange={handleCreateDialogOpenChange}
        />
      ) : null}
      {isEditDialogOpen ? (
        <CreateWorkerDocumentDialog
          open={isEditDialogOpen}
          workerId={workerId}
          document={documentToEdit}
          onCreated={handleDocumentUpdated}
          onOpenChange={handleEditDialogOpenChange}
        />
      ) : null}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Eliminar documento"
        subtitle={`¿Seguro que quieres eliminar "${
          documentToDelete?.trainingTitle || documentToDelete?.fileName || ""
        }"?`}
        loading={isDeletingDocument}
        onClose={handleDeleteDialogClose}
        onDelete={confirmDeleteDocument}
      />
    </section>
  )
}
