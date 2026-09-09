import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../types/api/page-response";
import type { AssignVehicleParams } from "../../interface/vehicle/request/assign-vehicle-params";
import type { ChangeVehicleStatusParams } from "../../interface/vehicle/request/change-vehicle-status-params";
import type { CreateVehicleRequest } from "../../interface/vehicle/request/create-vehicle-request";
import type { DeleteVehicleParams } from "../../interface/vehicle/request/delete-vehicle-params";
import type { ReturnVehicleParams } from "../../interface/vehicle/request/return-vehicle-params";
import type { SearchVehicleParams } from "../../interface/vehicle/request/search-vehicle-params";
import type { UpdateVehicleSettingsParams } from "../../interface/vehicle/request/update-vehicle-settings-params";
import type { UpdateVehicleParams } from "../../interface/vehicle/request/update-vehicle-params";
import type { Vehicle } from "../../interface/vehicle/type/vehicle-base";
import type { VehicleLookup } from "../../interface/vehicle/type/vehicle-lookup-base";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Vehicle"],
  endpoints: (builder) => ({
    createVehicle: builder.mutation<void, CreateVehicleRequest>({
      query: (payload) => ({
        url: "/fleet/vehicles",
        method: "POST",
        body: {
          internalCode: payload.internalCode.trim(),
          licensePlate: payload.licensePlate.trim(),
          vin: payload.vin.trim(),
          currentOdometer: payload.currentOdometer ?? null,
          modelId: payload.modelId,
          notes:payload.notes,
          color:payload.color,
          initialOdometer:payload.initialOdometer,
          firstRegistrationDate:payload.firstRegistrationDate,
          warehouseId: payload.warehouseId ?? null,
        },
      }),
      invalidatesTags: ["Vehicle"],
    }),
    updateVehicle: builder.mutation<void, UpdateVehicleParams>({
      query: ({ id, request }) => ({
        url: `/fleet/vehicles/${id}`,
        method: "PATCH",
        body: {
          internalCode: request.internalCode.trim(),
          licensePlate: request.licensePlate.trim(),
          vin: request.vin.trim(),
          initialOdometer: request.initialOdometer ?? null,
          firstRegistrationDate: request.firstRegistrationDate ?? null,
          status: request.status,
          available: request.available,
          currentOdometer: request.currentOdometer ?? null,
          color: request.color ?? null,
          notes: request.notes ?? null,
          modelId: request.modelId,
          workerId: request.workerId ?? null,
          warehouseId: request.warehouseId ?? null,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    updateVehicleSettings: builder.mutation<void, UpdateVehicleSettingsParams>({
      query: ({ id, request }) => ({
        url: `/fleet/vehicles/${id}/settings`,
        method: "PUT",
        body: {
          workerId: request.workerId ?? null,
          available: request.available,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    assignVehicle: builder.mutation<void, AssignVehicleParams>({
      query: ({ id, request }) => ({
        url: `/fleet/vehicles/${id}/assignment`,
        method: "PUT",
        body: {
          workerId: request.workerId,
          odometer: request.odometer ?? null,
          fuelLevel: request.fuelLevel ?? null,
          tyreCondition: request.tyreCondition?.trim() || null,
          bodyCondition: request.bodyCondition?.trim() || null,
          observation: request.observation?.trim() || null,
          performedByAccountUsername: request.performedByAccountUsername.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    returnVehicle: builder.mutation<void, ReturnVehicleParams>({
      query: ({ id, request }) => ({
        url: `/fleet/vehicles/${id}/return`,
        method: "PUT",
        body: {
          odometer: request.odometer ?? null,
          fuelLevel: request.fuelLevel ?? null,
          tyreCondition: request.tyreCondition?.trim() || null,
          bodyCondition: request.bodyCondition?.trim() || null,
          observation: request.observation?.trim() || null,
          performedByAccountUsername: request.performedByAccountUsername.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    changeVehicleStatus: builder.mutation<void, ChangeVehicleStatusParams>({
      query: ({ id, request }) => ({
        url: `/fleet/vehicles/${id}/status`,
        method: "PUT",
        body: {
          status: request.status,
          observation: request.observation?.trim() || null,
          performedByAccountUsername: request.performedByAccountUsername.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    findVehicleById: builder.query<Vehicle, number>({
      query: (id) => ({
        url: `/fleet/vehicles/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
    findTopVehiclesByInternalCodeOrLicensePlate: builder.query<VehicleLookup[], string>({
      query: (search) => ({
        url: "/fleet/vehicles",
        method: "GET",
        params: {
          search: search.trim(),
        },
      }),
      providesTags: ["Vehicle"],
    }),
    findAllVehicles: builder.query<Vehicle[], void>({
      query: () => ({
        url: "/fleet/vehicles/all",
        method: "GET",
      }),
      providesTags: ["Vehicle"],
    }),
    searchVehicles: builder.query<PageResponse<Vehicle>, SearchVehicleParams | void>({
      query: (params) => ({
        url: "/fleet/vehicles/search",
        method: "GET",
        params: {
          internalCode: params?.internalCode,
          licensePlate: params?.licensePlate,
          vin: params?.vin,
          modelId: params?.modelId,
          workerId: params?.workerId,
          available: params?.available,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["Vehicle"],
    }),
    deleteVehicle: builder.mutation<void, DeleteVehicleParams>({
      query: ({ id }) => ({
        url: `/fleet/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Vehicle", id }, "Vehicle"],
    }),
  }),
});

export const {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useUpdateVehicleSettingsMutation,
  useAssignVehicleMutation,
  useReturnVehicleMutation,
  useChangeVehicleStatusMutation,
  useFindVehicleByIdQuery,
  useFindTopVehiclesByInternalCodeOrLicensePlateQuery,
  useFindAllVehiclesQuery,
  useSearchVehiclesQuery,
  useDeleteVehicleMutation,
} = vehicleApi;
