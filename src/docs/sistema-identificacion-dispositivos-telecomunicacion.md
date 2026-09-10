# Sistema de identificacion de dispositivos de telecomunicacion

Fecha de referencia: 2026-09-10

Documento generado a partir del codigo actual del proyecto.

Archivos base:

- `src/main/java/com/jpj/excr/modules/inventory/identification/controller/IdentificationController.java`
- `src/main/java/com/jpj/excr/modules/inventory/identification/application/IdentificationService.java`

Alcance:

- endpoint de identificacion por codigo capturado;
- seleccion de estrategia por proveedor;
- reglas de interpretacion de codigos por proveedor;
- resolucion contra entidades de inventario;
- validacion segun operacion enviada;
- respuesta devuelta al frontend;
- elementos que alimentan o consumen los identificadores.

---

# 1. Objetivo del sistema

El sistema de identificacion recibe un codigo bruto capturado por scanner o input manual y lo convierte en una respuesta normalizada para operaciones de inventario de telecomunicaciones.

La identificacion no registra movimientos por si sola. Su funcion es resolver que representa el codigo enviado:

- un item especifico, cuando el modelo es `SPECIFIC` y existe un codigo unico como `MAC` o `SERIAL`;
- un item generico, cuando el modelo es `GENERIC` y el codigo identifica una familia/modelo sin unidad fisica unica.

Despues de resolver el codigo, el servicio valida si esa identificacion es compatible con la operacion solicitada: `ENTRY`, `ASSIGNMENT`, `RETURN` o `EXIT`.

---

# 2. Endpoint principal

Clase:

```text
com.jpj.excr.modules.inventory.identification.controller.IdentificationController
```

Endpoint:

```http
POST /api/identification
Content-Type: application/json
```

Metodo:

```java
public ResponseEntity<IdentificationResponse> identify(
        @Valid @RequestBody IdentificationRequest request
)
```

El controlador solo valida el cuerpo con Jakarta Validation y delega todo el comportamiento en `IdentificationService.identify(request)`.

---

# 3. Request

DTO:

```text
com.jpj.excr.modules.inventory.identification.dto.IdentificationRequest
```

Campos:

| Campo | Tipo | Validacion | Uso |
|-------|------|------------|-----|
| `operationType` | `IdentificationOperationType` | `@NotNull` | Define para que operacion se quiere usar el codigo. |
| `providerId` | `Long` | `@NotNull` | Selecciona la estrategia de identificacion por proveedor. |
| `rawCode` | `String` | `@NotBlank` | Codigo bruto capturado por scanner o escrito manualmente. |

Enum `IdentificationOperationType`:

```text
ENTRY
ASSIGNMENT
RETURN
EXIT
```

Ejemplo:

```json
{
  "operationType": "ASSIGNMENT",
  "providerId": 1,
  "rawCode": "000041297620000000002CEADC9A80A0"
}
```

---

# 4. Flujo interno

Servicio:

```text
com.jpj.excr.modules.inventory.identification.application.IdentificationService
```

Metodo principal:

```java
@Transactional(readOnly = true)
public IdentificationResponse identify(IdentificationRequest request)
```

Secuencia real:

1. `providerResolver.resolve(request.getProviderId())`
2. `strategy.identify(request.getRawCode())`
3. `operationValidator.validate(request.getOperationType(), identification)`
4. `responseMapper.toResponse(identification)`

Responsabilidades:

| Componente | Responsabilidad |
|------------|-----------------|
| `ProviderIdentificationResolver` | Elegir la estrategia que soporta el proveedor enviado. |
| `ProviderIdentificationStrategy` | Contrato comun para cada proveedor. |
| Estrategia de proveedor | Normalizar e interpretar el `rawCode`. |
| Reglas de proveedor | Probar formatos concretos de codigo. |
| `IdentificationDomainResolver` | Resolver identificador/modelo/item real contra base de datos. |
| `OperationIdentificationValidator` | Validar si el resultado sirve para la operacion solicitada. |
| `IdentificationResponseMapper` | Convertir el resultado interno en DTO de respuesta. |

---

# 5. Seleccion de proveedor

Clase:

```text
com.jpj.excr.modules.inventory.identification.provider.ProviderIdentificationResolver
```

El resolver recibe todas las estrategias Spring que implementan `ProviderIdentificationStrategy`.

Contrato:

```java
boolean supports(Long providerId);
ResolvedIdentification identify(String rawCode);
```

Si ninguna estrategia soporta el proveedor, lanza:

```text
No hay estrategia de identificacion para el proveedor id: {providerId}
```

## 5.1 Movistar

Clase:

```text
com.jpj.excr.modules.inventory.identification.provider.movistar.MovistarIdentificationStrategy
```

Soporta un proveedor cuando:

- `providerId` no es `null`;
- existe el proveedor;
- `provider.active == true`;
- `provider.name.toLowerCase()` contiene `movistar`.

Normalizacion:

- rechaza `null` o blank;
- usa `rawCode.trim()`;
- no convierte a mayusculas ni minusculas.

Si ninguna regla resuelve el codigo:

```text
No se pudo identificar el codigo Movistar: {code}
```

## 5.2 Vodafone

Clase:

```text
com.jpj.excr.modules.inventory.identification.provider.vodafone.VodafoneIdentificationStrategy
```

Soporta un proveedor cuando:

- `providerId` no es `null`;
- existe el proveedor;
- `provider.active == true`;
- `provider.name.toLowerCase()` contiene `vodafone`.

Estado actual:

```text
La identificacion Vodafone esta preparada arquitectonicamente, pero sus reglas de doble scan aun no estan definidas
```

Es decir, la arquitectura existe, pero cualquier intento real de identificar por Vodafone falla con `BusinessRuleException`.

---

# 6. Reglas Movistar

Todas las reglas Movistar trabajan sobre codigos de longitud fija:

```text
32 caracteres
```

Constantes:

```text
MOVISTAR_CODE_LENGTH = 32
ACOMETIDA_PREFIX = 00005301
```

Las reglas se ejecutan por orden Spring `@Order`.

| Orden | Regla | Tipo esperado | Como interpreta el codigo |
|-------|-------|---------------|---------------------------|
| 10 | `MovistarStandardSpecificRule` | `SPECIFIC` | `identifierCode = rawCode[0..12)`, `uniqueCode = rawCode[20..32)`, `uniqueCodeType = MAC`. |
| 20 | `MovistarAcometida01Rule` | `SPECIFIC` | Prefijo `00005301`, tipo `rawCode[8..10)` numerico, proveedor interno `00`, bloque cero `rawCode[12..23)`, serial `rawCode[23..32)` reemplazando `-` por `/`. |
| 30 | `MovistarAcometida02Rule` | `SPECIFIC` | Prefijo `00005301`, proveedor interno `01`, bloque cero `rawCode[12..20)`, serial `rawCode[20..32)`. |
| 40 | `MovistarAcometida03Rule` | `SPECIFIC` | Prefijo `00005301`, proveedor interno `02`, bloque cero `rawCode[12..22)`, serial `rawCode[22..32)`. |
| 50 | `MovistarAcometida04Rule` | `SPECIFIC` | Prefijo `00005301`, proveedor interno `03`, bloque cero `rawCode[12..21)`, serial `rawCode[21..32)`. |
| 60 | `MovistarAcometida05Rule` | `SPECIFIC` | Prefijo `00005301`, proveedor interno `04`, bloque cero `rawCode[12..20)`, serial `rawCode[20..32)`. |
| 100 | `MovistarStandardGenericRule` | `GENERIC` | Usa el `rawCode` completo como `identifierCode`. |

## 6.1 Regla estandar especifica

Clase:

```text
MovistarStandardSpecificRule
```

Condicion inicial:

- `rawCode.length() == 32`

Extraccion:

```text
identifierCode = rawCode.substring(0, 12)
uniqueCode = rawCode.substring(20, 32)
uniqueCodeType = MAC
```

Resolucion:

```java
domainResolver.resolveSpecific(identifierCode, uniqueCode, TelecommunicationItemType.MAC)
```

Si el identificador no existe, no esta activo, o su modelo no es `SPECIFIC`, la regla no resuelve y el flujo prueba la siguiente regla.

## 6.2 Reglas de acometida

Todas las reglas de acometida requieren:

- longitud `32`;
- prefijo `00005301`;
- `rawCode[8..10)` con dos digitos;
- proveedor interno concreto en `rawCode[10..12)`.

Cada una extrae el identificador asi:

```text
identifierCode = rawCode.substring(0, 10)
```

Cada una genera un resultado especifico con:

```text
uniqueCodeType = SERIAL
```

Validaciones por regla:

| Regla | Proveedor interno | Bloque cero | Serial extraido | Patron serial |
|-------|-------------------|-------------|-----------------|---------------|
| Acometida01 | `00` | `rawCode[12..23) == 00000000000` | `rawCode[23..32)` con `-` cambiado a `/` | `\d{2}/\d{6}` |
| Acometida02 | `01` | `rawCode[12..20) == 00000000` | `rawCode[20..32)` | `[A-Za-z0-9]{12}` |
| Acometida03 | `02` | `rawCode[12..22) == 0000000000` | `rawCode[22..32)` | `3[A-Za-z0-9]{9}` |
| Acometida04 | `03` | `rawCode[12..21) == 000000000` | `rawCode[21..32)` | `[A-Za-z0-9]{11}` |
| Acometida05 | `04` | `rawCode[12..20) == 00000000` | `rawCode[20..32)` | `20111[A-Za-z0-9]{7}` |

Si la estructura base coincide pero el bloque cero o el serial son invalidos, la regla lanza `BusinessRuleException` y el flujo no continua a reglas posteriores.

## 6.3 Regla estandar generica

Clase:

```text
MovistarStandardGenericRule
```

Condicion inicial:

- `rawCode.length() == 32`

Resolucion:

```java
domainResolver.resolveGeneric(rawCode)
```

Para genericos, el codigo completo debe existir como `TelecommunicationItemModelIdentifier.code`.

---

# 7. Resolucion contra dominio

Clase:

```text
com.jpj.excr.modules.inventory.identification.resolver.IdentificationDomainResolver
```

Repositorios usados:

| Repositorio | Uso |
|-------------|-----|
| `TelecommunicationItemModelIdentifierRepository` | Buscar el identificador por `code`. |
| `TelecommunicationsItemRepository` | Buscar item especifico por `uniqueCode`. |
| `TelecommunicationsGenericItemRepository` | Buscar un registro generico por modelo. |

## 7.1 Resolucion especifica

Metodo:

```java
resolveSpecific(String identifierCode, String uniqueCode, TelecommunicationItemType uniqueCodeType)
```

Condiciones para resolver:

1. Existe `TelecommunicationItemModelIdentifier` con `code = identifierCode`.
2. El identificador esta activo.
3. El identificador tiene modelo.
4. El modelo esta activo.
5. El modelo tiene `telecommunicationItemType == SPECIFIC`.

Datos enriquecidos:

- `modelId`
- `modelName`
- `identifierId`
- `identifierCode`
- `uniqueCode`
- `uniqueCodeType`
- `telecommunicationItemId`
- `status`

El `telecommunicationItemId` y el `status` salen de:

```java
itemRepository.findByUniqueCode(uniqueCode)
```

Si el item no existe, ambos valores salen `null`. Eso es valido para `ENTRY`, pero no para `ASSIGNMENT` ni `EXIT`.

## 7.2 Resolucion generica

Metodo:

```java
resolveGeneric(String identifierCode)
```

Condiciones para resolver:

1. Existe `TelecommunicationItemModelIdentifier` con `code = identifierCode`.
2. El identificador esta activo.
3. El identificador tiene modelo.
4. El modelo esta activo.
5. El modelo tiene `telecommunicationItemType == GENERIC`.

Datos enriquecidos:

- `modelId`
- `modelName`
- `identifierId`
- `identifierCode`
- `telecommunicationGenericItemId`
- `quantity`

El `telecommunicationGenericItemId` se obtiene con:

```java
genericItemRepository.findFirstByTelecommunicationItemModel_Id(model.getId())
```

La cantidad devuelta por escaneo es fija:

```text
quantity = 1
```

Importante: no se devuelve el stock real del generico. El valor `1` representa una unidad capturada por el scan.

---

# 8. Validacion por operacion

Clase:

```text
com.jpj.excr.modules.inventory.identification.application.OperationIdentificationValidator
```

## 8.1 Identificacion especifica

| Operacion enviada | Validacion aplicada | Resultado esperado |
|-------------------|---------------------|--------------------|
| `ENTRY` | El item no debe existir todavia. | Permite alta si `telecommunicationItemId == null`. |
| `ASSIGNMENT` | El item debe existir y estar `AVAILABLE`. | Permite asignar si `telecommunicationItemId != null` y `status == AVAILABLE`. |
| `EXIT` | El item debe existir y estar `AVAILABLE`. | Permite salida si `telecommunicationItemId != null` y `status == AVAILABLE`. |
| `RETURN` | No aplica validacion adicional. | Devuelve la identificacion resuelta. |

Errores especificos:

```text
Ya existe un item de telecomunicaciones con el codigo unico: {uniqueCode}
No existe un item de telecomunicaciones con el codigo unico: {uniqueCode}
El item de telecomunicaciones no esta disponible: {uniqueCode}
```

## 8.2 Identificacion generica

Para genericos no hay validacion adicional por operacion.

Operaciones permitidas por el validador:

```text
ENTRY
ASSIGNMENT
RETURN
EXIT
```

Esto significa que si el codigo generico resuelve modelo e identificador activos, el endpoint responde correctamente para cualquier operacion. Las reglas finales de cantidad/stock quedan para los servicios de operacion.

---

# 9. Response

DTO:

```text
com.jpj.excr.modules.inventory.identification.dto.IdentificationResponse
```

Campos:

| Campo | Tipo | Specific | Generic |
|-------|------|----------|---------|
| `productType` | `TelecommunicationItemModelType` | `SPECIFIC` | `GENERIC` |
| `model.id` | `Long` | id del modelo | id del modelo |
| `model.name` | `String` | nombre del modelo | nombre del modelo |
| `identifier.id` | `Long` | id del identificador | id del identificador |
| `identifier.code` | `String` | codigo del identificador | codigo del identificador |
| `uniqueCode` | `String` | codigo unico extraido | `null` |
| `uniqueCodeType` | `TelecommunicationItemType` | `MAC` o `SERIAL` | `null` |
| `quantity` | `Integer` | `null` | `1` |
| `telecommunicationItemId` | `Long` | id del item si existe | `null` |
| `telecommunicationGenericItemId` | `Long` | `null` | id del generico si existe |
| `status` | `TelecommunicationItemStatus` | estado del item si existe | `null` |

Enums relacionados:

```text
TelecommunicationItemModelType: SPECIFIC, GENERIC
TelecommunicationItemType: MAC, SERIAL
TelecommunicationItemStatus: AVAILABLE, ASSIGNED, IN_REPAIR, RETIRED
```

## 9.1 Respuesta especifica para ENTRY cuando el item no existe

Request:

```json
{
  "operationType": "ENTRY",
  "providerId": 1,
  "rawCode": "000041297620000000002CEADC9A80A0"
}
```

Response esperada si resuelve como especifico estandar:

```json
{
  "productType": "SPECIFIC",
  "model": {
    "id": 10,
    "name": "Router Movistar X"
  },
  "identifier": {
    "id": 50,
    "code": "000041297620"
  },
  "uniqueCode": "2CEADC9A80A0",
  "uniqueCodeType": "MAC",
  "quantity": null,
  "telecommunicationItemId": null,
  "telecommunicationGenericItemId": null,
  "status": null
}
```

Uso posterior:

- `uniqueCode` -> `TelecommunicationsItemCreateRequest.uniqueCode`
- `uniqueCodeType` -> `TelecommunicationsItemCreateRequest.uniqueCodeType`
- `model.id` -> `TelecommunicationsItemCreateRequest.telecommunicationItemModelId`
- `identifier.id` -> `TelecommunicationsItemCreateRequest.telecommunicationItemModelIdentifierId`

## 9.2 Respuesta especifica para ASSIGNMENT o EXIT

Para `ASSIGNMENT` y `EXIT`, el item debe existir y estar `AVAILABLE`.

Response esperada:

```json
{
  "productType": "SPECIFIC",
  "model": {
    "id": 10,
    "name": "Router Movistar X"
  },
  "identifier": {
    "id": 50,
    "code": "000041297620"
  },
  "uniqueCode": "2CEADC9A80A0",
  "uniqueCodeType": "MAC",
  "quantity": null,
  "telecommunicationItemId": 300,
  "telecommunicationGenericItemId": null,
  "status": "AVAILABLE"
}
```

Uso posterior:

- asignacion especifica -> `AssigmentTelecommunicationItemRequest.telecommunicationItemId`
- salida especifica -> `TelecommunicationsItemExitRequest.telecommunicationsItemId`

## 9.3 Respuesta generica

Request:

```json
{
  "operationType": "ASSIGNMENT",
  "providerId": 1,
  "rawCode": "00000000000000000000000000000001"
}
```

Response esperada si el codigo completo existe como identificador de un modelo generico:

```json
{
  "productType": "GENERIC",
  "model": {
    "id": 20,
    "name": "Latiguillo fibra"
  },
  "identifier": {
    "id": 70,
    "code": "00000000000000000000000000000001"
  },
  "uniqueCode": null,
  "uniqueCodeType": null,
  "quantity": 1,
  "telecommunicationItemId": null,
  "telecommunicationGenericItemId": 900,
  "status": null
}
```

Uso posterior:

- alta generica -> `TelecommunicationsGenericCreateRequest.telecommunicationGenericId`, `identifierId`, `quantity`
- asignacion generica -> `AssigmentTelecommunicationGenericItemRequest.telecommunicationGenericItemId`, `identifierId`, `quantity`
- salida generica -> `TelecommunicationsGenericExitRequest.telecommunicationGenericId`, `identifierId`, `quantity`

---

# 10. Entidades implicadas

## 10.1 `TelecommunicationItemModel`

Tabla:

```text
telecommunication_item_model
```

Campos relevantes:

| Campo | Uso en identificacion |
|-------|------------------------|
| `id` | Devuelto como `model.id`. |
| `name` | Devuelto como `model.name`. |
| `provider` | Usado indirectamente para modelos asociados al proveedor. |
| `telecommunicationItemType` | Define si el resultado debe ser `SPECIFIC` o `GENERIC`. |
| `active` | Debe ser `true` para resolver. |

## 10.2 `TelecommunicationItemModelIdentifier`

Tabla:

```text
telecommunication_item_model_identifier
```

Campos relevantes:

| Campo | Uso en identificacion |
|-------|------------------------|
| `id` | Devuelto como `identifier.id`. |
| `code` | Codigo buscado por las reglas. |
| `telecommunicationItemModel` | Modelo asociado al identificador. |
| `active` | Debe ser `true` para resolver. |

Restriccion importante:

```java
@Column(name = "code", nullable = false, unique = true, length = 100)
```

## 10.3 `TelecommunicationItem`

Tabla:

```text
telecommunication_device
```

Representa unidades especificas.

Campos relevantes:

| Campo | Uso en identificacion |
|-------|------------------------|
| `id` | Devuelto como `telecommunicationItemId` si existe. |
| `uniqueCode` | Busqueda por codigo unico extraido. |
| `uniqueCodeType` | Tipo de codigo: `MAC` o `SERIAL`. |
| `status` | Validado para asignacion y salida. |
| `telecommunicationItemModel` | Modelo de la unidad. |
| `telecommunicationItemModelIdentifier` | Identificador del modelo. |

## 10.4 `TelecommunicationGenericItem`

Tabla:

```text
telecommunication_generic
```

Representa stock generico agregado por modelo.

Campos relevantes:

| Campo | Uso en identificacion |
|-------|------------------------|
| `id` | Devuelto como `telecommunicationGenericItemId`. |
| `telecommunicationItemModel` | Se busca el primer generico para el modelo resuelto. |
| `quantity` | No se devuelve como cantidad identificada. |

---

# 11. Elementos llamantes y relacionados

## 11.1 Llamante directo

El unico llamante Java directo localizado para `IdentificationService.identify(...)` es:

```text
IdentificationController.identify(...)
```

El flujo esta pensado principalmente para consumo externo por frontend/API.

## 11.2 Endpoints que preparan datos usados por identificacion

Modelos:

```http
GET    /api/telecomunication-model/
GET    /api/telecomunication-model/models/all
POST   /api/telecomunication-model/
PUT    /api/telecomunication-model/model/{id}
PUT    /api/telecomunication-model/model/parcial/{id}
DELETE /api/telecomunication-model/{id}
```

Identificadores de modelo:

```http
POST   /api/telecommunication-item-model-identifier/
PUT    /api/telecommunication-item-model-identifier/{id}
GET    /api/telecommunication-item-model-identifier/model/{id}
DELETE /api/telecommunication-item-model-identifier/{id}
```

Seleccion auxiliar:

```http
GET /api/telecommunication-models/selection
GET /api/telecommunication-models/{modelId}/identifiers
GET /api/telecommunication-models/{modelId}/available-items
```

## 11.3 Endpoints que consumen los datos devueltos

Operaciones de inventario:

```http
POST /api/telecommunication-item/register
POST /api/telecommunication-item/exit
POST /api/telecommunication-item/assignment
POST /api/telecommunication-item/return
```

La identificacion devuelve ids y codigos que se reutilizan en estas operaciones:

| Campo de `IdentificationResponse` | Operacion destino |
|-----------------------------------|-------------------|
| `model.id` | Alta de item especifico o generico. |
| `identifier.id` | Alta/asignacion/salida de genericos y alta de especificos. |
| `uniqueCode` | Alta de item especifico. |
| `uniqueCodeType` | Alta de item especifico. |
| `telecommunicationItemId` | Asignacion/salida/devolucion de especificos. |
| `telecommunicationGenericItemId` | Asignacion/salida/devolucion de genericos. |
| `quantity` | Cantidad sugerida por scan para genericos. |
| `status` | Decision frontend para mostrar estado del item especifico. |

---

# 12. Comportamiento segun lo enviado

## 12.1 Por `operationType`

| `operationType` | Specific inexistente | Specific existente `AVAILABLE` | Specific existente no disponible | Generic resuelto |
|-----------------|----------------------|---------------------------------|----------------------------------|------------------|
| `ENTRY` | Responde OK | Error: ya existe | Error: ya existe | Responde OK |
| `ASSIGNMENT` | Error: no existe | Responde OK | Error: no disponible | Responde OK |
| `EXIT` | Error: no existe | Responde OK | Error: no disponible | Responde OK |
| `RETURN` | Responde OK si resuelve identificador/modelo | Responde OK | Responde OK | Responde OK |

Nota: en `RETURN`, el validador actual no comprueba existencia ni disponibilidad del item especifico.

## 12.2 Por `providerId`

| Proveedor resuelto | Resultado |
|--------------------|-----------|
| Nombre activo contiene `movistar` | Aplica reglas Movistar. |
| Nombre activo contiene `vodafone` | Falla porque las reglas no estan implementadas. |
| Otro proveedor activo | Error: no hay estrategia. |
| Proveedor inactivo o inexistente | Error: no hay estrategia. |
| `providerId = null` | Rechazado por validation o sin estrategia. |

## 12.3 Por `rawCode`

| Caso | Resultado |
|------|-----------|
| `null`, vacio o blank | Error de validacion o `BusinessRuleException`. |
| Longitud distinta de `32` para Movistar | No resuelve ninguna regla Movistar. |
| Longitud `32` y coincide con identificador specific estandar | Devuelve `SPECIFIC` con `uniqueCodeType = MAC`. |
| Longitud `32`, prefijo acometida y proveedor interno `00..04` | Devuelve `SPECIFIC` con `uniqueCodeType = SERIAL` si pasa validaciones. |
| Longitud `32` y codigo completo coincide con identificador generico | Devuelve `GENERIC` con `quantity = 1`. |
| Identificador existe pero esta inactivo | No resuelve. |
| Modelo existe pero esta inactivo | No resuelve. |
| Modelo existe pero su tipo no coincide con la regla | No resuelve. |

---

# 13. Observaciones tecnicas

1. `MovistarStandardSpecificRule` se ejecuta antes que las reglas de acometida. Si un codigo de acometida tambien pudiera resolverse como especifico estandar por sus primeros 12 caracteres, se devolveria esa interpretacion primero.
2. Las reglas de acometida usan `identifierCode = rawCode.substring(0, 10)`, mientras que la regla especifica estandar usa `rawCode.substring(0, 12)`.
3. La busqueda de item especifico se hace solo por `uniqueCode`, no por combinacion `uniqueCode + identifier + model`.
4. El stock generico real no se valida ni se devuelve desde identificacion; solo se devuelve `quantity = 1`.
5. Vodafone esta preparado como estrategia, pero no tiene reglas funcionales.
6. El sistema depende de que los identificadores (`TelecommunicationItemModelIdentifier.code`) esten creados previamente y activos.
7. El endpoint es `readOnly`; no crea ni actualiza entidades.

---

# 14. Errores principales

| Situacion | Error |
|-----------|-------|
| No hay estrategia para proveedor | `No hay estrategia de identificacion para el proveedor id: {providerId}` |
| Movistar sin regla aplicable | `No se pudo identificar el codigo Movistar: {code}` |
| Vodafone usado | `La identificacion Vodafone esta preparada arquitectonicamente, pero sus reglas de doble scan aun no estan definidas` |
| Specific `ENTRY` con item existente | `Ya existe un item de telecomunicaciones con el codigo unico: {uniqueCode}` |
| Specific `ASSIGNMENT` o `EXIT` con item inexistente | `No existe un item de telecomunicaciones con el codigo unico: {uniqueCode}` |
| Specific `ASSIGNMENT` o `EXIT` con estado distinto de `AVAILABLE` | `El item de telecomunicaciones no esta disponible: {uniqueCode}` |
| Acometida con bloque cero invalido | `Codigo Movistar Acometida0X invalido` |
| Acometida con serial invalido | `Serial Movistar Acometida0X invalido: {serial}` |

---

# 15. Resumen operativo para frontend

Flujo recomendado:

1. El usuario selecciona operacion y proveedor.
2. El usuario escanea o introduce `rawCode`.
3. Frontend llama a `POST /api/identification`.
4. Si `productType = SPECIFIC`, usar `telecommunicationItemId` para operaciones sobre unidades existentes o `uniqueCode`/`uniqueCodeType`/`model.id`/`identifier.id` para altas.
5. Si `productType = GENERIC`, usar `telecommunicationGenericItemId`, `identifier.id` y `quantity`.
6. Si el backend devuelve error de negocio, mostrar el mensaje al usuario y no construir la operacion final.

La respuesta del endpoint debe tratarse como la fuente normalizada para saber que enviar despues a `/register`, `/assignment`, `/exit` o `/return`.
