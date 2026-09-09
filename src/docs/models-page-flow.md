# Flujo de `ModelsPage`

Este documento describe la arquitectura y el comportamiento del módulo de modelos de inventario implementado en `src/features/inventory/models/page/ModesPage.tsx`.

## 1. Principios del módulo

- El frontend obtiene el catálogo completo con una única petición.
- RTK Query mantiene el catálogo en la caché global de Redux.
- La búsqueda, los filtros, la ordenación y la paginación se ejecutan en memoria mediante TanStack Table.
- Los controles actualizan la tabla en tiempo real; no existe un botón para aplicar filtros.
- Las categorías específico/genérico se gestionan mediante un filtro, sin pestañas.
- Un único panel lateral cambia de contenido según la acción activa.
- Las confirmaciones de eliminación se muestran en el panel, sin diálogos externos.

## 2. Estructura

```text
ModelsPage
  |
  |-- InventoryPageHeader
  |-- DataTable
  |     |-- ModelsToolbar
  |     |-- filtros y ordenación TanStack
  |     `-- paginación local
  |
  `-- ModelSidePanel
        |-- detalle del modelo
        |-- formulario de modelo
        |-- formulario de identificador
        |-- confirmación de eliminación de modelo
        `-- confirmación de eliminación de identificador
```

Los componentes principales son:

- `src/features/inventory/models/page/ModesPage.tsx`: consultas, estado, filtros, tabla y mutaciones.
- `src/features/inventory/models/components/ModelSidePanel.tsx`: contenido y variantes del panel.
- `src/features/inventory/models/api/modelsApi.ts`: consultas, mutaciones y tags de RTK Query.
- `src/components/data-table/data-table.tsx`: tabla reutilizable y API del toolbar.

## 3. Carga y almacenamiento del catálogo

El catálogo se solicita mediante `useGetModelCatalogQuery`:

```text
GET telecomunication-model/models/all
```

El endpoint devuelve directamente:

```ts
TelecommunicationItemModelResponse[]
```

No se envían parámetros de búsqueda, filtro, ordenación o paginación. La respuesta permanece en la caché Redux administrada por `modelsApi`; no existe un slice duplicado para almacenar los modelos.

Los proveedores se obtienen mediante:

```text
GET /provider?page=0&size=100&sort=name,asc
```

Los identificadores se consultan únicamente cuando existe un modelo seleccionado:

```text
GET /telecommunication-item-model-identifier/model/{modelId}
```

La consulta usa `skip` mientras `selectedModelId` sea `null`.

## 4. Tabla y filtros locales

`DataTable` expone las siguientes capacidades reutilizables:

```ts
renderToolbar?: (table) => ReactNode
initialSorting?: SortingState
pageSizeOptions?: number[]
```

También registra `globalFilteringFeature`, filtrado por columnas, ordenación y paginación de TanStack Table.

`ModelsToolbar` conecta directamente sus controles con la instancia de tabla:

- búsqueda global por nombre y descripción;
- proveedor;
- tipo de modelo: todos, específicos o genéricos;
- estado: todos, activos o inactivos;
- orden: recientes, antiguos, nombre A-Z o nombre Z-A;
- limpieza de filtros;
- apertura del formulario de nuevo modelo.

Cada cambio de filtro u ordenación vuelve a la primera página. Estas acciones no realizan peticiones HTTP.

La tabla comienza ordenada por `createdDate` descendente y permite 5, 10, 20 o 50 filas por página.

### Columnas

| Columna         | Contenido                               |
| --------------- | --------------------------------------- |
| Modelo          | imagen local, nombre y descripción      |
| Proveedor       | badge con estilo por proveedor          |
| Tipo de modelo  | Específico o Genérico                   |
| Identificadores | cantidad con singular/plural            |
| Estado de uso   | badge Activo/Inactivo                   |
| Creado          | fecha de creación formateada en `es-ES` |
| Acceso          | flecha que indica apertura del detalle  |

`updatedDate` no se muestra en la tabla. Como el backend no proporciona una URL de imagen, todas las filas usan temporalmente `src/assets/hgu_wifi_5_f.png`.

## 5. Estado de navegación del panel

`SidePanelMode` define todas las vistas posibles:

```ts
type SidePanelMode =
  | "CLOSED"
  | "DETAIL"
  | "CREATE_MODEL"
  | "EDIT_MODEL"
  | "CREATE_IDENTIFIER"
  | "EDIT_IDENTIFIER"
  | "CONFIRM_MODEL_DELETE"
  | "CONFIRM_IDENTIFIER_DELETE"
```

La página mantiene además:

```ts
selectedModelId: number | null
editingIdentifier: TelecommunicationItemModelIdentifierResponse | null
identifierToDelete: TelecommunicationItemModelIdentifierResponse | null
panelError: string | null
```

Flujo principal:

```text
seleccionar fila -> DETAIL
Nuevo modelo -> CREATE_MODEL
DETAIL / Editar -> EDIT_MODEL
DETAIL / Nuevo identificador -> CREATE_IDENTIFIER
identificador / Editar -> EDIT_IDENTIFIER
DETAIL / Eliminar -> CONFIRM_MODEL_DELETE
identificador / Eliminar -> CONFIRM_IDENTIFIER_DELETE
cerrar panel -> CLOSED y limpiar selección
```

Cambiar de vista no reinicia los filtros ni la página de la tabla.

## 6. Layout responsive

En escritorio, desde `1024px`, la vista usa dos columnas cuando el panel está abierto:

```text
minmax(0, 1fr) | clamp(22rem, 30vw, 28rem)
tabla            panel fijo a la derecha
```

El panel es `sticky`, tiene desplazamiento interno y no bloquea la tabla.

En móvil y tablet, el mismo contenido se renderiza dentro de un `Sheet` anclado a la derecha. Cerrar el `Sheet` ejecuta el mismo flujo de limpieza que el botón de cierre del panel de escritorio.

## 7. Detalle del modelo

`DETAIL` muestra:

- imagen, nombre y tipo;
- descripción;
- proveedor;
- cantidad de identificadores;
- estado;
- fecha de creación;
- fecha de última actualización;
- identificadores asociados.

Las acciones disponibles son:

- `Nuevo identificador`;
- `Editar`;
- `Eliminar`.

La eliminación solo se habilita cuando `editable` y `deletable` son verdaderos.

Los identificadores se representan con `Item`. Si `mutable` es falso, sus acciones de edición y eliminación permanecen deshabilitadas y se muestra un indicador informativo.

## 8. Creación y edición de modelos

### Creación

`CREATE_MODEL` solicita nombre, tipo, proveedor, descripción y estado. El estado se controla con `Switch` y comienza activo.

```text
POST /telecomunication-model/
```

Tras el éxito se invalida el tag de lista, se muestra una notificación y se cierra el panel.

### Edición completa

Si `model.editable` es verdadero, todos los campos permanecen habilitados:

```text
PUT /telecomunication-model/model/{id}
```

### Edición parcial

Si `model.editable` es falso, nombre, tipo y proveedor quedan bloqueados. Solo se envían descripción y estado:

```text
PUT /telecomunication-model/model/parcial/{id}
```

Después de una actualización correcta, el panel vuelve a `DETAIL` y RTK Query refresca el catálogo mediante invalidación de tags.

## 9. Gestión de identificadores

Los identificadores pertenecen al modelo seleccionado. La relación con el proveedor se hereda del modelo; las peticiones de identificadores no envían `providerId`.

La longitud exacta del código depende del tipo:

```text
SPECIFIC -> 12 caracteres
GENERIC  -> 32 caracteres
```

El formulario usa `Switch` para el estado.

### Creación

```text
POST /telecommunication-item-model-identifier/
```

Al completarse, se limpia el formulario, el panel permanece en `CREATE_IDENTIFIER` y se actualiza la lista asociada.

### Edición

Solo está disponible cuando `mutable` es verdadero:

```text
PUT /telecommunication-item-model-identifier/{id}
```

Después del éxito, el panel vuelve a `DETAIL`.

### Eliminación

Solo está disponible cuando `mutable` es verdadero. La acción abre `CONFIRM_IDENTIFIER_DELETE` dentro del mismo panel:

```text
DELETE /telecommunication-item-model-identifier/{id}
```

Después del éxito, el panel vuelve al detalle y la lista se actualiza por invalidación de tags.

## 10. Eliminación de modelos

La acción cambia el panel a `CONFIRM_MODEL_DELETE`; no elimina inmediatamente ni abre un diálogo separado.

Al confirmar:

```text
DELETE /telecomunication-model/{id}
```

Después del éxito se limpia la selección, se cierra el panel y se refresca el catálogo.

Si el backend rechaza la operación, la confirmación permanece abierta y muestra el error.

## 11. Errores y confirmaciones

- Los errores de formulario y backend se muestran dentro del panel.
- `NotificationsProvider` comunica globalmente los éxitos y fallos de mutaciones.
- Los botones permanecen deshabilitados mientras una mutación está en curso.
- La tabla muestra estados de carga, error y catálogo sin coincidencias.

## 12. Invalidación de caché

- Las mutaciones de modelo invalidan `Model/LIST` y, cuando corresponde, el tag del modelo.
- Las mutaciones de identificador invalidan su tag, `Identifier/LIST-{modelId}` y `Model/LIST`.
- La invalidación actualiza automáticamente la tabla, el detalle y el contador de identificadores sin recargar la página.

## 13. Resumen de ejecución

```text
1. RTK Query carga catálogo y proveedores en Redux.
2. TanStack procesa búsqueda, filtros, ordenación y paginación en memoria.
3. Una fila seleccionada abre DETAIL y activa la consulta de identificadores.
4. El panel sustituye su contenido según SidePanelMode.
5. Switch gestiona estados e Item representa identificadores.
6. Las mutaciones invalidan tags y sincronizan la interfaz.
7. Cerrar el panel limpia la selección sin alterar los filtros de tabla.
```
