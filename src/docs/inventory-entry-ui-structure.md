# Estructura de los elementos que pinta el Área de Preparación

Este documento describe la estructura de datos temporal y la composición visual
que utiliza `EntryDraftList` para mostrar productos específicos y genéricos en
`EntryPage`.

## 1. Entrada de datos de la UI

`EntryPage` mantiene dos colecciones independientes y las pasa a
`EntryDraftList`:

```tsx
<EntryDraftList
  productItems={pendingProductItems}
  genericItems={pendingProductGenerics}
  onRemoveProduct={...}
  onRemoveGeneric={...}
  onChangeGenericQuantity={...}
/>
```

```text
pendingProductItems     -> dispositivos específicos
pendingProductGenerics   -> dispositivos genéricos/consumibles
```

Ambas colecciones representan una preparación temporal. No son todavía el
payload definitivo enviado al servicio de registro.

## 2. Elemento específico

Cada dispositivo específico representa una unidad física individual (por
ejemplo, una serie, IMEI o MAC).

### 2.1. Estructura del registro

```ts
interface SpecificEntryDraftItem {
  id: string;
  providerId: number | null;
  modelId: number | null;
  identifierId: number | null;
  telecommunicationItemId: number | null;
  model: string;
  modelIdentifier: string;
  provider: string;
  uniqueCode: string;
  uniqueCodeType: string;
}
```

Campos utilizados visualmente:

- `model`: nombre del modelo.
- `modelIdentifier`: identificador asociado al modelo.
- `uniqueCodeType`: tipo de identificador único.
- `uniqueCode`: valor de la unidad escaneada.
- `id`: clave temporal para eliminar la unidad concreta.

Los identificadores internos (`providerId`, `modelId`, `identifierId` y
`telecommunicationItemId`) se conservan para el payload, aunque no todos se
muestren en pantalla.

### 2.2. Agrupación de específicos

`EntryDraftList` realiza dos niveles de agrupación mediante `Map`:

```text
productItems
  -> agrupar por model
       -> agrupar por modelIdentifier
            -> units: SpecificEntryDraftItem[]
```

La estructura resultante es:

```ts
interface SpecificModelGroup {
  model: string;
  provider: string;
  identifiers: SpecificIdentifierGroup[];
  total: number;
}

interface SpecificIdentifierGroup {
  identifier: string;
  units: SpecificEntryDraftItem[];
}
```

`total` se incrementa en una unidad por cada dispositivo específico, no por
cada grupo de identificador.

Ejemplo:

```text
Modelo HGU WIFI 5 (total: 3)
  Identificador: MAC
    - MAC: AA:01
    - MAC: AA:02
  Identificador: SERIAL
    - SERIAL: HG-003
```

### 2.3. Renderizado visual

Cada `SpecificModelGroup` se pinta mediante `SpecificModelSection`, un
`Accordion` expandido por defecto:

```text
┌──────────────────────────────────────────────────────┐
│ Imagen del modelo │ Nombre del modelo │ 3 unidades ▼ │
├──────────────────────────────────────────────────────┤
│ Identificador asociado al modelo: MAC   2 unidades   │
│ [ memoria  MAC: AA:01  eliminar ]                   │
│ [ memoria  MAC: AA:02  eliminar ]                   │
│─────────────────────────────────────────────────────│
│ Identificador asociado al modelo: SERIAL 1 unidad    │
│ [ memoria SERIAL: HG-003 eliminar ]                 │
└──────────────────────────────────────────────────────┘
```

La cabecera contiene:

- imagen `hgu_wifi_5_f.png` mediante `ModelVisual`;
- nombre del modelo;
- total de unidades (`QuantityText`);
- control de expansión (`ExpandMoreRounded`).

El detalle contiene un bloque por cada `modelIdentifier`. Cada unidad se
representa como una etiqueta horizontal con:

- icono `MemoryOutlined`;
- tipo y valor (`uniqueCodeType: uniqueCode`);
- botón de eliminación individual.

Al pulsar eliminar, se ejecuta `onRemoveProduct(unit.id)` y solo desaparece esa
unidad del array temporal.

## 3. Elemento genérico

Los dispositivos genéricos no representan necesariamente una unidad física
individual. Se agrupan y se muestran mediante cantidades.

### 3.1. Estructura del registro

```ts
interface GenericEntryDraftItem {
  id: string;
  providerId: number | null;
  modelId: number | null;
  identifierId: number | null;
  telecommunicationGenericItemId: number | null;
  model: string;
  provider: string;
  identifier: string;
  identifierType: string;
  quantity: number;
}
```

Campos utilizados visualmente:

- `model`: nombre del modelo genérico.
- `identifierType`: tipo del código asociado.
- `identifier`: valor del código.
- `quantity`: unidades acumuladas.
- `id`: clave temporal para modificar o eliminar la línea.

### 3.2. Agrupación de genéricos

Los genéricos se agrupan por `model`. Dentro de cada grupo se conservan sus
líneas de identificador y el total se calcula sumando cantidades:

```text
genericItems
  -> agrupar por model
       -> identifiers: GenericEntryDraftItem[]
       -> total = suma de item.quantity
```

La estructura resultante es:

```ts
interface GenericModelGroup {
  model: string;
  provider: string;
  identifiers: GenericEntryDraftItem[];
  total: number;
}
```

Ejemplo:

```text
Modelo Cable UTP (total: 7)
  EAN       8412345678901     5 unidades
  CÓDIGO    CABLE-01          2 unidades
```

Si se escanea de nuevo el mismo producto genérico, `EntryPage` incrementa la
cantidad de la línea existente. Si el modelo e identificador no existen, crea
una línea nueva con `quantity: 1`.

### 3.3. Renderizado visual

Cada `GenericModelGroup` se pinta mediante `GenericModelSection`, también como
un `Accordion` expandido por defecto:

```text
┌──────────────────────────────────────────────────────┐
│ Icono modelo │ Nombre del modelo       │ 7 unidades ▼ │
├──────────────────────────────────────────────────────┤
│ EAN 8412345678901   [−] 5 unidades [+] [eliminar]     │
│ CÓDIGO CABLE-01     [−] 2 unidades [+] [eliminar]     │
└──────────────────────────────────────────────────────┘
```

La cabecera contiene:

- icono `IconCableUTPCat6` mediante `ModelVisual generic`;
- nombre del modelo;
- suma total de unidades;
- control de expansión.

Cada línea del detalle contiene:

- tipo de identificador;
- código asociado;
- botón `RemoveRounded` para reducir una unidad;
- cantidad actual;
- botón `AddRounded` para aumentar una unidad;
- botón `DeleteOutlineRounded` para eliminar la línea completa.

Los botones `−` y `+` llaman a:

```ts
onChangeGenericQuantity(item.id, nextQuantity)
```

La cantidad mínima permitida es `1`. El botón de reducción se deshabilita cuando
la línea ya tiene una unidad.

## 4. Orden y separación de los grupos

`EntryDraftList` pinta primero todos los grupos específicos y después todos los
grupos genéricos:

```tsx
<Stack divider={<Divider flexItem />}>
  {groupedProducts.map((group) => (
    <SpecificModelSection key={`specific-${group.model}`} ... />
  ))}

  {groupedGenerics.map((group) => (
    <GenericModelSection key={`generic-${group.model}`} ... />
  ))}
</Stack>
```

Cada grupo está separado por un `Divider`. El modelo se identifica con una clave
compuesta (`specific-` o `generic-`) y su nombre, evitando mezclar visualmente
un modelo específico con uno genérico.

## 5. Acciones disponibles en pantalla

| Tipo | Acción | Resultado en memoria |
| --- | --- | --- |
| Específico | Eliminar unidad | Quita un `SpecificEntryDraftItem` por `id` |
| Genérico | Reducir cantidad | Disminuye `quantity`, sin bajar de `1` |
| Genérico | Aumentar cantidad | Incrementa `quantity` en `1` |
| Genérico | Eliminar línea | Quita un `GenericEntryDraftItem` completo |
| Preparación | Limpiar | Vacía las colecciones temporales |
| Preparación | Registrar entrada | Convierte ambas colecciones en payload y persiste |

## 6. Relación con el payload final

La UI conserva datos visuales y datos internos. Antes del registro,
`buildRegisterEntryPayload` valida que cada elemento tenga modelo e identificador
y transforma las colecciones a la estructura requerida por el backend.

```text
SpecificEntryDraftItem[]
  -> líneas individuales de unidades específicas

GenericEntryDraftItem[]
  -> líneas agrupadas con quantity
```

La agrupación visual no debe eliminar los identificadores internos necesarios
para construir el payload definitivo.
