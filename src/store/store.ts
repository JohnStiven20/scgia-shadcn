import { configureStore } from "@reduxjs/toolkit"

import { commonApi } from "@/api/commonApi"
import { employeesApi } from "@/features/employees/api/employeesApi"
import { workerTypeApi } from "@/features/employees/employee-types/api/workerTypeApi"
import { brandApi } from "@/features/fleet/api/apiBrand"
import { vehicleApi } from "@/features/fleet/api/apiVehicle"
import { vehicleDocumentApi } from "@/features/fleet/api/apiVehicleDocument"
import { vehicleModelApi } from "@/features/fleet/api/apiVehicleModel"
import { workerApi } from "@/features/employees/worker/api/workerApi"
import { workerContractApi } from "@/features/employees/worker/api/workerContractApi"
import { workerDocumentApi } from "@/features/employees/worker/api/workerDocumentApi"
import { traceabilityApi } from "@/features/inventory/traceability/api/traceabilityApi"
import { modelsApi } from "@/features/inventory/api/modelsApi"
import { identificationApi } from "@/features/inventory/api/identificationApi"
import { operationsApi } from "@/features/inventory/api/operations.service"
import { assignmentApi } from "@/features/inventory/assignment/api/assignmentApi"
import { absenceTypeApi } from "@/features/absences/api/absenceTypeApi"
import { absenceRequestApi } from "@/features/absences/api/absenceRequestApi"

export const store = configureStore({
  reducer: {
    [commonApi.reducerPath]: commonApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [workerTypeApi.reducerPath]: workerTypeApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [vehicleDocumentApi.reducerPath]: vehicleDocumentApi.reducer,
    [vehicleModelApi.reducerPath]: vehicleModelApi.reducer,
    [workerApi.reducerPath]: workerApi.reducer,
    [workerContractApi.reducerPath]: workerContractApi.reducer,
    [workerDocumentApi.reducerPath]: workerDocumentApi.reducer,
    [traceabilityApi.reducerPath]: traceabilityApi.reducer,
    [modelsApi.reducerPath]: modelsApi.reducer,
    [identificationApi.reducerPath]: identificationApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
    [assignmentApi.reducerPath]: assignmentApi.reducer,
    [absenceTypeApi.reducerPath]: absenceTypeApi.reducer,
    [absenceRequestApi.reducerPath]: absenceRequestApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(commonApi.middleware)
      .concat(employeesApi.middleware)
      .concat(workerTypeApi.middleware)
      .concat(brandApi.middleware)
      .concat(vehicleApi.middleware)
      .concat(vehicleDocumentApi.middleware)
      .concat(vehicleModelApi.middleware)
      .concat(workerApi.middleware)
      .concat(workerContractApi.middleware)
      .concat(workerDocumentApi.middleware)
      .concat(traceabilityApi.middleware)
      .concat(modelsApi.middleware)
      .concat(identificationApi.middleware)
      .concat(operationsApi.middleware)
      .concat(assignmentApi.middleware)
      .concat(absenceTypeApi.middleware)
      .concat(absenceRequestApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
