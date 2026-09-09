# Flota: filtros y paginación en cliente

## Carga y caché

`VehiclesPage` obtiene el catálogo completo mediante
`useFindAllVehiclesQuery()`. La única petición de carga es:

```text
GET /fleet/vehicles/all
```

La respuesta es `Vehicle[]` y RTK Query la conserva en Redux bajo `vehicleApi`.
Las mutaciones de vehículos invalidan el tag `Vehicle`, por lo que el catálogo
se recarga solo tras una operación que cambie los datos.

No se usa `searchVehicles` en la página principal de flota. Ese endpoint se
mantiene disponible en la API para otros flujos que requieran búsqueda remota.

## Filtros locales

La toolbar de la tabla se conecta directamente a TanStack Table. Todos los
cambios se procesan sobre el array cacheado, sin botón de aplicación ni nuevas
peticiones HTTP.

- Código interno, matrícula y VIN usan coincidencia parcial sin distinción de
  mayúsculas.
- Modelo y empleado se generan a partir de valores únicos del catálogo cargado.
- Disponible filtra el booleano `available`.
- Limpiar elimina los filtros y vuelve a la primera página.
- Cada cambio de filtro también reinicia la paginación a la primera página.

## Tabla y paginación

`DataTable` aplica ordenación, filtrado y paginación del lado del cliente. La
tabla muestra Código, Matrícula, Modelo, Estado, Conductor, Ubicación, Última
conexión y acceso visual.

- El estado se obtiene de `vehicle.status`.
- Conductor combina `workerName` y `workerSurname`; si no existe, muestra
  “Sin asignar”.
- Ubicación usa `warehouseName`; si no existe, muestra “Sin ubicación”.
- El backend no entrega última conexión, por lo que la columna muestra “Sin
  datos”.
- El tamaño inicial es 8 registros por página, con opciones 8, 10, 20 y 50.

El botón “Nuevo vehículo” es visual en esta fase; el detalle y CRUD de vehículos
no forman parte de este flujo.

## Verificación manual

1. Abrir Flota y confirmar una sola llamada a `/fleet/vehicles/all`.
2. Cambiar filtros, ordenar columnas, navegar páginas y cambiar el tamaño de
   página; no debe producirse ninguna llamada adicional.
3. Probar combinaciones de filtros y resultados vacíos.
4. Crear, editar o eliminar un vehículo desde futuros flujos y confirmar que la
   invalidación del tag `Vehicle` refresca el catálogo.
