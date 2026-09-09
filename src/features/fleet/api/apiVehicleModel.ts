import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../types/api/page-response";
import type { CreateVehicleModelRequest } from "../../interface/vehicle-model/request/create-vehicle-model-request";
import type { DeleteVehicleModelParams } from "../../interface/vehicle-model/request/delete-vehicle-model-params";
import type { SearchVehicleModelParams } from "../../interface/vehicle-model/request/search-vehicle-model-params";
import type { UpdateVehicleModelParams } from "../../interface/vehicle-model/request/update-vehicle-model-params";
import type { VehicleModel } from "../../interface/vehicle-model/type/vehicle-model-base";

export const vehicleModelApi = createApi({
  reducerPath: "vehicleModelApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["VehicleModel"],
  endpoints: (builder) => ({
    createVehicleModel: builder.mutation<void, CreateVehicleModelRequest>({
      query: (payload) => ({
        url: "/fleet/models",
        method: "POST",
        body: {
          name: payload.name.trim(),
          commercialName: payload.commercialName ?? null,
          year: payload.year ?? null,
          vehicleType: payload.vehicleType ?? null,
          bodyType: payload.bodyType ?? null,
          fuelType: payload.fuelType,
          transmissionType: payload.transmissionType,
          numberOfSeats: payload.numberOfSeats ?? null,
          maxAuthorizedMassKg: payload.maxAuthorizedMassKg ?? null,
          curbWeightKg: payload.curbWeightKg ?? null,
          payloadCapacityKg: payload.payloadCapacityKg ?? null,
          engineDisplacementCc: payload.engineDisplacementCc ?? null,
          enginePowerKw: payload.enginePowerKw ?? null,
          emissionStandard: payload.emissionStandard ?? null,
          brandId: payload.brandId,
        },
      }),
      invalidatesTags: ["VehicleModel"],
    }),
    updateVehicleModel: builder.mutation<void, UpdateVehicleModelParams>({
      query: ({ id, request }) => ({
        url: `/fleet/models/${id}`,
        method: "PUT",
        body: {
          name: request.name.trim(),
          commercialName: request.commercialName ?? null,
          year: request.year ?? null,
          vehicleType: request.vehicleType ?? null,
          bodyType: request.bodyType ?? null,
          fuelType: request.fuelType,
          transmissionType: request.transmissionType,
          numberOfSeats: request.numberOfSeats ?? null,
          maxAuthorizedMassKg: request.maxAuthorizedMassKg ?? null,
          curbWeightKg: request.curbWeightKg ?? null,
          payloadCapacityKg: request.payloadCapacityKg ?? null,
          engineDisplacementCc: request.engineDisplacementCc ?? null,
          enginePowerKw: request.enginePowerKw ?? null,
          emissionStandard: request.emissionStandard ?? null,
          brandId: request.brandId,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "VehicleModel", id }, "VehicleModel"],
    }),
    findVehicleModelById: builder.query<VehicleModel, number>({
      query: (id) => ({
        url: `/fleet/models/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "VehicleModel", id }, "VehicleModel"],
    }),
    findTopVehicleModelsByName: builder.query<VehicleModel[], string | void>({
      query: (search) => ({
        url: "/fleet/models",
        method: "GET",
        params: {
          search: search?.trim() || undefined,
        },
      }),
      providesTags: ["VehicleModel"],
    }),
    searchVehicleModels: builder.query<PageResponse<VehicleModel>, SearchVehicleModelParams | void>({
      query: (params) => ({
        url: "/fleet/models/search",
        method: "GET",
        params: {
          name: params?.name,
          year: params?.year,
          fuelType: params?.fuelType,
          transmissionType: params?.transmissionType,
          brandId: params?.brandId,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["VehicleModel"],
    }),
    deleteVehicleModel: builder.mutation<void, DeleteVehicleModelParams>({
      query: ({ id }) => ({
        url: `/fleet/models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "VehicleModel", id }, "VehicleModel"],
    }),
  }),
});

export const {
  useCreateVehicleModelMutation,
  useUpdateVehicleModelMutation,
  useFindVehicleModelByIdQuery,
  useFindTopVehicleModelsByNameQuery,
  useSearchVehicleModelsQuery,
  useDeleteVehicleModelMutation,
} = vehicleModelApi;
