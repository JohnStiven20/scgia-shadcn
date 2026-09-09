import { FileText, Filter, Plus, Search, Upload } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/general"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useWorkerDocumentsTab } from "../../hook/useWorkerDocumentsTab"
import { CreateWorkerDocumentDialog } from "./CreateWorkerDocumentDialog"
import { DocumentCategorySidebar } from "./DocumentCategorySidebar"
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
    isCreateDialogOpen,
    isDeleteDialogOpen,
    isDeletingDocument,
    isEditDialogOpen,
    isError,
    isFetching,
    query,
    rawSelectedDocument,
    refetch,
    sectionCounters,
    selectedDocument,
    selectedSection,
    confirmDeleteDocument,
    handleCreateDialogOpenChange,
    handleDeleteDialogClose,
    handleDocumentSaved,
    handleEditDialogOpenChange,
    openCreateDialog,
    setDocumentToDelete,
    setDocumentToEdit,
    setQuery,
    setSelectedDocumentId,
    setSelectedSection,
  } = useWorkerDocumentsTab({ workerId })

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">
              FORMACIONES Y DOCUMENTOS
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cursos, certificados y documentacion con vencimiento del trabajador.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canFetchDocuments}
            onClick={openCreateDialog}
          >
            <Plus />
            Anadir curso
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <InputGroup className="h-10 md:max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            placeholder="Buscar documentos..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <Button type="button" variant="outline" className="w-fit" disabled>
          <Filter />
          Filtrar
        </Button>
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

      <div className="grid min-w-0 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <DocumentCategorySidebar
          categories={sectionCounters}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
        />

        <div className="grid min-w-0 gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
          <WorkerDocumentList
            documents={documents}
            selectedDocumentId={selectedDocument?.id}
            isFetching={isFetching}
            onSelectDocument={setSelectedDocumentId}
          />
          <WorkerDocumentDetailPanel
            document={selectedDocument}
            onEditDocument={() => {
              if (rawSelectedDocument) {
                setDocumentToEdit(rawSelectedDocument)
              }
            }}
            onDeleteDocument={() => {
              if (rawSelectedDocument) {
                setDocumentToDelete(rawSelectedDocument)
              }
            }}
          />
        </div>
      </div>

      {isCreateDialogOpen ? (
        <CreateWorkerDocumentDialog
          open={isCreateDialogOpen}
          workerId={workerId}
          onCreated={handleDocumentSaved}
          onOpenChange={handleCreateDialogOpenChange}
        />
      ) : null}
      {isEditDialogOpen ? (
        <CreateWorkerDocumentDialog
          open={isEditDialogOpen}
          workerId={workerId}
          document={documentToEdit}
          onCreated={handleDocumentSaved}
          onOpenChange={handleEditDialogOpenChange}
        />
      ) : null}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Eliminar documento"
        subtitle={`Seguro que quieres eliminar "${
          documentToDelete?.trainingTitle || documentToDelete?.fileName || ""
        }"?`}
        loading={isDeletingDocument}
        onClose={handleDeleteDialogClose}
        onDelete={confirmDeleteDocument}
      />
    </section>
  )
}
