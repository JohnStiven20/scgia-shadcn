# Flujo de trazabilidad

Este documento describe cómo se cargan, filtran, transforman y renderizan los movimientos de trazabilidad del inventario, así como la presentación responsive del detalle.

## 1. Recorrido general

```text
TraceabilityPage
  -> filtros draft/aplicados
  -> buildFilterRequest
  -> useSearchTraceabilityEventsQuery
  -> currentData.content
  -> events
  -> TraceabilityGroupsGrid(groups={events})
  -> groups.map(...)
  -> TraceabilityEventCard
  -> MovementRecord
```

Al seleccionar una fila:

```text
MovementRecord.onSelect
  -> TraceabilityEventCard
  -> TraceabilityGroupsGrid.onSelectGroup
  -> TraceabilityPage.selectEvent
  -> selectedEventId
  -> events.find(...)
  -> TraceabilityEventDetailPanel
```

## 2. Página y estado

El flujo empieza en `src/features/inventory/traceability/page/TraceabilityPage.tsx`.

La página mantiene:

```ts
const [draftFilters, setDraftFilters] = useState<TraceabilityFilters>(...);
const [appliedFilters, setAppliedFilters] = useState<TraceabilityFilters>(...);
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
```

`draftFilters` contiene lo que el usuario está editando. `appliedFilters` contiene los valores que se envían al backend. Esta separación evita lanzar una consulta por cada pulsación.

El evento seleccionado se guarda por ID y se recupera desde la página actual:

```ts
const selectedEvent =
  events.find((event) => event.id === selectedEventId) ?? null;
```

Cuando se aplican filtros, se limpian filtros, se cambia de página o se cambia el tamaño de página, también se limpia `selectedEventId`.

## 3. Construcción de la petición

La petición se memoriza con `useMemo`:

```ts
const searchRequest = useMemo<TraceabilitySearchRequest>(
  () => ({
    pageNumber: page,
    pageSize,
    sortBy: "movementDate",
    sortOrder: "DESC",
    object: buildFilterRequest(appliedFilters),
  }),
  [appliedFilters, page, pageSize],
);
```

`buildFilterRequest` vive en `src/features/inventory/traceability/utils/traceabilityFormatters.ts` y realiza estas conversiones:

- fechas `YYYY-MM-DD` a intervalos UTC;
- inicio del día a `00:00:00Z`;
- final del día a `23:59:59Z`;
- limpieza de espacios en filtros de texto;
- conversión de textos vacíos a `undefined`;
- aplicación de fechas predeterminadas.

## 4. Consulta API

La consulta está definida en `src/features/inventory/traceability/api/traceabilityApi.ts`:

```text
POST /movement-transaction/inventory-entry-events
```

El hook RTK Query devuelve `currentData`, `isLoading`, `isFetching`, `isError` y `refetch`.

La página normaliza la respuesta así:

```ts
const events = currentData?.content ?? [];
```

La respuesta completa es un `TraceabilityPageResponse`, pero la tabla solo recibe `content`, que es un array de `MovementTransaction`.

## 5. Estructura de los datos

`MovementTransaction` se define en `src/features/inventory/traceability/types.ts`:

```ts
interface MovementTransaction {
  id: number;
  performedByAccountUsername: string | null;
  toAccountUsername: string | null;
  fromAccountUsername: string | null;
  fromWarehouseName: string | null;
  inventoryMovementType: InventoryMovementType;
  movementDate: string;
  specificItemCount: number;
  genericQuantity: number;
  warehouseName: string | null;
  modelNames: string[];
  eventImages: TraceabilityImage[];
  detailsMovements: MovementResourceGroup[];
}
```

Los datos de la fila están en la parte superior del evento. `detailsMovements` se reserva para el panel de detalle.

La estructura profunda es:

```text
MovementTransaction
  -> detailsMovements[]
    -> MovementResourceGroup.models[]
      -> MovementModelGroup.identifierGroups[]
        -> MovementIdentifierGroup.movements[]
          -> TelecommunicationMovement.images[]
```

## 6. Iteración de la tabla

El componente es `src/features/inventory/traceability/components/TraceabilityGroupsGrid.tsx`.

Recibe la lista y la recorre en el `TableBody`:

```tsx
{groups.map((group) => (
  <TraceabilityEventCard
    key={group.id}
    event={group}
    selected={selectedGroupId === group.id}
    onSelect={() => onSelectGroup(group)}
  />
))}
```

El recorrido completo es:

1. `currentData.content` se asigna a `events`.
2. `events` se pasa como `groups`.
3. `groups.map` procesa un `MovementTransaction` por iteración.
4. Cada evento crea un `TraceabilityEventCard`.
5. La tarjeta transforma los datos y crea un `MovementRecord`.
6. `MovementRecord` pinta las cinco columnas visuales.

La tabla actual es una tabla MUI tradicional (`Table`, `TableHead`, `TableBody`, `TableRow`), con ancho mínimo de 960 px y desplazamiento horizontal en su `TableContainer`.

## 7. Transformación de cada evento

El componente `src/features/inventory/traceability/components/TraceabilityEventCard.tsx` adapta los datos:

```tsx
const { date, time } = formatEventDate(event.movementDate);

const counterpart = event.toAccountUsername
  ? { label: "Asignado a", value: event.toAccountUsername }
  : event.fromAccountUsername
    ? { label: "Origen", value: event.fromAccountUsername }
    : undefined;

<MovementRecord
  type={event.inventoryMovementType}
  date={date}
  time={time}
  responsible={event.performedByAccountUsername ?? "Sin responsable"}
  counterpart={counterpart}
  warehouse={event.warehouseName ?? "Sin almacén"}
  content={formatContentSummary(event.specificItemCount, event.genericQuantity)}
  model={getModelSummary(event.modelNames)}
  selected={selected}
  onSelect={onSelect}
  />
```

Reglas principales:

- la fecha se divide en fecha y hora;
- `toAccountUsername` tiene prioridad sobre `fromAccountUsername`;
- los valores nulos reciben textos de respaldo;
- `formatContentSummary` combina específicos y genéricos;
- `getModelSummary` separa el modelo principal, los adicionales y la lista completa.

`MovementRecord` organiza la salida en:

| Columna | Datos |
| --- | --- |
| Evento | tipo de movimiento, fecha y hora |
| Responsable / Asignado a | responsable y destino/origen |
| Almacén | nombre del almacén |
| Contenido | cantidad de elementos |
| Modelos | modelo principal y adicionales |

## 8. Selección y detalle

La selección alterna el evento actual:

```ts
const selectEvent = (event: MovementTransaction) => {
  setSelectedEventId((current) =>
    current === event.id ? null : event.id,
  );
};
```

La página pasa el evento al panel:

```tsx
<TraceabilityEventDetailPanel
  event={selectedEvent}
  open={selectedEvent !== null}
  onClose={() => setSelectedEventId(null)}
/>
```

`MovementEventDetails.tsx` vuelve a separar los recursos:

```ts
const specificGroups = event.detailsMovements.filter(
  (group) => group.resourceType === "SPECIFIC",
);

const genericGroups = event.detailsMovements.filter(
  (group) => group.resourceType === "GENERIC",
);
```

El panel muestra:

```text
EventDetailContent
  -> resumen del evento
  -> EventImagesSection
  -> SpecificProductsSection
       -> SpecificModelCard
            -> identificadores, unidades e imágenes
  -> GenericProductsSection
       -> GenericModelCard
            -> cantidades, stock e imágenes
```

## 9. Comportamiento según el ancho

La decisión se realiza con:

```ts
const desktop = useMediaQuery(theme.breakpoints.up("lg"));
```

### Escritorio

Desde `lg`, `TraceabilityPage` utiliza un `Stack` horizontal. La tabla ocupa el espacio flexible y el detalle se renderiza como un `Paper` lateral:

```tsx
<Paper
  component="aside"
  sx={{
    position: "sticky",
    top: 16,
    width: 420,
    height: "calc(100vh - 100px)",
    minHeight: 560,
    maxHeight: 900,
  }}
>
  {content}
</Paper>
```

El contenido del panel tiene `overflowY: "auto"`, por lo que el scroll del detalle es independiente del scroll de la página.

### Móvil y tablet

Por debajo de `lg`, el detalle se muestra con un `Drawer` anclado a la derecha:

```tsx
<Drawer anchor="right" open={open} onClose={onClose}>
  {content}
</Drawer>
```

El ancho es `100%` en móvil pequeño y `410px` desde `sm`. La tabla permanece en el flujo principal y el detalle aparece como panel emergente por encima del contenido.

## 10. Estados de carga y error

- `isLoading` sin filas: se muestran filas `Skeleton`.
- `isFetching` con filas: se mantiene la tabla y se muestra `LinearProgress`.
- lista vacía: `EmptyState` muestra “No hay movimientos”.
- `isError`: la página muestra un `Alert` con el botón `Reintentar`.

## 11. Paginación

La paginación es del servidor, no local. `TraceabilityTableFooter` recibe `page`, `rowsPerPage`, `totalElements` y `totalPages` de la respuesta.

Al cambiar de página:

1. cambia `page`;
2. RTK Query genera una nueva consulta;
3. cambia `currentData.content`;
4. se actualiza `events`;
5. se vuelve a recorrer la tabla;
6. se limpia el evento seleccionado.

## 12. Responsabilidades por componente

| Componente | Responsabilidad |
| --- | --- |
| `TraceabilityPage` | estado, filtros, consulta, paginación y selección |
| `TraceabilityFiltersPanel` | edición y aplicación de filtros |
| `traceabilityApi` | petición HTTP con RTK Query |
| `traceabilityFormatters` | fechas, filtros, contenido y modelos |
| `TraceabilityGroupsGrid` | tabla, iteración, carga y estado vacío |
| `TraceabilityEventCard` | adaptación de un evento a una fila |
| `MovementRecord` | presentación visual de la fila |
| `TraceabilityTableFooter` | paginación y tamaño de página |
| `TraceabilityEventDetailPanel` | contenedor responsive del detalle |
| `SpecificProductsSection` | productos específicos e identificadores |
| `GenericProductsSection` | productos genéricos, cantidades y stock |
| `AsyncImage` | carga de imágenes |

## Conclusión

`events` se obtiene de `currentData.content` y se pasa directamente a `TraceabilityGroupsGrid` como `groups`. Los grupos no se vuelven a solicitar ni se agrupan en otro nivel antes de la tabla: cada `MovementTransaction` representa una fila. La transformación visual se realiza en `TraceabilityEventCard` y `MovementRecord`.

La agrupación detallada de recursos ocurre después, dentro del panel seleccionado, donde `detailsMovements` se divide en recursos específicos y genéricos y se recorren modelos, identificadores, movimientos e imágenes.

