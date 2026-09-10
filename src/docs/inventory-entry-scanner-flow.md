# Flujo simplificado de recepción mediante escáner

Este documento define el flujo funcional del **Área de Preparación** para la recepción de productos mediante un lector hardware. El proveedor se mantiene como un campo de texto obligatorio que el usuario debe seleccionar; una vez elegido, los productos se incorporan exclusivamente mediante lecturas del escáner.

## 1. Principio general

```text
Selección del proveedor (campo de texto)
  -> lector habilitado
  -> lectura del escáner
  -> listener de la interfaz
  -> servicio backend de identificación
  -> respuesta con modelo y propiedades
  -> actualización de la lista temporal en memoria
```

La lectura puede proceder de un código de barras, QR, serie, IMEI o RFID, dependiendo del dispositivo utilizado. El listener debe recibir la secuencia completa y detectar el final de la lectura según la configuración del escáner.

## 2. Interceptación de la lectura

El usuario debe seleccionar primero el proveedor en el campo de texto. Esta selección determina el `providerId` que acompañará a cada lectura. El componente oyente permanece activo mientras exista un proveedor válido y la pantalla de recepción esté habilitada. Al recibir un código:

1. Comprueba que la lectura no esté vacía.
2. Evita procesar otra lectura mientras la anterior siga pendiente.
3. Envía el código al servicio de identificación.
4. Procesa la respuesta del servidor.
5. Actualiza la preparación en memoria.

```ts
onScanCode = async (rawCode: string) => {
  if (!rawCode.trim() || identifying) return;

  const result = await identifyProduct({
    operationType: "ENTRY",
    providerId: selectedProvider.id,
    rawCode: rawCode.trim(),
  });

  addResultToPreparation(result);
};
```

No se solicitan selecciones manuales de modelo ni identificador para los productos escaneados. El proveedor seleccionado y el código leído son los datos necesarios para resolver el producto.

## 2.1. Selección del proveedor

El proveedor no se obtiene del código y tampoco se deduce automáticamente. Se
elige en un campo de texto/autocompletado antes de iniciar las lecturas.

```text
Campo Proveedor
  -> usuario selecciona un proveedor
  -> se obtiene providerId
  -> se habilita el listener del escáner
```

Si el proveedor cambia mientras existen elementos pendientes, la interfaz debe
pedir confirmación, ya que los elementos preparados pertenecen al proveedor
seleccionado originalmente.

## 3. Resolución en el backend

La interfaz envía la lectura al servicio de identificación:

```http
POST /identification
```

El backend interpreta el código y devuelve, como mínimo:

- tipo de producto (`SPECIFIC` o `GENERIC`);
- modelo identificado;
- identificador de catálogo;
- identificador único, cuando corresponda;
- cantidad asociada, para dispositivos genéricos;
- datos necesarios para mostrar el producto en la preparación.

La interfaz no intenta interpretar localmente el código ni deducir el modelo. La respuesta del backend es la fuente de verdad para construir la entrada temporal.

## 4. Gestión temporal en memoria

Los resultados escaneados se mantienen en el estado de la pantalla o en un store de sesión. No se escriben en la base de datos durante cada lectura.

```ts
type PreparationState = {
  specificItems: SpecificItem[];
  genericItems: GenericItem[];
};
```

La colección original se conserva inmutable y cada lectura produce una nueva referencia de estado.

## 5. Dispositivos únicos

Los dispositivos únicos se agregan como entradas individuales. Cada lectura válida crea una nueva posición en el array temporal del modelo, guardando su identificador de serie, IMEI o código único.

```ts
setSpecificItems((currentItems) => [
  ...currentItems,
  {
    id: createTemporaryId(),
    modelId: result.model.id,
    model: result.model.name,
    identifierId: result.identifier.id,
    uniqueCode: result.uniqueCode,
    uniqueCodeType: result.uniqueCodeType,
  },
]);
```

Antes de insertar debe comprobarse que el código único no esté ya preparado. Si se detecta un duplicado, la lectura se rechaza y se informa al usuario sin alterar la lista existente.

## 6. Dispositivos genéricos

Los dispositivos genéricos se agrupan por modelo e identificador de catálogo. No se añade una fila nueva para cada lectura repetida.

```ts
setGenericItems((currentItems) => {
  const existing = currentItems.find(
    (item) =>
      item.modelId === result.model.id &&
      item.identifierId === result.identifier.id,
  );

  if (existing) {
    return currentItems.map((item) =>
      item.id === existing.id
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [
    ...currentItems,
    {
      id: createTemporaryId(),
      modelId: result.model.id,
      model: result.model.name,
      identifierId: result.identifier.id,
      quantity: 1,
    },
  ];
});
```

El comportamiento es:

- primera lectura del modelo: se crea una entrada con `quantity: 1`;
- lectura posterior del mismo modelo e identificador: `quantity += 1`;
- lectura de otro modelo o identificador: se crea otro grupo independiente.

## 7. Representación en el Área de Preparación

La vista consume exclusivamente los arrays temporales:

```text
PreparationArea
  -> lista de dispositivos únicos
       -> modelo
       -> identificadores únicos escaneados
  -> lista de dispositivos genéricos
       -> modelo
       -> identificador de catálogo
       -> contador de unidades
```

La representación se actualiza inmediatamente después de resolver cada lectura. La tabla o lista visual no debe hacer nuevas peticiones ni volver a identificar los códigos.

## 8. Protección frente a pérdida de datos

Mientras existan elementos pendientes en cualquiera de los arrays, la pantalla se considera una preparación no guardada.

```ts
const hasPendingItems =
  specificItems.length > 0 || genericItems.length > 0;
```

El guardián de navegación debe cubrir dos situaciones:

1. **Navegación interna:** interceptar el cambio de ruta y mostrar un diálogo de confirmación.
2. **Cierre o recarga del navegador:** registrar `beforeunload` para mostrar el aviso nativo del navegador.

El usuario debe confirmar expresamente si desea abandonar la pantalla y perder los elementos acumulados.

## 9. Guardado definitivo

El escaneo solo prepara datos en memoria. La persistencia se realiza en una acción separada de confirmación:

```text
Elementos temporales
  -> validación final
  -> construcción del payload
  -> petición de registro de entrada
  -> limpieza del estado temporal
  -> mensaje de éxito
```

Si el guardado falla, los elementos deben permanecer en memoria para permitir reintentar la operación. Solo después de una respuesta exitosa se limpia la preparación y se desactiva el guardián de navegación.

## 10. Estados y errores

| Estado | Comportamiento |
| --- | --- |
| Escáner listo | El listener acepta lecturas |
| Identificando | Se bloquean lecturas simultáneas y se muestra progreso |
| Producto identificado | Se actualiza la lista temporal |
| Código duplicado | Se rechaza la lectura y se mantiene la lista intacta |
| Código inválido | Se muestra el error del servicio |
| Sin conexión | Se informa del fallo y no se pierde la preparación existente |
| Guardando | Se bloquean acciones de registro duplicadas |
| Guardado correcto | Se limpia la memoria temporal |

## 11. Reglas esenciales

- La selección del proveedor debe realizarse mediante el campo de texto del formulario.
- Una vez elegido el proveedor, la incorporación de productos debe depender exclusivamente del escáner.
- No deben requerirse selecciones manuales de modelo o identificador para los productos escaneados.
- El backend debe resolver cada lectura.
- Los dispositivos únicos se almacenan individualmente.
- Los dispositivos genéricos se agrupan e incrementan su contador.
- La preparación no se persiste durante el escaneo.
- El estado temporal debe conservarse mientras dure la sesión.
- La navegación y el cierre deben estar protegidos cuando existan pendientes.
- Un error de identificación o guardado no debe borrar los elementos acumulados.
