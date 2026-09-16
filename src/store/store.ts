import { configureStore } from "@reduxjs/toolkit"

import { commonApi } from "@/api/commonApi"
import { authApi } from "@/features/auth/api/authApi"
import { authReducer } from "@/features/auth/store/authSlice"
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
import { getSpecificModelInventorySummary } from "@/features/inventory/api/products.service"
import { specificModelItemsApi } from "@/features/inventory/api/specificModelItemsApi"
import { getTelecommunicationSpecificItemHistory } from "@/features/inventory/api/telecommunicationSpecificItemHistoryApi"
import { absenceTypeApi } from "@/features/absences/api/absenceTypeApi"
import { absenceRequestApi } from "@/features/absences/api/absenceRequestApi"
import { accountApi } from "@/features/admin/account/api/accountApi"
import { roleApi } from "@/features/admin/roles/api/roleApi"
import { authorizationCatalogApi } from "@/features/admin/roles/api/authorizationCatalogApi"
import { accountRoleApi } from "@/features/api/accountRoleApi"
import { accountSettingApi } from "@/features/api/accountSettingApi"
import { rolePermissionApi } from "@/features/api/rolePermissionApi"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
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
    [getSpecificModelInventorySummary.reducerPath]:
      getSpecificModelInventorySummary.reducer,
    [specificModelItemsApi.reducerPath]: specificModelItemsApi.reducer,
    [getTelecommunicationSpecificItemHistory.reducerPath]:
      getTelecommunicationSpecificItemHistory.reducer,
    [absenceTypeApi.reducerPath]: absenceTypeApi.reducer,
    [absenceRequestApi.reducerPath]: absenceRequestApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [authorizationCatalogApi.reducerPath]: authorizationCatalogApi.reducer,
    [accountRoleApi.reducerPath]: accountRoleApi.reducer,
    [accountSettingApi.reducerPath]: accountSettingApi.reducer,
    [rolePermissionApi.reducerPath]: rolePermissionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
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
      .concat(getSpecificModelInventorySummary.middleware)
      .concat(specificModelItemsApi.middleware)
      .concat(getTelecommunicationSpecificItemHistory.middleware)
      .concat(absenceTypeApi.middleware)
      .concat(absenceRequestApi.middleware)
      .concat(accountApi.middleware)
      .concat(roleApi.middleware)
      .concat(authorizationCatalogApi.middleware)
      .concat(accountRoleApi.middleware)
      .concat(accountSettingApi.middleware)
      .concat(rolePermissionApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
