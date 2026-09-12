# Implementación — Búsqueda rápida de productos mediante escáner

## Objetivo

Implementar en el módulo **Productos** una búsqueda rápida de dispositivos específicos mediante escaneo de DataMatrix.

La funcionalidad debe convivir con el flujo manual existente:

- Desde la tabla de modelos se navega al detalle de un modelo.
- Desde el detalle del modelo se muestran todas sus unidades.
- Al pulsar una unidad se abre su detalle en un panel lateral derecho.
- Desde la vista principal de Productos se podrá escanear directamente cualquier dispositivo y mostrar su detalle mediante un modal.

No implementar pruebas, tests ni funcionalidades adicionales.

---

## 1. Flujo manual existente

Mantener el flujo actual:

```text
Productos
   ↓
Seleccionar modelo
   ↓
Detalle del modelo
   ↓
Tabla de unidades
   ↓
Seleccionar unidad
   ↓
Panel lateral derecho
```

La selección de una unidad debe continuar utilizando el `unitCode` como identificador funcional para recuperar su información.

No depender del ID interno de `TelecommunicationItem`, ya que dicho ID no está disponible en las tablas históricas relacionadas.

---

## 2. Flujo mediante escáner

El escáner debe estar disponible desde la vista principal de:

```text
/inventory/products
```

No será necesario seleccionar previamente un modelo.

El flujo será:

```text
Productos
   ↓
Escaneo DataMatrix
   ↓
Código de 32 caracteres
   ↓
Extraer los últimos 12 caracteres
   ↓
unitCode
   ↓
Petición al backend
   ↓
Detalle del producto
   ↓
Modal
```

Ejemplo:

```text
DataMatrix:
00004129762000000000CCD4A15DDD23

unitCode:
CCD4A15DDD23
```

La extracción puede realizarse mediante:

```ts
export function extractUnitCode(rawCode: string): string {
  return rawCode.trim().slice(-12)
}
```

---

## 3. Hook de escaneo

Reutilizar el sistema de escaneo existente:

```ts
useInventoryScanner({
  onScanCode: handleScanCode,
  enabled: scannerEnabled,
})
```

Implementar el handler:

```ts
const handleScanCode = async (rawCode: string) => {
  const unitCode = extractUnitCode(rawCode)

  const product = await getProductDetailByUnitCode(unitCode)

  setScannedProduct(product)
  setScannerDialogOpen(true)
}
```

Cuando el modal esté abierto se puede desactivar temporalmente el listener:

```ts
useInventoryScanner({
  onScanCode: handleScanCode,
  enabled: !scannerDialogOpen,
})
```

---

## 4. Servicio de búsqueda por `unitCode`

Crear o reutilizar un servicio cuya responsabilidad sea obtener toda la información necesaria para representar el detalle de una unidad mediante:

```text
unitCode
```

Ejemplo conceptual:

```ts
export async function getProductDetailByUnitCode(
  unitCode: string
): Promise<ProductUnitDetailResponse> {
  const response = await api.get<ProductUnitDetailResponse>(
    `/api/telecommunication-item/unit-code/${unitCode}`
  )

  return response.data
}
```

El endpoint definitivo debe ajustarse a la estructura actual del backend.

No realizar primero una petición al servicio general de identificación.

El flujo debe ser directamente:

```text
DataMatrix
→ unitCode
→ búsqueda de producto
```

---

## 5. DTO de detalle

El response deberá proporcionar la información necesaria para pintar tanto los datos actuales como su histórico.

Estructura conceptual:

```ts
export interface ProductUnitDetailResponse {
  unitCode: string
  identifierCode: string

  modelName: string
  modelImage?: string | null

  status: string

  worker?: string | null
  warehouse?: string | null

  createdAt: string

  observation?: string | null

  history: ProductHistoryItem[]
}
```

Histórico:

```ts
export interface ProductHistoryItem {
  type: string
  title: string

  description?: string | null

  performedBy?: string | null

  date: string
}
```

El histórico debe obtenerse utilizando también el `unitCode`, ya que las tablas snapshot/históricas están desacopladas de la entidad actual y no disponen de una relación mediante ID.

---

## 6. Componente reutilizable de detalle

Crear un único componente encargado de representar la información:

```tsx
<ProductUnitDetail />
```

Este componente debe reutilizarse tanto en:

```text
Drawer manual
```

como en:

```text
Modal de escaneo
```

Ejemplo:

```tsx
type ProductUnitDetailProps = {
  product: ProductUnitDetailResponse
}

export function ProductUnitDetail({
  product,
}: ProductUnitDetailProps) {
  return (
    <div className="space-y-6">
      <ProductUnitHeader product={product} />

      <ProductUnitInformation product={product} />

      <ProductUnitHistory history={product.history} />
    </div>
  )
}
```

---

## 7. Información de la unidad

Mostrar:

```text
Modelo
Identificador único / MAC / Serial
Código asociado
Estado
Trabajador
Almacén
Fecha de registro
Observación
```

Cuando no exista trabajador:

```text
Sin asignar
```

Cuando algún dato opcional no exista, utilizar el fallback visual utilizado actualmente por la aplicación.

Los estados deben reutilizar los mismos `Badge` o componentes visuales utilizados en las tablas actuales.

---

## 8. Histórico asociado

Representar el histórico mediante una línea temporal.

Ejemplo conceptual:

```text
Historial asociado

1  Asignación
   Asignado a María
   12/09/2026, 20:21
   Realizado por ROY

2  Entrada
   Registrado en inventario
   12/09/2026, 16:44
   Realizado por ROY
```

No representar el histórico como una segunda tabla.

Utilizar el orden cronológico definido por el backend.

---

## 9. Apertura manual mediante Drawer

En el detalle de un modelo, mantener la tabla actual.

Al pulsar una fila:

```tsx
const handleProductClick = async (unitCode: string) => {
  const product = await getProductDetailByUnitCode(unitCode)

  setSelectedProduct(product)
  setProductDrawerOpen(true)
}
```

La fila completa debe seguir siendo clickable.

El Drawer reutilizará:

```tsx
<ProductUnitDetail product={selectedProduct} />
```

Estructura:

```tsx
<Sheet
  open={productDrawerOpen}
  onOpenChange={setProductDrawerOpen}
>
  <SheetContent side="right">
    {selectedProduct && (
      <ProductUnitDetail
        product={selectedProduct}
      />
    )}
  </SheetContent>
</Sheet>
```

---

## 10. Apertura mediante escáner

Cuando el producto se encuentre mediante escaneo se mostrará mediante un `Dialog`.

```tsx
<Dialog
  open={scannerDialogOpen}
  onOpenChange={setScannerDialogOpen}
>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>
        Producto encontrado
      </DialogTitle>

      <DialogDescription>
        Producto localizado mediante código de unidad.
      </DialogDescription>
    </DialogHeader>

    {scannedProduct && (
      <ProductUnitDetail
        product={scannedProduct}
      />
    )}
  </DialogContent>
</Dialog>
```

El contenido mostrado debe ser el mismo que en el Drawer.

La diferencia únicamente será el contenedor:

```text
Acceso manual → Drawer

Acceso mediante escáner → Dialog
```

---

## 11. Vista principal de Productos

Activar el listener del escáner desde la página principal de Productos.

No obligar al usuario a entrar previamente en un modelo.

Añadir una indicación visual que permita entender que el escaneo está disponible.

Ejemplo:

```tsx
<Button
  variant="outline"
  className="gap-2"
>
  <ScanLine className="size-4" />
  Escanear producto
</Button>
```

Este botón puede utilizarse como indicador o acción visual, pero el listener del escáner puede permanecer activo mientras la página de Productos esté abierta.

Ubicación recomendada:

```text
Productos                         [ Escanear producto ]
Consulta productos...

[ Productos ] [ Consumibles ]

[ Buscar modelo... ]

[ Tabla de modelos ]
```

---

## 12. Arquitectura final

```text
                    PRODUCTOS
                        │
            ┌───────────┴───────────┐
            │                       │
       FLUJO MANUAL            FLUJO ESCÁNER
            │                       │
     seleccionar modelo          DataMatrix
            │                       │
     tabla de unidades         últimos 12 chars
            │                       │
       click unidad              unitCode
            │                       │
        unitCode              búsqueda backend
            │                       │
     búsqueda backend               │
            │                       │
          Drawer                   Dialog
            │                       │
            └───────────┬───────────┘
                        │
               ProductUnitDetail
                        │
          ┌─────────────┴─────────────┐
          │                           │
     Datos actuales              Histórico
```

El componente `ProductUnitDetail` debe ser la única implementación visual del detalle de una unidad y debe reutilizarse en ambos flujos.
