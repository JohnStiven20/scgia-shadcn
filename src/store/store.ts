import { configureStore } from "@reduxjs/toolkit"

import { employeesApi } from "@/features/employees/api/employeesApi"
import { workerTypeApi } from "@/features/employees/employee-types/api/workerTypeApi"
import { brandApi } from "@/features/fleet/api/apiBrand"
import { vehicleApi } from "@/features/fleet/api/apiVehicle"
import { vehicleModelApi } from "@/features/fleet/api/apiVehicleModel"
import { traceabilityApi } from "@/features/inventory/traceability/api/traceabilityApi"
import { modelsApi } from "@/features/inventory/models/api/modelsApi"

export const store = configureStore({
  reducer: {
    [employeesApi.reducerPath]: employeesApi.reducer,
    [workerTypeApi.reducerPath]: workerTypeApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [vehicleModelApi.reducerPath]: vehicleModelApi.reducer,
    [traceabilityApi.reducerPath]: traceabilityApi.reducer,
    [modelsApi.reducerPath]: modelsApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(employeesApi.middleware)
      .concat(workerTypeApi.middleware)
      .concat(brandApi.middleware)
      .concat(vehicleApi.middleware)
      .concat(vehicleModelApi.middleware)
      .concat(traceabilityApi.middleware)
      .concat(modelsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
