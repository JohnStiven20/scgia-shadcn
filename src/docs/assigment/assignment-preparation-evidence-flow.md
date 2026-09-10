# Asignaciones mediante escáner y evidencias

Este documento describe el flujo implementado en `/inventory/assignment`.

## Requisitos iniciales

La pantalla carga en paralelo:

- trabajadores asignables con `GET /account/assignable-workers`;
- proveedores activos con `GET /provider`.

El escáner solo se conecta cuando existen un trabajador y un proveedor
seleccionados. No hay selección manual, categorías ni búsqueda de modelos.

## Identificación

Cada lectura se resuelve exclusivamente mediante:

```http
POST /identification
```

```json
{
  "operationType": "ASSIGNMENT",
  "providerId": 1,
  "rawCode": "codigo-escaneado"
}
```

Las lecturas quedan bloqueadas mientras existe una identificación o un registro
en curso.

### Productos específicos

Una respuesta `SPECIFIC` solo se añade cuando incluye
`telecommunicationItemId`, código único y tipo de código, y su estado es
`AVAILABLE`. Una unidad que ya exista en la preparación se rechaza como
duplicada.

### Productos genéricos

Una respuesta `GENERIC` debe incluir `telecommunicationGenericItemId`. La
cantidad inicial es `result.quantity ?? 1`; nuevas lecturas del mismo inventario
incrementan esa línea.

Solo puede existir una línea por `telecommunicationGenericItemId`. Si el mismo
inventario llega asociado a otro `identifierId`, la lectura se rechaza para
mantener el contrato multipart del backend.

## Preparación local

El borrador vive en memoria e incluye:

```ts
interface AssignmentDraft {
  worker: WorkerOption | null
  notes: string
  specificProducts: AssignmentSpecificProductDraft[]
  consumables: AssignmentConsumableDraft[]
  generalEvidence: LocalEvidence[]
}
```

Los productos se muestran en acordeones abiertos inicialmente. Los específicos
aparecen antes que los genéricos. Las unidades específicas se eliminan una a
una y los genéricos permiten cambiar su cantidad con un mínimo de una unidad.

La nota es general, opcional y se envía en la propiedad `notes`.

## Evidencias

Se pueden seleccionar varias imágenes en tres niveles:

- generales de la asignación;
- por unidad específica;
- por línea genérica.

Cada archivo obtiene una previsualización con `URL.createObjectURL`. La URL se
revoca al quitar la imagen, limpiar, cambiar de trabajador o proveedor,
registrar correctamente o desmontar la página.

El frontend no se conecta a Cloudinary. Los archivos se entregan al backend
como `multipart/form-data` y toda persistencia posterior pertenece al backend.

## Registro multipart

El registro definitivo usa:

```http
POST /telecommunication-item/assignment
```

La parte `request` contiene JSON con esta forma:

```json
{
  "accountId": 14,
  "notes": "Entrega para instalación",
  "imageKeys": ["assignment-movement-0"],
  "generalItems": [
    {
      "telecommunicationGenericItemId": 8,
      "quantity": 2,
      "identifierId": 31,
      "imageKeys": ["assignment-generic-8-0"]
    }
  ],
  "specialItems": [
    {
      "telecommunicationItemId": 25,
      "imageKeys": ["assignment-specific-25-0"]
    }
  ]
}
```

Los archivos usan exactamente las claves declaradas en el JSON:

```text
assignment-movement-{index}
assignment-specific-{telecommunicationItemId}-{index}
assignment-generic-{telecommunicationGenericItemId}-{index}
```

El borrador solo se limpia después de una respuesta correcta. Si el backend
rechaza la operación, productos, nota e imágenes permanecen disponibles.

## Protección de datos pendientes

La pantalla solicita confirmación al limpiar o cambiar trabajador/proveedor si
hay productos, nota o imágenes. También protege la navegación interna mediante
`useBlocker` y el cierre o recarga mediante `beforeunload`.
