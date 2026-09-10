# Documentacion de endpoints de `TelecommunicationInventoryOperationController`

Este documento describe los endpoints definidos en [TelecommunicationInventoryOperationController.java](C:/Users/stive/Desktop/proyecto-refactorizado-jpj/excr/src/main/java/com/jpj/excr/modules/inventory/api/operations/TelecommunicationInventoryOperationController.java:1), los DTO request que consumen y lo que devuelve cada uno.

Controlador base:

```http
/api/telecommunication-item/
```

## Resumen

| Endpoint | Metodo | Content-Type | Request DTO | Respuesta |
|---|---|---|---|---|
| `/register` | `POST` | `application/json` | `RegisterTelecommunicationsItemsRequest` | `200 OK` sin body |
| `/exit` | `POST` | `application/json` | `ExitTelecommunicationsItemsRequest` | `200 OK` sin body |
| `/assignment` | `POST` | `multipart/form-data` | `AssigmentCreateRequest` en `request` | `200 OK` sin body |
| `/return` | `POST` | `multipart/form-data` | `ReturnTelecommunicationsItemsRequest` en `request` | `200 OK` sin body |

---

## 1. Registrar entrada de items

```http
POST /api/telecommunication-item/register
Content-Type: application/json
```

### Responsabilidad

Registra una entrada de inventario de telecomunicaciones.

Permite enviar en una sola operación:

- items especificos;
- items genericos.

### Request DTO

```java
RegisterTelecommunicationsItemsRequest
```

Campos:

| Campo | Tipo | Descripcion |
|---|---|---|
| `genericItems` | `List<TelecommunicationsGenericCreateRequest>` | Lista de consumibles o items genericos a incrementar en stock. |
| `specificItems` | `List<TelecommunicationsItemCreateRequest>` | Lista de unidades fisicas especificas a registrar. |

### DTO anidado: `TelecommunicationsGenericCreateRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `quantity` | `Long` | Cantidad a registrar. |
| `telecommunicationGenericId` | `Long` | ID del item generico que recibe stock. |
| `identifierId` | `Long` | ID del identificador asociado, cuando proceda. |

### DTO anidado: `TelecommunicationsItemCreateRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `uniqueCode` | `String` | Codigo unico de la unidad fisica. |
| `uniqueCodeType` | `TelecommunicationItemType` | Tipo del codigo unico. |
| `telecommunicationItemModelId` | `Long` | ID del modelo de telecomunicacion. |
| `telecommunicationItemModelIdentifierId` | `Long` | ID del identificador del modelo. |

### Ejemplo request

```json
{
  "genericItems": [
    {
      "quantity": 25,
      "telecommunicationGenericId": 41,
      "identifierId": 12
    }
  ],
  "specificItems": [
    {
      "uniqueCode": "2CEADC9A80A0",
      "uniqueCodeType": "MAC",
      "telecommunicationItemModelId": 15,
      "telecommunicationItemModelIdentifierId": 7
    }
  ]
}
```

### Que devuelve

```http
200 OK
```

Sin body:

```java
ResponseEntity<Void>
```

---

## 2. Registrar salida de items

```http
POST /api/telecommunication-item/exit
Content-Type: application/json
```

### Responsabilidad

Registra una salida de inventario.

Permite retirar:

- unidades fisicas especificas;
- stock de items genericos.

### Request DTO

```java
ExitTelecommunicationsItemsRequest
```

Campos:

| Campo | Tipo | Descripcion |
|---|---|---|
| `specificItems` | `List<TelecommunicationsItemExitRequest>` | Unidades especificas que salen del inventario. |
| `genericItems` | `List<TelecommunicationsGenericExitRequest>` | Items genericos cuyo stock se reduce. |

### DTO anidado: `TelecommunicationsItemExitRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `telecommunicationsItemId` | `Long` | ID de la unidad fisica que sale. |
| `remarks` | `String` | Observaciones de la salida para esa unidad. |

### DTO anidado: `TelecommunicationsGenericExitRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `telecommunicationGenericId` | `Long` | ID del item generico. |
| `identifierId` | `Long` | ID del identificador asociado. |
| `quantity` | `Long` | Cantidad a retirar. |
| `remarks` | `String` | Observaciones de la salida. |

### Ejemplo request

```json
{
  "specificItems": [
    {
      "telecommunicationsItemId": 501,
      "remarks": "Baja por instalacion"
    }
  ],
  "genericItems": [
    {
      "telecommunicationGenericId": 41,
      "identifierId": 12,
      "quantity": 5,
      "remarks": "Consumo de material"
    }
  ]
}
```

### Que devuelve

```http
200 OK
```

Sin body:

```java
ResponseEntity<Void>
```

---

## 3. Registrar asignacion

```http
POST /api/telecommunication-item/assignment
Content-Type: multipart/form-data
```

### Responsabilidad

Registra una asignacion de recursos de telecomunicaciones.

Permite asignar:

- unidades fisicas especificas;
- items genericos por cantidad;
- imagenes de movimiento;
- imagenes por item especifico o generico.

### Request DTO

El request se envia dentro de la parte:

```text
request
```

Tipo:

```java
AssigmentCreateRequest
```

Campos:

| Campo | Tipo | Descripcion |
|---|---|---|
| `notes` | `String` | Notas generales de la asignacion. |
| `imageKeys` | `List<String>` | Claves de imagen del movimiento general. |
| `generalItems` | `List<AssigmentTelecommunicationGenericItemRequest>` | Items genericos asignados. |
| `specialItems` | `List<AssigmentTelecommunicationItemRequest>` | Unidades especificas asignadas. |

### DTO anidado: `AssigmentTelecommunicationGenericItemRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `telecommunicationGenericItemId` | `Long` | ID del item generico asignado. |
| `quantity` | `Long` | Cantidad asignada. |
| `identifierId` | `Long` | ID del identificador asociado. |
| `imageKeys` | `List<String>` | Claves de imagen del item generico. |

### DTO anidado: `AssigmentTelecommunicationItemRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `telecommunicationItemId` | `Long` | ID de la unidad fisica asignada. |
| `imageKeys` | `List<String>` | Claves de imagen de la unidad especifica. |

### Ejemplo request conceptual

```json
{
  "notes": "Asignacion a tecnico",
  "imageKeys": [
    "movement-image-1"
  ],
  "generalItems": [
    {
      "telecommunicationGenericItemId": 41,
      "quantity": 2,
      "identifierId": 12,
      "imageKeys": [
        "generic-image-1"
      ]
    }
  ],
  "specialItems": [
    {
      "telecommunicationItemId": 501,
      "imageKeys": [
        "specific-image-1"
      ]
    }
  ]
}
```

### Que devuelve

```http
200 OK
```

Sin body:

```java
ResponseEntity<Void>
```

### Nota tecnica

Este endpoint recibe `multipart/form-data` y ademas del `request` el controlador procesa `MultipartHttpServletRequest` para resolver imagenes mediante `AssignmentMultipartImageResolver`.

---

## 4. Registrar retorno

```http
POST /api/telecommunication-item/return
Content-Type: multipart/form-data
```

### Responsabilidad

Registra el retorno de recursos previamente asignados.

Permite devolver:

- unidades fisicas especificas;
- items genericos por cantidad;
- imagenes del movimiento y por item.

### Request DTO

El request se envia dentro de la parte:

```text
request
```

Tipo:

```java
ReturnTelecommunicationsItemsRequest
```

Campos:

| Campo | Tipo | Descripcion |
|---|---|---|
| `assigmentId` | `Long` | ID de la asignacion origen. |
| `imageKeys` | `List<String>` | Claves de imagen del retorno general. |
| `specificItems` | `List<TelecommunicationsItemReturnRequest>` | Unidades especificas devueltas. |
| `genericItems` | `List<TelecommunicationsGenericReturnRequest>` | Items genericos devueltos. |

### DTO anidado: `TelecommunicationsItemReturnRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `assignmentTelecommunicationItemId` | `Long` | ID del detalle de asignacion del item especifico. |
| `telecommunicationItemId` | `Long` | ID de la unidad fisica devuelta. |
| `imageKeys` | `List<String>` | Claves de imagen del item especifico retornado. |

### DTO anidado: `TelecommunicationsGenericReturnRequest`

| Campo | Tipo | Descripcion |
|---|---|---|
| `assignmentTelecommunicationGenericItemId` | `Long` | ID del detalle de asignacion del item generico. |
| `telecommunicationGenericItemId` | `Long` | ID del item generico que se devuelve. |
| `quantity` | `Long` | Cantidad devuelta. |
| `imageKeys` | `List<String>` | Claves de imagen del item generico retornado. |

### Ejemplo request conceptual

```json
{
  "assigmentId": 30,
  "imageKeys": [
    "return-image-1"
  ],
  "specificItems": [
    {
      "assignmentTelecommunicationItemId": 1001,
      "telecommunicationItemId": 501,
      "imageKeys": [
        "specific-return-image-1"
      ]
    }
  ],
  "genericItems": [
    {
      "assignmentTelecommunicationGenericItemId": 2001,
      "telecommunicationGenericItemId": 41,
      "quantity": 2,
      "imageKeys": [
        "generic-return-image-1"
      ]
    }
  ]
}
```

### Que devuelve

```http
200 OK
```

Sin body:

```java
ResponseEntity<Void>
```

### Nota tecnica

Igual que en asignacion, este endpoint usa `multipart/form-data` y resuelve imagenes con `AssignmentMultipartImageResolver`.

---

## Resumen de respuestas

Todos los endpoints de este controlador devuelven lo mismo a nivel HTTP:

```java
ResponseEntity<Void>
```

Eso significa:

- codigo `200 OK`;
- sin body de respuesta;
- no devuelven DTO response en este controlador.
