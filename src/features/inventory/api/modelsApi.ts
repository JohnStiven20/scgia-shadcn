import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../types/api/page-response";
import type {
  CreateIdentifierRequest,
  CreateModelRequest,
  PartialUpdateModelRequest,
  ProviderResponse,
  TelecommunicationItemModelIdentifierResponse,
  TelecommunicationItemModelResponse,
  UpdateIdentifierRequest,
  UpdateModelRequest,
} from "../../interface/models/types/model.types";
import type {
  AvailableModelItemsParams,
  ModelIdentifierListResponse,
  SpringPageResponse,
  TelecommunicationItemSelectionResponse,
  TelecommunicationModelSelectionParams,
  TelecommunicationModelSelectionResponse,
} from "../../interface/models/types/selection.types";

export const modelsApi = createApi({
  
  reducerPath: "modelsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Model", "Provider", "Identifier"],
  endpoints: (builder) => ({
    getModelCatalog: builder.query<TelecommunicationItemModelResponse[], void>({
      query: () => ({
        url: "telecomunication-model/models/all",
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "Model", id: "LIST" },
        ...(result?.map((model) => ({
          type: "Model" as const,
          id: model.id,
        })) ?? []),
      ],
    }),
    getProviders: builder.query<ProviderResponse[], void>({
      query: () => ({
        url: "/provider",
        method: "GET",
        params: { page: 0, size: 100, sort: "name,asc" },
      }),
      transformResponse: (response: PageResponse<ProviderResponse>) =>
        response.content ?? [],
      providesTags: [{ type: "Provider", id: "LIST" }],
    }),
    getModelIdentifiers: builder.query<
      TelecommunicationItemModelIdentifierResponse[],
      number
    >({
      query: (modelId) => ({
        url: `/telecommunication-item-model-identifier/model/${modelId}`,
        method: "GET",
      }),
      providesTags: (result, _error, modelId) => [
        { type: "Identifier", id: `LIST-${modelId}` },
        ...(result?.map((identifier) => ({
          type: "Identifier" as const,
          id: identifier.id,
        })) ?? []),
      ],
    }),
    getTelecommunicationModelsSelection: builder.query<
      TelecommunicationModelSelectionResponse[],
      TelecommunicationModelSelectionParams
    >({
      query: (params) => ({
        url: "/telecommunication-models/selection",
        method: "GET",
        params,
      }),
    }),
    getSelectionModelIdentifiers: builder.query<
      ModelIdentifierListResponse,
      number
    >({
      query: (modelId) => ({
        url: `/telecommunication-models/${modelId}/identifiers`,
        method: "GET",
      }),
    }),
    getAvailableModelItems: builder.query<
      SpringPageResponse<TelecommunicationItemSelectionResponse>,
      AvailableModelItemsParams
    >({
      query: ({ modelId, page }) => ({
        url: `/telecommunication-models/${modelId}/available-items`,
        method: "GET",
        params: { page },
      }),
    }),
    createModel: builder.mutation<void, CreateModelRequest>({
      query: (request) => ({
        url: "/telecomunication-model/",
        method: "POST",
        body: request,
      }),
      invalidatesTags: [{ type: "Model", id: "LIST" }],
    }),
    updateModel: builder.mutation<
      void,
      { id: number; request: UpdateModelRequest }
    >({
      query: ({ id, request }) => ({
        url: `/telecomunication-model/model/${id}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Model", id },
        { type: "Model", id: "LIST" },
      ],
    }),
    partialUpdateModel: builder.mutation<
      void,
      { id: number; request: PartialUpdateModelRequest }
    >({
      query: ({ id, request }) => ({
        url: `/telecomunication-model/model/parcial/${id}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Model", id },
        { type: "Model", id: "LIST" },
      ],
    }),
    deleteModel: builder.mutation<void, number>({
      query: (id) => ({
        url: `/telecomunication-model/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Model", id },
        { type: "Model", id: "LIST" },
      ],
    }),
    createIdentifier: builder.mutation<void, CreateIdentifierRequest>({
      query: (request) => ({
        url: "/telecommunication-item-model-identifier/",
        method: "POST",
        body: request,
      }),
      invalidatesTags: (_result, _error, request) => [
        {
          type: "Identifier",
          id: `LIST-${request.telecommunicationItemModelId}`,
        },
        { type: "Model", id: "LIST" },
      ],
    }),
    updateIdentifier: builder.mutation<
      void,
      { id: number; modelId: number; request: UpdateIdentifierRequest }
    >({
      query: ({ id, request }) => ({
        url: `/telecommunication-item-model-identifier/${id}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (_result, _error, { id, modelId }) => [
        { type: "Identifier", id },
        { type: "Identifier", id: `LIST-${modelId}` },
        { type: "Model", id: "LIST" },
      ],
    }),
    deleteIdentifier: builder.mutation<void, { id: number; modelId: number }>({
      query: ({ id }) => ({
        url: `/telecommunication-item-model-identifier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, modelId }) => [
        { type: "Identifier", id },
        { type: "Identifier", id: `LIST-${modelId}` },
        { type: "Model", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetModelCatalogQuery,
  useGetProvidersQuery,
  useGetModelIdentifiersQuery,
  useGetTelecommunicationModelsSelectionQuery,
  useGetSelectionModelIdentifiersQuery,
  useGetAvailableModelItemsQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  usePartialUpdateModelMutation,
  useDeleteModelMutation,
  useCreateIdentifierMutation,
  useUpdateIdentifierMutation,
  useDeleteIdentifierMutation,
} = modelsApi;
