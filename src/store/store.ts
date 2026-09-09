import { configureStore } from "@reduxjs/toolkit"

import { commonApi } from "@/api/commonApi"
import { employeesApi } from "@/features/employees/api/employeesApi"
import { workerTypeApi } from "@/features/employees/employee-types/api/workerTypeApi"
import { workerApi } from "@/features/employees/worker/api/workerApi"
import { workerContractApi } from "@/features/employees/worker/api/workerContractApi"
import { workerDocumentApi } from "@/features/employees/worker/api/workerDocumentApi"
import { traceabilityApi } from "@/features/inventory/traceability/api/traceabilityApi"
import { modelsApi } from "@/features/inventory/models/api/modelsApi"

export const store = configureStore({
  reducer: {
    [commonApi.reducerPath]: commonApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [workerTypeApi.reducerPath]: workerTypeApi.reducer,
    [workerApi.reducerPath]: workerApi.reducer,
    [workerContractApi.reducerPath]: workerContractApi.reducer,
    [workerDocumentApi.reducerPath]: workerDocumentApi.reducer,
    [traceabilityApi.reducerPath]: traceabilityApi.reducer,
    [modelsApi.reducerPath]: modelsApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(commonApi.middleware)
      .concat(employeesApi.middleware)
      .concat(workerTypeApi.middleware)
      .concat(workerApi.middleware)
      .concat(workerContractApi.middleware)
      .concat(workerDocumentApi.middleware)
      .concat(traceabilityApi.middleware)
      .concat(modelsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
