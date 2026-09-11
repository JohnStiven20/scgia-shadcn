# Flujo manual del área de preparación de retornos

La ruta `/inventory/return` permite devolver productos previamente asignados.
El flujo es manual: no utiliza proveedor, escáner ni `POST /identification`.

## Secuencia

```text
Trabajador → Asignación → Categoría → Modelo → Elementos → Preparación → Registrar retorno
```

1. La pantalla carga los trabajadores mediante
   `GET /account/assignable-workers`.
2. Al elegir un trabajador consulta
   `GET /assignments/account/{accountId}`.
3. Las asignaciones se muestran como tarjetas dentro de un contenedor con
   desplazamiento vertical.
4. Al elegir una tarjeta, las demás se ocultan y se consulta
   `GET /assignments/{assignmentId}`.
5. La acción **Cambiar asignación** vuelve a mostrar la lista y oculta todos los
   pasos posteriores.
6. El usuario elige entre **Productos** y **Consumibles**, selecciona un modelo
   y prepara sus elementos desde un `DataTable`.

## Selección temporal

La tabla no modifica inmediatamente el área de preparación. La selección queda
en un estado temporal y se confirma con **Agregar productos** o
**Agregar consumibles**.

### Productos específicos

La tabla muestra identificador, código único, tipo y estado. Solo las unidades
en estado `ASSIGNED` pueden seleccionarse. Las unidades que ya están preparadas
aparecen deshabilitadas y no pueden duplicarse.

### Consumibles genéricos

La tabla muestra el identificador, la cantidad asignada y controles para elegir
una cantidad. El máximo temporal es la cantidad asignada menos la cantidad que
ya existe en la preparación.

El cliente conserva una sola línea por inventario genérico para mantener la
resolución de imágenes del contrato multipart.

## Borrador y evidencias

El área de preparación permanece visible aunque esté vacía. Cuando contiene
elementos, agrupa primero los específicos y después los genéricos. Cada unidad
o línea puede incluir varias imágenes mediante
`<input type="file" accept="image/*" multiple>`.

Las previsualizaciones usan `URL.createObjectURL`. Las URLs se revocan al quitar
una imagen o elemento, limpiar, cambiar trabajador o asignación, registrar
correctamente o desmontar la página.

No se realiza ninguna llamada directa a Cloudinary desde el frontend.

## Registro

El retorno se envía mediante multipart a:

```http
POST /telecommunication-item/return
```

La parte JSON utiliza la ortografía real del backend:

```json
{
  "assigmentId": 12,
  "imageKeys": [],
  "specificItems": [
    {
      "assignmentTelecommunicationItemId": 41,
      "telecommunicationItemId": 25,
      "imageKeys": ["return-specific-25-0"]
    }
  ],
  "genericItems": [
    {
      "assignmentTelecommunicationGenericItemId": 62,
      "telecommunicationGenericItemId": 8,
      "quantity": 2,
      "imageKeys": ["return-generic-8-0"]
    }
  ]
}
```

Cada clave declarada en `imageKeys` existe como una parte del `FormData`. La
petición dispone de 120 segundos por el procesamiento de imágenes.

Tras una respuesta correcta se limpia el borrador, se deselecciona la
asignación y se recarga la lista. Si falla, se conserva toda la preparación.

## Protección y presentación

- Cambiar de trabajador o asignación con elementos preparados exige
  confirmación.
- `useBlocker` protege la navegación interna y `beforeunload` protege recargas o
  cierre de pestaña.
- `Stepper` representa la progresión controlada del flujo. Solo se incorporan
  los pasos cuyo requisito anterior ya se ha completado.
- `Collapsible` alterna la lista y el resumen de la asignación, y también la
  lista de modelos y el modelo seleccionado. Al pulsar **Cambiar**, el contenido
  dependiente deja de mostrarse y se descarta su selección temporal.
- Las tarjetas de asignaciones y modelos viven dentro de un `ScrollArea`
  vertical con altura acotada.
- En escritorio, `ResizablePanelGroup` permite ajustar el ancho entre el flujo y
  el área de preparación. En móvil no se monta el redimensionador y ambos
  paneles se apilan.
- Los campos y botones usan los tamaños predeterminados de Shadcn; no se fuerzan
  alturas ni tipografías ampliadas.
- Las tablas conservan su desplazamiento horizontal.
