import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../types/api/page-response";
import type { CreateVehicleDocumentRequest } from "../../interface/vehicle/request/create-vehicle-document-request";
import type { SearchVehicleDocumentsParams } from "../../interface/vehicle/request/search-vehicle-documents-params";
import type { UpdateVehicleDocumentParams } from "../../interface/vehicle/request/update-vehicle-document-params";
import type { VehicleDocumentResponse } from "../../interface/vehicle/response/vehicle-document-response";

function appendVehicleDocumentFormData(
  formData: FormData,
  request: {
    vehicleId: number;
    documentType: string;
    title: string;
    issueDate?: string | null;
    expirationDate?: string | null;
    workerId?: number | null;
    active?: boolean | null;
    notes?: string | null;
    storedFileIdsToDelete?: number[];
    files?: File[];
  },
) {
  const payload = {
    vehicleId: request.vehicleId,
    documentType: request.documentType,
    title: request.title.trim(),
    issueDate: request.issueDate ?? null,
    expirationDate: request.expirationDate ?? null,
    workerId: request.workerId ?? null,
    active: request.active ?? true,
    notes: request.notes?.trim() || null,
    storedFileIdsToDelete: request.storedFileIdsToDelete,
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );

  request.files?.forEach((file) => {
    formData.append("files", file);
  });
}

export const vehicleDocumentApi = createApi({
  reducerPath: "vehicleDocumentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["VehicleDocument"],
  endpoints: (builder) => ({
    createVehicleDocument: builder.mutation<void, CreateVehicleDocumentRequest>({
      query: (request) => {
        const formData = new FormData();
        appendVehicleDocumentFormData(formData, request);

        return {
          url: "/fleet/vehicle-documents",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["VehicleDocument"],
    }),
    updateVehicleDocument: builder.mutation<void, UpdateVehicleDocumentParams>({
      query: ({ id, request }) => {
        const formData = new FormData();
        appendVehicleDocumentFormData(formData, request);

        return {
          url: `/fleet/vehicle-documents/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "VehicleDocument", id }, "VehicleDocument"],
    }),
    findAllVehicleDocumentsByVehicle: builder.query<PageResponse<VehicleDocumentResponse>, SearchVehicleDocumentsParams>({
      query: ({ vehicleId }) => ({
        url: "/fleet/vehicle-documents/search",
        method: "GET",
        params: {
          vehicleId,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((item) => ({ type: "VehicleDocument" as const, id: item.id })),
              "VehicleDocument",
            ]
          : ["VehicleDocument"],
    }),
  }),
});

export const {
  useCreateVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
  useFindAllVehicleDocumentsByVehicleQuery,
} = vehicleDocumentApi;
