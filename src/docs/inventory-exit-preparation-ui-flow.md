# Salida de inventario: preparación mediante escáner

Este documento describe la implementación de `OutPage`, disponible en
`/inventory/out`. La primera versión incorpora productos exclusivamente
mediante escáner y mantiene la preparación en memoria hasta registrar la
salida.

## Flujo general

```text
Seleccionar proveedor
  -> escanear código
  -> POST /identification con operationType: EXIT
  -> validar motivo obligatorio
  -> añadir al borrador local
  -> POST /telecommunication-item/exit
```

El selector de proveedor es obligatorio. Mientras no haya un proveedor se
muestra `Escáner desactivado`; durante la petición se muestra `Identificando` y
cuando está preparado se muestra `Escáner listo`.

No hay selección manual de categorías, modelos o unidades en este alcance.

## Captura e identificación

`OutPage` reutiliza `useInventoryScanner`, que escucha lecturas finalizadas con
Enter o Tab. Cada código se envía una sola vez:

```ts
identifyProduct({
  operationType: "EXIT",
  providerId,
  rawCode,
})
```

Un cierre síncrono impide nuevas lecturas mientras:

- se está identificando un producto;
- permanece abierto el diálogo de motivo;
- se está registrando la salida.

Los errores de identificación y registro se muestran mediante
`useGlobalError`. La preparación no se modifica cuando una petición falla.

## Validación del resultado

### Productos específicos

Un resultado `SPECIFIC` solo puede continuar si:

- contiene `telecommunicationItemId`;
- su estado es `AVAILABLE`;
- contiene `uniqueCode` y `uniqueCodeType`;
- la unidad no está ya presente en el borrador.

Cada unidad permanece como un registro individual porque tiene su propio motivo
de salida.

### Productos genéricos

Un resultado `GENERIC` requiere `telecommunicationGenericItemId`. Cada lectura
representa inicialmente una unidad.

Las lecturas se fusionan únicamente cuando coinciden:

```text
telecommunicationGenericItemId + identifierId + motivo
```

Por tanto, dos lecturas del mismo producto con motivos distintos permanecen en
líneas separadas. Si el catálogo informa `availableQuantity`, el total preparado
para ese inventario no puede superarlo; si no lo informa, el backend realiza la
validación definitiva.

## Motivo obligatorio

Después de una identificación válida se abre el diálogo **Completar salida**.
Este muestra el modelo, el identificador, el código único cuando existe y el
estado disponible.

El producto solo se añade al borrador al confirmar un motivo no vacío. Cancelar
el diálogo descarta esa lectura sin modificar la preparación.

## Modelo local

`ExitDraftItem` es una unión discriminada:

```ts
type ExitDraftItem = ExitSpecificDraftItem | ExitConsumableDraftItem
```

Ambas variantes conservan los identificadores de backend necesarios para el
registro. Los específicos guardan `telecommunicationsItemId`; los genéricos
guardan `telecommunicationGenericId`, `identifierId`, `quantity` y
`availableQuantity`.

## Representación visual

`ExitDraftList` utiliza acordeones abiertos inicialmente y representa primero
los productos específicos y después los genéricos.

- Los específicos se agrupan por modelo e identificador, pero cada unidad y su
  motivo se muestran y eliminan individualmente.
- Los genéricos se agrupan visualmente por modelo y conservan líneas separadas
  por identificador y motivo.
- Los genéricos ofrecen controles `−`, cantidad, `+` y eliminación completa.
- La cantidad mínima es una unidad y se respeta el máximo disponible cuando el
  backend lo proporciona.

La vista usa componentes Shadcn y clases compactas de Tailwind. El selector y
las acciones se apilan en móvil y comparten una fila desde `sm`.

## Registro definitivo

El borrador se transforma en `ExitTelecommunicationsItemsRequest`:

```ts
{
  specificItems: [
    { telecommunicationsItemId, remarks }
  ],
  genericItems: [
    { telecommunicationGenericId, identifierId, quantity, remarks }
  ]
}
```

`useRegisterExitMutation` envía el payload a:

```http
POST /telecommunication-item/exit
```

La preparación se limpia únicamente después de una respuesta correcta. Si el
registro falla, permanece intacta para permitir un nuevo intento.

## Protección de cambios pendientes

- Cambiar de proveedor con elementos preparados requiere confirmación y limpia
  el borrador antes de aplicar el nuevo proveedor.
- **Limpiar área** solo está habilitado cuando existen elementos y requiere
  confirmación.
- `useBlocker` avisa antes de una navegación interna.
- `beforeunload` muestra el aviso nativo al cerrar o recargar la página.

No se implementan todavía selección manual, asignaciones ni retornos.
