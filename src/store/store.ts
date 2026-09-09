import { configureStore } from "@reduxjs/toolkit"

import { employeesApi } from "@/features/employees/api/employeesApi"
import { workerTypeApi } from "@/features/employees/employee-types/api/workerTypeApi"
import { workerApi } from "@/features/employees/worker/api/workerApi"
import { workerContractApi } from "@/features/employees/worker/api/workerContractApi"
import { traceabilityApi } from "@/features/inventory/traceability/api/traceabilityApi"

export const store = configureStore({
  reducer: {
    [employeesApi.reducerPath]: employeesApi.reducer,
    [workerTypeApi.reducerPath]: workerTypeApi.reducer,
    [workerApi.reducerPath]: workerApi.reducer,
    [workerContractApi.reducerPath]: workerContractApi.reducer,
    [traceabilityApi.reducerPath]: traceabilityApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(employeesApi.middleware)
      .concat(workerTypeApi.middleware)
      .concat(workerApi.middleware)
      .concat(workerContractApi.middleware)
      .concat(traceabilityApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
