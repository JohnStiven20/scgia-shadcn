# Refactorización del flujo de Documentos del Trabajador

## 1. Objetivo

El objetivo es simplificar la pestaña **Documentos** del perfil del trabajador y sustituir la distribución actual de tres columnas por un flujo más claro y parecido al ya definido para **Contratos**.

Actualmente la vista mantiene simultáneamente:

1. Categorías.
2. Lista o tabla de documentos.
3. Panel de detalle con previsualización del archivo.

La nueva implementación debe evitar mostrar demasiada información al mismo tiempo. La idea es mantener las categorías como filtro y utilizar el área principal para mostrar **o bien el listado de documentos, o bien el detalle completo de un documento seleccionado**.

El flujo final será:

```text
WorkerPage
   ↓
Pestaña "Documentos"
   ↓
WorkerDocumentsTab
   ↓
┌─────────────────────────────────────┐
│ Categorías │ Tabla de documentos    │
└─────────────────────────────────────┘
                     ↓ click fila
┌─────────────────────────────────────┐
│ Categorías │ Detalle del documento  │
│            │ + vista previa         │
└─────────────────────────────────────┘
```

No se abrirá un panel lateral adicional, ni un `Drawer`, ni un modal para consultar el detalle.

---

# 2. Arquitectura actual que se mantiene

La entrada desde `WorkerPage` no necesita cambiar.

```tsx
<WorkerDocumentsTab workerId={workerId} />
```

El `workerId` sigue identificando al trabajador cuyo perfil se está consultando.

La carga principal continuará utilizando:

```ts
useGetWorkerTrainingDocumentsByWorkerIdQuery(workerId)
```

con:

```http
GET /worker-training-document/worker/{workerId}
```

RTK Query seguirá siendo responsable de:

- obtener los documentos;
- gestionar caché;
- refrescar el listado;
- invalidar los documentos después de crear, editar o eliminar.

También se reutilizan los servicios existentes:

| Acción | Hook | Endpoint |
|---|---|---|
| Listar | `useGetWorkerTrainingDocumentsByWorkerIdQuery` | `GET /worker-training-document/worker/{workerId}` |
| Obtener uno | `useGetWorkerTrainingDocumentByIdQuery` | `GET /worker-training-document/{id}` |
| Crear | `useCreateWorkerTrainingDocumentMutation` | `POST /worker-training-document` |
| Editar | `useUpdateWorkerTrainingDocumentMutation` | `PUT /worker-training-document/{id}` |
| Eliminar | `useDeleteWorkerTrainingDocumentMutation` | `DELETE /worker-training-document/{id}` |

No hace falta crear nuevos endpoints para implementar este rediseño.

---

# 3. Cambio principal de navegación

La vista tendrá dos estados principales:

```ts
type WorkerDocumentsView =
  | "list"
  | "detail";
```

Aunque no es obligatorio almacenar explícitamente un `view`, puede derivarse del documento seleccionado.

Por ejemplo:

```ts
const isDetailView = selectedDocumentId !== null;
```

Entonces:

```tsx
{selectedDocumentId === null ? (
  <WorkerDocumentTable />
) : (
  <WorkerDocumentDetail />
)}
```

La regla principal será:

> La tabla y el detalle no se muestran simultáneamente en el mismo espacio principal.

Cuando el usuario selecciona una fila, la tabla desaparece y se renderiza el detalle.

---

# 4. Cambio importante en `useWorkerDocumentsTab`

Actualmente el hook selecciona automáticamente el primer documento disponible mediante una lógica similar a:

```ts
const selectedDocument =
  filteredDocuments.find(
    (document) => document.id === selectedDocumentId
  ) ?? filteredDocuments[0] ?? null;
```

Esta lógica debe cambiar.

En el nuevo flujo, al entrar en la pestaña **Documentos**, no debe existir ningún documento seleccionado automáticamente.

La vista inicial siempre debe ser la tabla.

La selección debería resolverse así:

```ts
const selectedDocument =
  filteredDocuments.find(
    (document) => document.id === selectedDocumentId
  ) ?? null;
```

De esta forma:

```ts
selectedDocumentId === null
```

significa:

```text
mostrar listado
```

y:

```ts
selectedDocumentId !== null
```

significa:

```text
mostrar detalle
```

Esto es fundamental para evitar que el usuario entre directamente en un detalle sin haber seleccionado ningún registro.

---

# 5. Estado inicial: categorías + tabla

La pantalla inicial conservará dos zonas.

```text
┌──────────────────┬─────────────────────────────────────────────┐
│                  │                                             │
│   CATEGORÍAS     │        DOCUMENTOS DEL TRABAJADOR            │
│                  │                                             │
│   Todas          │        Tabla                                │
│   Formación      │                                             │
│   Seguridad      │                                             │
│   Operación      │                                             │
│   Sin sección    │                                             │
│                  │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

La antigua tercera columna desaparece completamente.

El visor del documento solo se mostrará después de seleccionar un registro.

---

# 6. Filtro por categorías

`DocumentCategorySidebar` puede seguir existiendo prácticamente igual.

Las categorías serán:

```ts
Todas
Formación
Seguridad
Operación
Sin sección
```

La categoría inicial debe ser:

```ts
"all"
```

o el valor equivalente que ya utilice el proyecto.

Esto significa:

> Al entrar por primera vez en la pestaña se visualizan todos los documentos.

El filtrado seguirá siendo local.

No se realizará una nueva petición al backend al cambiar de categoría.

Ejemplo conceptual:

```ts
const filteredDocuments = documents.filter((document) => {
  if (selectedSection === "all") {
    return true;
  }

  return document.section === selectedSection;
});
```

Los contadores existentes pueden mantenerse:

```text
Todas          12
Formación       5
Seguridad       3
Operación       3
Sin sección     1
```

---

# 7. Comportamiento de las categorías mientras se visualiza un detalle

La barra lateral puede mantenerse visible también en la vista de detalle.

Esto permite conservar el contexto del usuario.

Si el usuario está viendo un documento y pulsa otra categoría, el comportamiento recomendado es:

```ts
function handleSectionChange(section: DocumentSection) {
  setSelectedSection(section);
  setSelectedDocumentId(null);
}
```

Es decir:

1. cambiar categoría;
2. salir del detalle;
3. volver al listado;
4. mostrar los documentos de la categoría seleccionada.

Esto evita mantener abierto un documento que ya no pertenece al filtro activo.

---

# 8. Tabla de documentos

El componente actual `WorkerDocumentList` debería evolucionar a una tabla orientada a registros.

Puede mantenerse el mismo nombre o refactorizarse a algo más explícito:

```text
WorkerDocumentTable
```

La tabla utilizará el componente de tabla reutilizable que ya exista en el proyecto.

No se necesitan acciones dentro de cada fila.

La fila completa será clicable.

## Columnas recomendadas

```text
Documento
Categoría
Fecha curso
Vencimiento
Estado
```

Ejemplo:

```text
┌─────────────────────────┬────────────┬─────────────┬─────────────┬──────────────────┐
│ Documento               │ Categoría  │ Fecha curso │ Vencimiento │ Estado           │
├─────────────────────────┼────────────┼─────────────┼─────────────┼──────────────────┤
│ Curso PRL 20h.pdf       │ Formación  │ 29/07/2026  │ 31/10/2026  │ ● Vigente        │
│ Certificado carretilla  │ Operación  │ 15/06/2026  │ 15/06/2027  │ ● Vigente        │
│ Plan de emergencia.pdf  │ Seguridad  │ 10/01/2026  │ 10/01/2027  │ ● Archivado      │
└─────────────────────────┴────────────┴─────────────┴─────────────┴──────────────────┘
```

No se debe añadir una columna con botones de:

- abrir;
- editar;
- eliminar.

Estas acciones pertenecen al detalle.

---

# 9. Selección de una fila

Toda la fila debe ser interactiva.

Ejemplo:

```tsx
<DataTable
  rows={filteredDocuments}
  onRowClick={(document) => {
    setSelectedDocumentId(document.id);
  }}
/>
```

Visualmente:

```css
cursor: pointer;
```

y un `hover` muy suave.

Ejemplo:

```css
background-color: rgba(0, 0, 0, 0.02);
```

o el token equivalente del theme.

No debe ser necesario pulsar un icono específico.

---

# 10. Estado visual de selección

Opcionalmente puede mostrarse durante el click una selección suave de la fila.

Por ejemplo:

```text
Curso PRL 20h.pdf
```

puede adquirir temporalmente un fondo azul muy claro antes de cambiar al detalle.

Esto ayuda a que la interacción resulte clara, pero no debe retrasar artificialmente la navegación.

La navegación al detalle debe producirse inmediatamente.

---

# 11. Sustitución de la tabla por el detalle

Cuando:

```ts
selectedDocumentId !== null
```

el área principal deja de mostrar:

```tsx
<WorkerDocumentTable />
```

y renderiza:

```tsx
<WorkerDocumentDetailView />
```

La estructura conceptual sería:

```tsx
<Box>
  <DocumentCategorySidebar />

  <Box>
    {selectedDocumentId === null ? (
      <WorkerDocumentTable
        documents={filteredDocuments}
        onSelectDocument={setSelectedDocumentId}
      />
    ) : (
      <WorkerDocumentDetailView
        document={selectedDocument}
        onBack={() => setSelectedDocumentId(null)}
      />
    )}
  </Box>
</Box>
```

---

# 12. Breadcrumb de navegación

La vista de detalle debe mostrar navegación contextual.

Ejemplo:

```text
Documentos / Formación / Curso PRL 20h.pdf
```

o:

```text
← Volver a documentos
```

Puede utilizarse el componente `Breadcrumb` existente.

El elemento `Documentos` debe ser clicable.

Al pulsarlo:

```ts
setSelectedDocumentId(null);
```

Esto devuelve al usuario al listado sin perder la categoría seleccionada.

Por ejemplo, si el usuario estaba en:

```text
Formación
```

y entra en un documento, al volver debe regresar al listado filtrado por:

```text
Formación
```

No debe resetearse automáticamente a `Todas`.

---

# 13. Cabecera del detalle

La parte superior del detalle debe mostrar:

```text
Curso PRL 20h.pdf

[Abrir en nueva ventana] [Editar] [Eliminar]
```

Estas acciones ya existen actualmente, por lo que solo cambia su ubicación.

## Abrir en nueva ventana

La acción debe utilizar la misma URL de previsualización.

Ejemplo:

```ts
const documentUrl = buildDocumentUrl(document.documentPath);
```

y:

```ts
window.open(
  documentUrl,
  "_blank",
  "noopener,noreferrer"
);
```

No es necesario realizar otra petición.

El botón significa exclusivamente:

> abrir el documento fuera de la aplicación en otra pestaña/ventana.

---

# 14. Editar documento

El botón `Editar` reutiliza el flujo existente.

```ts
setDocumentToEdit(rawSelectedDocument);
```

Después:

```tsx
<CreateWorkerDocumentDialog
  open={Boolean(documentToEdit)}
  workerId={workerId}
  document={documentToEdit}
/>
```

El diálogo continúa detectando:

```ts
const isEditMode = Boolean(document);
```

y ejecuta:

```ts
useUpdateWorkerTrainingDocumentMutation()
```

con:

```http
PUT /worker-training-document/{id}
```

La implementación actual con `FormData` puede mantenerse.

No es necesario crear un nuevo modal.

---

# 15. Sustitución del archivo durante edición

El flujo actual permite reemplazar el archivo asociado al documento.

Esta funcionalidad puede mantenerse.

Ejemplo conceptual:

```text
Editar documento
────────────────────
Título
Categoría
Fecha curso
Vencimiento
Observaciones

Archivo actual:
curso-prl.pdf

[Seleccionar otro archivo]
```

Si el usuario no selecciona un archivo nuevo, se mantienen los metadatos y archivo existentes.

Si selecciona uno nuevo, el backend recibe el nuevo archivo mediante el mismo `FormData`.

---

# 16. Eliminar documento

El botón `Eliminar` reutiliza:

```tsx
<ConfirmDeleteDialog />
```

Al confirmar:

```ts
useDeleteWorkerTrainingDocumentMutation()
```

ejecuta:

```http
DELETE /worker-training-document/{id}
```

Después de eliminar correctamente:

```ts
setSelectedDocumentId(null);
```

RTK Query invalida:

```ts
WorkerTrainingDocuments
```

y vuelve a solicitar el listado actualizado.

El usuario vuelve automáticamente a la tabla.

---

# 17. Datos del documento

Dentro del detalle debe existir un bloque de información estructurada.

No se recomienda utilizar una tarjeta individual por propiedad.

Debe ser un único contenedor compacto.

Ejemplo:

```text
DATOS DEL DOCUMENTO

Documento           Curso PRL 20h.pdf
Trabajador          Cristofer234 macase
Categoría           Formación
Fecha curso         29/07/2026
Vencimiento         31/10/2026
Estado              Vigente
Días restantes      51 días
Tipo de archivo     PDF
Tamaño              5 KB
Observaciones       Curso de prevención...
```

Puede organizarse mediante:

```css
display: grid;
grid-template-columns: repeat(3, minmax(0, 1fr));
```

en pantallas grandes.

En resoluciones menores:

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

y finalmente:

```css
grid-template-columns: 1fr;
```

en móvil.

---

# 18. Cálculo de información derivada

`buildWorkerDocumentInfo(document)` puede seguir siendo responsable de preparar la información visual.

Por ejemplo:

```ts
const info = buildWorkerDocumentInfo(document);
```

Puede calcular:

- fecha formateada;
- vencimiento;
- días restantes;
- estado;
- tamaño del archivo;
- categoría;
- observaciones.

La UI no debería duplicar esta lógica.

---

# 19. Vista previa del documento

Debajo de los datos se mostrará:

```text
Vista previa del documento
```

La URL seguirá construyéndose mediante:

```ts
buildDocumentUrl(document.documentPath)
```

No hace falta modificar el backend para esta parte.

---

# 20. PDF

Para documentos PDF se reutiliza el `iframe`.

Ejemplo:

```tsx
<iframe
  src={documentUrl}
  title={document.title}
  width="100%"
  height="760"
  style={{
    border: 0,
  }}
/>
```

El visor debe ocupar prácticamente todo el ancho disponible del área principal.

A diferencia de la implementación antigua, ya no estará limitado a una tercera columna estrecha.

Esto permite visualizar el PDF con un tamaño mucho más cómodo.

---

# 21. Imágenes

Para imágenes:

```tsx
<img
  src={documentUrl}
  alt={document.title}
/>
```

El contenedor debe mantener:

```css
max-width: 100%;
object-fit: contain;
```

y limitar la altura máxima si fuera necesario.

---

# 22. Otros formatos

Si el archivo no puede previsualizarse directamente:

```text
Este archivo no dispone de vista previa.
```

Mostrar:

```text
Nombre
Tipo
Tamaño

[Abrir en nueva ventana]
```

No intentar incrustar formatos no soportados en un `iframe` sin necesidad.

---

# 23. Diseño de la vista de detalle

La estructura recomendada será:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Documentos / Formación / Curso PRL 20h.pdf                      │
│                                                                  │
│ Curso PRL 20h.pdf           [Abrir] [Editar] [Eliminar]          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ DATOS DEL DOCUMENTO                                              │
│                                                                  │
│ Categoría       Formación      Fecha curso    29/07/2026         │
│ Vencimiento     31/10/2026     Estado         Vigente            │
│ Días restantes  51 días        Tamaño         5 KB               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ VISTA PREVIA DEL DOCUMENTO                                       │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │                         PDF                                  │ │
│ │                                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

La barra lateral de categorías permanece a la izquierda.

---

# 24. Crear nuevos documentos

Los botones superiores:

```text
Añadir curso
Subir documento
```

pueden mantenerse.

Ambos reutilizan:

```tsx
<CreateWorkerDocumentDialog />
```

según el flujo actual.

Después de una creación correcta:

```ts
useCreateWorkerTrainingDocumentMutation()
```

invalida:

```ts
WorkerTrainingDocuments
```

y RTK Query actualiza la tabla.

No es necesario cambiar esta parte del backend.

---

# 25. Estado después de crear

Después de crear un documento, la opción recomendada es volver al listado actualizado.

Es decir:

```ts
setSelectedDocumentId(null);
```

Si se conoce la categoría del nuevo documento, puede conservarse la categoría actual o cambiar a la categoría correspondiente.

No se recomienda abrir automáticamente el documento recién creado salvo que sea un requisito explícito posterior.

---

# 26. Búsqueda

Si se quiere conservar el buscador existente:

```text
Buscar documentos...
```

puede seguir funcionando localmente junto al filtro de categoría.

Ejemplo:

```ts
const visibleDocuments = documents
  .filter(filterBySection)
  .filter(filterBySearch);
```

Sin embargo, el filtro principal de navegación seguirá siendo la categoría.

No es necesario realizar peticiones al backend al escribir.

---

# 27. Composición de filtros

La lógica puede mantenerse como:

```ts
const filteredDocuments = documents
  .filter((document) => {
    if (selectedSection === "all") {
      return true;
    }

    return document.section === selectedSection;
  })
  .filter((document) =>
    document.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
```

El valor inicial será:

```ts
selectedSection = "all";
searchTerm = "";
```

Por lo tanto, al abrir la pestaña se muestran todos los documentos.

---

# 28. Estado vacío

Si el trabajador no tiene documentos:

```text
No hay documentos registrados para este trabajador.

[Subir documento]
```

Si existe documentación pero un filtro no devuelve resultados:

```text
No hay documentos en la categoría "Seguridad".
```

No se debe mostrar el mismo mensaje para ambas situaciones.

---

# 29. Loading del listado

Mientras:

```ts
useGetWorkerTrainingDocumentsByWorkerIdQuery(workerId)
```

está cargando, mostrar un `Skeleton` de tabla.

Ejemplo:

```text
Documento      Categoría       Fecha       Vencimiento      Estado
──────────     ──────────      ─────       ───────────      ──────
████████       █████           █████       ███████          █████
████████       █████           █████       ███████          █████
```

No mostrar un `spinner` enorme en el centro de toda la pantalla.

---

# 30. Loading del visor

El documento puede tardar más en cargar que sus metadatos.

Por lo tanto, el bloque:

```text
Datos del documento
```

puede renderizarse inmediatamente.

Mientras el visor carga:

```text
Cargando vista previa...
```

o un skeleton del visor.

Esto evita bloquear toda la vista por la carga del archivo.

---

# 31. Errores

Deben diferenciarse los errores.

## Error cargando documentos

```text
No se pudieron cargar los documentos.

[Reintentar]
```

## Error cargando la vista previa

Los datos del documento deben seguir mostrándose:

```text
No se pudo cargar la vista previa del archivo.

[Abrir en nueva ventana]
```

No convertir un fallo del `iframe` en un error de toda la página.

---

# 32. Estructura recomendada de componentes

La nueva jerarquía puede quedar así:

```text
WorkerDocumentsTab
│
├── DocumentCategorySidebar
│
└── contenido principal
    │
    ├── WorkerDocumentTable
    │
    └── WorkerDocumentDetailView
        │
        ├── WorkerDocumentBreadcrumb
        ├── WorkerDocumentDetailHeader
        ├── WorkerDocumentInfo
        └── WorkerDocumentPreview
```

Los diálogos siguen estando gestionados desde el nivel de `WorkerDocumentsTab`:

```text
WorkerDocumentsTab
├── CreateWorkerDocumentDialog
└── ConfirmDeleteDialog
```

---

# 33. Responsabilidad de `WorkerDocumentsTab`

`WorkerDocumentsTab` debe encargarse de composición y navegación.

Por ejemplo:

```tsx
function WorkerDocumentsTab({ workerId }: Props) {
  const documentsState = useWorkerDocumentsTab({ workerId });

  return (
    <>
      <DocumentToolbar />

      <DocumentsLayout>
        <DocumentCategorySidebar
          selectedSection={documentsState.selectedSection}
          onChange={documentsState.handleSectionChange}
        />

        {documentsState.selectedDocument ? (
          <WorkerDocumentDetailView
            document={documentsState.selectedDocument}
            onBack={documentsState.clearSelectedDocument}
            onEdit={documentsState.openEditDialog}
            onDelete={documentsState.openDeleteDialog}
          />
        ) : (
          <WorkerDocumentTable
            documents={documentsState.filteredDocuments}
            onRowClick={documentsState.selectDocument}
          />
        )}
      </DocumentsLayout>

      <CreateWorkerDocumentDialog />

      <ConfirmDeleteDialog />
    </>
  );
}
```

---

# 34. Responsabilidad de `useWorkerDocumentsTab`

El hook seguirá concentrando:

- documentos cargados;
- categoría seleccionada;
- búsqueda;
- documento seleccionado;
- documento a editar;
- documento a eliminar;
- estados de diálogos;
- callbacks;
- datos filtrados.

Ejemplo conceptual:

```ts
return {
  documents,
  filteredDocuments,

  selectedSection,
  searchTerm,
  selectedDocument,

  setSearchTerm,
  handleSectionChange,

  selectDocument,
  clearSelectedDocument,

  openCreateDialog,
  closeCreateDialog,

  openEditDialog,
  closeEditDialog,

  openDeleteDialog,
  closeDeleteDialog,

  confirmDelete,
};
```

---

# 35. Selección por ID

La selección debe seguir almacenándose mediante ID:

```ts
const [selectedDocumentId, setSelectedDocumentId] =
  useState<number | null>(null);
```

No guardar una copia completa del documento como estado de navegación.

Esto evita inconsistencias después de una actualización de RTK Query.

El documento se deriva de los datos actuales:

```ts
const selectedDocument =
  documents.find(
    (document) => document.id === selectedDocumentId
  ) ?? null;
```

---

# 36. Documento transformado vs documento original

Actualmente existen documentos transformados mediante:

```ts
mapWorkerTrainingDocumentToViewModel
```

y documentos originales de API.

Esta separación puede mantenerse.

Para la tabla:

```ts
WorkerTrainingDocumentViewModel
```

Para editar/eliminar puede recuperarse el registro original mediante ID.

Ejemplo:

```ts
const rawSelectedDocument =
  rawDocuments.find(
    (document) => document.id === selectedDocumentId
  ) ?? null;
```

Esto permite mantener los contratos actuales de:

```ts
setDocumentToEdit(rawSelectedDocument);
```

y:

```ts
setDocumentToDelete(rawSelectedDocument);
```

sin duplicar lógica.

---

# 37. Navegación después de editar

Después de editar un documento correctamente, puede mantenerse abierto el detalle.

RTK Query invalida el documento/listado y los datos se refrescan.

El usuario continuará en:

```text
Documento seleccionado
```

pero viendo los valores actualizados.

Esto resulta más natural que devolverlo automáticamente a la tabla.

---

# 38. Navegación después de eliminar

Eliminar es diferente.

Después de una eliminación satisfactoria:

```ts
setSelectedDocumentId(null);
```

El usuario vuelve al listado porque el registro consultado ya no existe.

---

# 39. Responsividad

En escritorio:

```text
Categorías | Contenido principal
```

Por ejemplo:

```css
grid-template-columns: 280px minmax(0, 1fr);
```

En tablet o móvil, las categorías pueden transformarse en un `Select`, tabs horizontales o un control compacto.

Ejemplo:

```text
Categoría: [Todas ▼]
```

y debajo:

```text
Tabla / detalle
```

No mantener una sidebar de 280 px en pantallas pequeñas.

---

# 40. Elementos que desaparecen del diseño anterior

Debe eliminarse la estructura de tres columnas:

```text
Categorías | Lista | DetailPanel
```

También desaparece el comportamiento de:

```text
seleccionar automáticamente el primer documento
```

y el visor PDF reducido dentro de una columna estrecha.

La información del documento ya no permanecerá siempre visible mientras se navega por la tabla.

---

# 41. Elementos que se reutilizan

Se mantienen:

- `WorkerPage`;
- `WorkerDocumentsTab`;
- `useWorkerDocumentsTab`;
- `DocumentCategorySidebar`;
- `CreateWorkerDocumentDialog`;
- `ConfirmDeleteDialog`;
- `buildWorkerDocumentInfo`;
- `buildDocumentUrl`;
- `mapWorkerTrainingDocumentToViewModel`;
- RTK Query;
- endpoints actuales;
- preview mediante `<iframe>` para PDF;
- preview mediante `<img>` para imágenes.

El objetivo es refactorizar el flujo de UI, no reconstruir el módulo desde cero.

---

# 42. Resultado final

## Estado 1 — Entrada

```text
Categoría: Todas

Tabla:
- todos los documentos
```

## Estado 2 — Filtro

```text
Categoría: Formación

Tabla:
- solo documentos de Formación
```

## Estado 3 — Selección

```text
click en "Curso PRL 20h.pdf"
```

La tabla desaparece.

## Estado 4 — Detalle

```text
Documentos / Formación / Curso PRL 20h.pdf

Curso PRL 20h.pdf
[Abrir en nueva ventana] [Editar] [Eliminar]

Datos del documento
...

Vista previa
[ PDF a ancho completo ]
```

## Estado 5 — Volver

El usuario pulsa:

```text
Documentos
```

o:

```text
← Volver a documentos
```

y regresa a:

```text
Categoría: Formación
Tabla filtrada
```

---

# 43. Resumen técnico del flujo

```text
WorkerPage
   ↓
WorkerDocumentsTab
   ↓
useWorkerDocumentsTab
   ↓
GET documentos
   ↓
mapWorkerTrainingDocumentToViewModel
   ↓
Filtro categoría + búsqueda
   ↓
selectedDocumentId == null
   │
   └── WorkerDocumentTable
           ↓ click row
       setSelectedDocumentId(id)
           ↓
selectedDocumentId != null
   │
   └── WorkerDocumentDetailView
           ├── Breadcrumb
           ├── Información
           ├── Abrir
           ├── Editar
           ├── Eliminar
           └── Preview
                ├── iframe PDF
                ├── img
                └── fallback
```

---

# 44. Principio final de diseño

La pestaña debe seguir una regla muy simple:

> **La tabla sirve para encontrar un documento. El detalle sirve para trabajar con ese documento.**

No deben competir visualmente en la misma pantalla.

Las categorías ayudan a reducir los registros visibles.

La tabla permite localizar y seleccionar.

El detalle concentra:

- metadatos;
- acciones;
- previsualización.

Esto reduce la densidad visual de la implementación actual y reutiliza prácticamente toda la infraestructura existente del módulo.
