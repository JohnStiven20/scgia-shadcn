# Implementación del nuevo flujo de Documentos del Trabajador

## 1. Objetivo

El objetivo es refactorizar la pestaña **Documentos** del perfil del trabajador para simplificar la navegación y eliminar la distribución actual en tres columnas.

La nueva vista debe quedar organizada alrededor de dos estados principales:

1. **Listado de documentos**
   - Buscador.
   - Filtro por categoría mediante `Select`.
   - Tabla con todos los registros visibles.
2. **Detalle de un documento**
   - Breadcrumb para volver.
   - Acciones principales.
   - Información completa del documento.
   - Vista previa embebida mediante `iframe` si es PDF.

La regla principal es:

> La tabla sirve para localizar documentos. El detalle sirve para trabajar con el documento seleccionado.

No se debe mostrar la tabla y el detalle al mismo tiempo.

---

# 2. Arquitectura actual

El flujo actual parte de:

```text
WorkerPage
   ↓
Pestaña “Documentos”
   ↓
WorkerDocumentsTab
   ↓
useWorkerDocumentsTab
   ├── WorkerDocumentList
   ├── DocumentCategorySidebar
   ├── WorkerDocumentDetailPanel
   ├── CreateWorkerDocumentDialog
   └── ConfirmDeleteDialog
```

La nueva implementación mantendrá la mayoría de esta infraestructura, pero modificará la composición visual.

La nueva estructura recomendada será:

```text
WorkerPage
   ↓
WorkerDocumentsTab
   ↓
useWorkerDocumentsTab
   ├── WorkerDocumentFilters
   ├── WorkerDocumentTable
   ├── WorkerDocumentDetailView
   │    ├── WorkerDocumentBreadcrumb
   │    ├── WorkerDocumentDetailHeader
   │    ├── WorkerDocumentInfo
   │    └── WorkerDocumentPreview
   ├── CreateWorkerDocumentDialog
   └── ConfirmDeleteDialog
```

`DocumentCategorySidebar` dejará de utilizarse.

---

# 3. Elementos que desaparecen

Se elimina completamente la columna lateral de categorías:

```text
Categorías
- Todas
- Formación
- Seguridad
- Operación
- Sin sección
```

También desaparece la maquetación de tres columnas:

```text
Categorías | Tabla | Detalle
```

La nueva vista utilizará todo el ancho disponible.

La categoría pasa a ser un filtro normal mediante `Select`.

---

# 4. Nueva vista inicial

La cabecera de la pestaña se mantiene:

```text
FORMACIONES Y DOCUMENTOS

Cursos, certificados y documentación con vencimiento del trabajador.

[Añadir curso] [Subir documento]
```

Debajo se mostrarán los filtros:

```text
[ Buscar documentos... ] [ Categoría: Todas ▼ ]
```

Y debajo:

```text
Documentos del trabajador
```

con la tabla completa.

Ejemplo:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Buscar documentos...        Categoría                             │
│ [____________________]      [ Todas ▼ ]                           │
├────────────────────────────────────────────────────────────────────┤
│ Documentos del trabajador                                         │
│                                                                    │
│ Documento            Categoría   Fecha curso  Vencimiento  Estado │
│ Curso PRL 20h.pdf    Formación   29/07/2026   31/10/2026   Vigente│
│ Carretilla.pdf       Operación   15/06/2026   15/06/2027   Vigente│
│ Emergencia.pdf       Seguridad   10/01/2026   10/01/2027   ...    │
└────────────────────────────────────────────────────────────────────┘
```

---

# 5. Filtro de categoría

El filtro de categoría debe ser un `Select`.

Valores disponibles:

```ts
const DOCUMENT_CATEGORY_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Formación", value: "TRAINING" },
  { label: "Seguridad", value: "SECURITY" },
  { label: "Operación", value: "OPERATION" },
  { label: "Sin sección", value: "NO_SECTION" },
];
```

Adaptar los valores reales a los enums existentes en el proyecto.

El valor inicial debe ser:

```ts
"all"
```

por lo tanto, al entrar en la vista se muestran todos los documentos.

---

# 6. Composición de filtros

El buscador y el filtro de categoría deben aplicarse de forma local.

Ejemplo:

```ts
const filteredDocuments = documents
  .filter((document) => {
    if (selectedCategory === "all") {
      return true;
    }

    return document.category === selectedCategory;
  })
  .filter((document) =>
    document.title
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );
```

No es necesario realizar una nueva petición al backend cuando:

- cambia el texto de búsqueda;
- cambia la categoría.

La petición principal sigue siendo:

```ts
useGetWorkerTrainingDocumentsByWorkerIdQuery(workerId);
```

---

# 7. Estado de filtros

En `useWorkerDocumentsTab` mantener:

```ts
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");
```

No es necesario mantener `selectedSection` si únicamente representaba la sidebar antigua.

Puede sustituirse directamente por:

```ts
selectedCategory
```

---

# 8. Tabla de documentos

El componente actual `WorkerDocumentList` debería convertirse en una tabla real.

Nombre recomendado:

```text
WorkerDocumentTable
```

Debe utilizar el componente `DataTable` reutilizable existente en el proyecto.

La tabla debe ocupar el 100% del ancho disponible.

Columnas:

```text
Documento
Categoría
Fecha curso
Vencimiento
Estado
```

Ejemplo:

```ts
const columns = [
  {
    accessorKey: "title",
    header: "Documento",
  },
  {
    accessorKey: "categoryLabel",
    header: "Categoría",
  },
  {
    accessorKey: "courseDate",
    header: "Fecha curso",
  },
  {
    accessorKey: "expirationDate",
    header: "Vencimiento",
  },
  {
    accessorKey: "status",
    header: "Estado",
  },
];
```

---

# 9. La fila completa es clicable

No añadir una columna de acciones.

No añadir botones de:

```text
Abrir
Editar
Eliminar
```

dentro de la tabla.

Toda la fila debe ejecutar:

```ts
onRowClick(document.id);
```

Ejemplo:

```tsx
<WorkerDocumentTable
  documents={filteredDocuments}
  onRowClick={(documentId) => {
    setSelectedDocumentId(documentId);
  }}
/>
```

Visualmente:

```css
cursor: pointer;
```

con un hover ligero.

---

# 10. Estado seleccionado

Al hacer click sobre una fila puede mostrarse un fondo suave durante la interacción.

Ejemplo:

```css
background: rgba(59, 130, 246, 0.08);
```

No es necesario mantener esa selección después, porque inmediatamente se sustituirá la tabla por el detalle.

---

# 11. Eliminación de la selección automática

Actualmente existe una lógica similar a:

```ts
const selectedDocument =
  filteredDocuments.find(
    (document) => document.id === selectedDocumentId
  ) ?? filteredDocuments[0] ?? null;
```

Esto debe eliminarse.

La nueva lógica debe ser:

```ts
const selectedDocument =
  documents.find(
    (document) => document.id === selectedDocumentId
  ) ?? null;
```

El motivo es que:

```ts
selectedDocumentId === null
```

debe representar explícitamente el estado:

```text
LISTADO
```

No debe seleccionarse automáticamente el primer documento.

---

# 12. Estados principales de navegación

La vista tendrá dos estados:

```ts
type WorkerDocumentViewMode =
  | "list"
  | "detail";
```

Aunque se puede derivar directamente:

```ts
const isDetailView = selectedDocumentId !== null;
```

Render:

```tsx
{selectedDocumentId === null ? (
  <WorkerDocumentListView />
) : (
  <WorkerDocumentDetailView />
)}
```

---

# 13. Vista de listado

La vista de listado contiene:

```text
Buscador
Select de categoría
Tabla
```

Ejemplo:

```tsx
<>
  <WorkerDocumentFilters
    searchTerm={searchTerm}
    selectedCategory={selectedCategory}
    onSearchChange={setSearchTerm}
    onCategoryChange={setSelectedCategory}
  />

  <WorkerDocumentTable
    documents={filteredDocuments}
    onRowClick={setSelectedDocumentId}
  />
</>
```

---

# 14. Click en un registro

Cuando se pulsa una fila:

```ts
setSelectedDocumentId(document.id);
```

La tabla deja de renderizarse.

No se abre:

- modal;
- drawer;
- panel lateral;
- tercera columna.

El mismo espacio principal pasa a contener el detalle.

---

# 15. Vista de detalle

La estructura será:

```text
Breadcrumb
Título + acciones

Información principal

Vista previa del documento

Información adicional
```

Ejemplo:

```text
Documentos / Formación / Curso PRL 20h.pdf

Curso PRL 20h.pdf
[Abrir en nueva ventana] [Editar] [Eliminar]

Categoría     Formación
Fecha curso   29/07/2026
Vencimiento   31/10/2026
Estado        Vigente

[ PDF / IMAGEN ]

Información del documento
Trabajador
Categoría
Fecha curso
Vencimiento
Días restantes
Archivo
Tamaño
Observaciones
```

---

# 16. Breadcrumb

Añadir navegación contextual.

Ejemplo:

```text
Documentos / Formación / Curso PRL 20h.pdf
```

o:

```text
← Volver a documentos
```

`Documentos` debe ser clicable.

Al pulsarlo:

```ts
setSelectedDocumentId(null);
```

Esto vuelve al listado.

---

# 17. Persistencia de filtros al volver

Al volver desde el detalle:

```ts
setSelectedDocumentId(null);
```

NO modificar:

```ts
searchTerm
selectedCategory
```

Por tanto, si el usuario estaba en:

```text
Categoría: Formación
```

debe regresar a:

```text
Categoría: Formación
```

y ver únicamente esos registros.

Esto mejora la navegación porque mantiene el contexto.

---

# 18. Cabecera del detalle

La cabecera debe mostrar:

```text
Curso PRL 20h.pdf
```

y a la derecha:

```text
[Abrir en nueva ventana] [Editar] [Eliminar]
```

No añadir un botón:

```text
Ver documento
```

porque el documento ya estará visible por defecto.

---

# 19. Abrir en nueva ventana

La URL ya existe mediante:

```ts
buildDocumentUrl(document.documentPath);
```

Por tanto:

```ts
const handleOpenDocument = () => {
  window.open(
    documentUrl,
    "_blank",
    "noopener,noreferrer"
  );
};
```

No realizar una nueva petición.

---

# 20. Editar

Mantener la lógica existente:

```ts
setDocumentToEdit(rawSelectedDocument);
```

y abrir:

```tsx
<CreateWorkerDocumentDialog
  workerId={workerId}
  document={documentToEdit}
/>
```

El modo edición continúa detectándose mediante:

```ts
const isEditMode = Boolean(document);
```

y ejecuta:

```ts
useUpdateWorkerTrainingDocumentMutation();
```

---

# 21. Eliminar

Mantener:

```tsx
<ConfirmDeleteDialog />
```

Al confirmar:

```ts
useDeleteWorkerTrainingDocumentMutation();
```

Después:

```ts
setSelectedDocumentId(null);
```

y RTK Query vuelve a cargar el listado mediante la invalidación existente.

---

# 22. Información principal del detalle

Justo debajo de la cabecera se mostrarán los datos más importantes.

Ejemplo:

```text
Categoría       Formación
Fecha curso     29/07/2026
Vencimiento     31/10/2026
Estado          Vigente
```

Puede implementarse mediante un grid horizontal:

```css
display: grid;
grid-template-columns: repeat(4, minmax(0, 1fr));
```

En móvil:

```css
grid-template-columns: 1fr;
```

---

# 23. Vista previa

Debajo de los datos principales debe mostrarse inmediatamente la vista previa.

No debe estar cerrada.

No utilizar:

- Accordion;
- modal;
- botón "Ver";
- expansión manual.

La previsualización se muestra por defecto.

---

# 24. URL del documento

Seguir utilizando:

```ts
const documentUrl = buildDocumentUrl(
  document.documentPath
);
```

No es necesario modificar el backend.

---

# 25. PDF

Si es PDF:

```tsx
<iframe
  src={documentUrl}
  title={document.title}
  width="100%"
  height="760"
  style={{
    border: 0,
    display: "block",
  }}
/>
```

Debe ocupar todo el ancho disponible.

El objetivo es que el PDF deje de verse estrecho como en la antigua tercera columna.

---

# 26. Imagen

Si es una imagen:

```tsx
<img
  src={documentUrl}
  alt={document.title}
/>
```

Con:

```css
max-width: 100%;
max-height: 760px;
object-fit: contain;
```

---

# 27. Otros formatos

Para tipos no previsualizables:

```text
Este documento no dispone de vista previa.

[Abrir en nueva ventana]
```

No intentar forzar un `iframe` para formatos incompatibles.

---

# 28. Información completa del documento

Debajo de la previsualización puede mantenerse el bloque actual:

```text
Información del documento
```

con:

```text
Trabajador
Categoría
Fecha curso
Vencimiento
Días restantes
Archivo
Tamaño
Observaciones
```

Ejemplo:

```tsx
<WorkerDocumentInfo
  items={buildWorkerDocumentInfo(document)}
/>
```

La función existente:

```ts
buildWorkerDocumentInfo(document)
```

debe seguir reutilizándose.

---

# 29. Orden recomendado del detalle

El orden final será:

```text
Breadcrumb

Título + acciones

Datos principales

Preview

Información completa
```

No:

```text
Información completa
Preview
```

La preview es uno de los elementos principales del detalle y debe ser visible rápidamente.

---

# 30. Cambio de categoría desde el detalle

Como la sidebar deja de existir, el `Select` solo se mostrará en la vista de listado.

En el detalle no hace falta mostrar el filtro.

Para cambiar categoría, el usuario vuelve primero a:

```text
Documentos
```

mediante breadcrumb.

Esto simplifica la interfaz.

---

# 31. Buscador en el detalle

El buscador tampoco se muestra en el detalle.

Solo pertenece al estado:

```text
list
```

Por tanto:

```tsx
selectedDocumentId === null
```

renderiza filtros.

```tsx
selectedDocumentId !== null
```

renderiza breadcrumb + detalle.

---

# 32. Crear documento

Los botones:

```text
Añadir curso
Subir documento
```

pueden mantenerse en la cabecera global de la pestaña.

Por tanto, estarán visibles tanto en:

```text
list
```

como en:

```text
detail
```

si se desea mantener coherencia con la página actual.

---

# 33. Estado después de crear

Después de crear correctamente:

```ts
setSelectedDocumentId(null);
```

La tabla se actualiza vía RTK Query.

Puede mantenerse:

```ts
selectedCategory
searchTerm
```

si el nuevo registro coincide con ellos.

---

# 34. Estado después de editar

Después de editar correctamente el documento seleccionado:

```text
mantener detail
```

RTK Query actualiza los datos.

No volver automáticamente a la tabla.

---

# 35. Estado después de eliminar

Después de eliminar:

```ts
setSelectedDocumentId(null);
```

porque el documento deja de existir.

El usuario vuelve a la tabla.

---

# 36. Loading de listado

Mientras:

```ts
useGetWorkerTrainingDocumentsByWorkerIdQuery(workerId)
```

esté cargando, mostrar un skeleton de tabla.

No utilizar un spinner que sustituya toda la pantalla.

---

# 37. Loading de detalle

Si el detalle necesita:

```ts
useGetWorkerTrainingDocumentByIdQuery(id)
```

puede mostrar:

```text
Datos del documento
██████████
██████████
```

mientras se carga.

Si los datos del listado ya contienen todo lo necesario, no hace falta realizar una petición adicional.

---

# 38. Loading del iframe

El iframe puede tener su propio estado:

```ts
const [previewLoading, setPreviewLoading] =
  useState(true);
```

Ejemplo:

```tsx
<Box position="relative">
  {previewLoading && <DocumentPreviewSkeleton />}

  <iframe
    src={documentUrl}
    onLoad={() => setPreviewLoading(false)}
  />
</Box>
```

---

# 39. Error del listado

Mostrar:

```text
No se pudieron cargar los documentos.

[Reintentar]
```

---

# 40. Error del preview

El error del preview no debe romper el detalle.

Mostrar:

```text
No se pudo cargar la vista previa.

[Abrir en nueva ventana]
```

pero seguir mostrando:

```text
Información del documento
```

---

# 41. Estado vacío general

Si:

```ts
documents.length === 0
```

mostrar:

```text
No hay documentos registrados para este trabajador.

[Subir documento]
```

---

# 42. Estado vacío filtrado

Si:

```ts
documents.length > 0
```

pero:

```ts
filteredDocuments.length === 0
```

mostrar:

```text
No hay documentos que coincidan con los filtros seleccionados.
```

No utilizar el mismo estado vacío que para un trabajador sin documentos.

---

# 43. Nueva composición de `WorkerDocumentsTab`

Ejemplo:

```tsx
function WorkerDocumentsTab({ workerId }: Props) {
  const {
    filteredDocuments,
    selectedDocument,
    selectedDocumentId,

    searchTerm,
    selectedCategory,

    setSearchTerm,
    setSelectedCategory,

    selectDocument,
    clearSelectedDocument,

    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
  } = useWorkerDocumentsTab({ workerId });

  return (
    <>
      <WorkerDocumentsHeader
        onAddCourse={openCreateDialog}
        onUploadDocument={openCreateDialog}
      />

      {selectedDocumentId === null ? (
        <>
          <WorkerDocumentFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
          />

          <WorkerDocumentTable
            documents={filteredDocuments}
            onRowClick={selectDocument}
          />
        </>
      ) : (
        <WorkerDocumentDetailView
          document={selectedDocument}
          onBack={clearSelectedDocument}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}

      <CreateWorkerDocumentDialog />

      <ConfirmDeleteDialog />
    </>
  );
}
```

---

# 44. Nuevo `WorkerDocumentFilters`

Responsabilidad:

```text
Buscador
Select categoría
```

Props:

```ts
interface WorkerDocumentFiltersProps {
  searchTerm: string;
  selectedCategory: string;

  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}
```

Render conceptual:

```tsx
<Stack
  direction={{ xs: "column", md: "row" }}
  spacing={2}
>
  <TextField
    placeholder="Buscar documentos..."
    value={searchTerm}
    onChange={(event) =>
      onSearchChange(event.target.value)
    }
  />

  <TextField
    select
    label="Categoría"
    value={selectedCategory}
    onChange={(event) =>
      onCategoryChange(event.target.value)
    }
  >
    {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
      <MenuItem
        key={option.value}
        value={option.value}
      >
        {option.label}
      </MenuItem>
    ))}
  </TextField>
</Stack>
```

---

# 45. Nuevo `WorkerDocumentTable`

Responsabilidad:

```text
Mostrar registros
Seleccionar registro
```

No debe gestionar:

- edición;
- eliminación;
- preview;
- filtros.

Props:

```ts
interface WorkerDocumentTableProps {
  documents: WorkerDocumentViewModel[];
  onRowClick: (documentId: number) => void;
}
```

---

# 46. `WorkerDocumentDetailView`

Responsabilidad:

```text
Breadcrumb
Cabecera
Datos
Preview
Información adicional
```

Ejemplo:

```tsx
function WorkerDocumentDetailView({
  document,
  onBack,
  onEdit,
  onDelete,
}: Props) {
  const documentUrl =
    buildDocumentUrl(document.documentPath);

  return (
    <Stack spacing={3}>
      <WorkerDocumentBreadcrumb
        document={document}
        onBack={onBack}
      />

      <WorkerDocumentDetailHeader
        document={document}
        documentUrl={documentUrl}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <WorkerDocumentSummary
        document={document}
      />

      <WorkerDocumentPreview
        document={document}
        url={documentUrl}
      />

      <WorkerDocumentInfo
        document={document}
      />
    </Stack>
  );
}
```

---

# 47. Cambios en `useWorkerDocumentsTab`

Eliminar lógica ligada exclusivamente a la sidebar.

Por ejemplo, sustituir:

```ts
selectedSection
setSelectedSection
```

por:

```ts
selectedCategory
setSelectedCategory
```

Mantener:

```ts
selectedDocumentId
documentToEdit
documentToDelete
searchTerm
```

---

# 48. API

No es necesario crear nuevos servicios.

Se mantienen:

```text
GET    /worker-training-document/worker/{workerId}
GET    /worker-training-document/{id}
POST   /worker-training-document
PUT    /worker-training-document/{id}
DELETE /worker-training-document/{id}
```

El rediseño afecta principalmente al frontend.

---

# 49. RTK Query

Mantener las invalidaciones actuales.

Después de:

```text
POST
PUT
DELETE
```

invalidar:

```text
WorkerTrainingDocuments
```

para el trabajador correspondiente.

---

# 50. Resultado final del flujo

## Estado 1

```text
Buscar documentos   Categoría: Todas

Tabla con todos los documentos
```

## Estado 2

```text
Categoría: Formación

Tabla únicamente con documentos de Formación
```

## Estado 3

```text
click en una fila
```

Puede verse momentáneamente el estado visual seleccionado.

## Estado 4

La tabla desaparece.

```text
Documentos / Formación / Curso PRL 20h.pdf

[Abrir] [Editar] [Eliminar]

Datos principales

PDF abierto automáticamente

Información completa
```

## Estado 5

El usuario pulsa:

```text
Documentos
```

o:

```text
← Volver a documentos
```

y vuelve a:

```text
Categoría: Formación
```

con el filtro anterior conservado.

---

# 51. Principio final

La implementación debe evitar duplicar información y evitar mantener demasiados paneles simultáneamente.

El flujo debe ser:

```text
Buscar / Filtrar
      ↓
Tabla
      ↓ click
Detalle
      ↓
Preview + acciones
      ↓
Volver
```

La eliminación de la sidebar permite utilizar prácticamente todo el ancho disponible para la tabla y, especialmente, para el visor del documento.

El resultado debe ser más simple, más legible y más coherente con el flujo ya utilizado en el módulo de contratos.
