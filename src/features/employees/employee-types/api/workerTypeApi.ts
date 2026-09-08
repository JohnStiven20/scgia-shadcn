import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../../types/api/page-response";
import type { CreateWorkerTypeRequest } from "../../interface/worker-type/request/create-worker-type-request";
import type { WorkerTypeInterface } from "../../interface/worker-type/type/worker-type-interface";

export type GetWorkerTypesParams = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type UpdateWorkerTypeParams = {
  id: number;
  request: CreateWorkerTypeRequest;
};

export type DeleteWorkerTypeParams = {
  id: number;
};

export const workerTypeApi = createApi({
  reducerPath: "workerTypeApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkerTypes"],
  endpoints: (builder) => ({
    getWorkerTypes: builder.query<PageResponse<WorkerTypeInterface>, GetWorkerTypesParams | void>({
      query: (params) => ({
        url: "/worker-type",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["WorkerTypes"],
    }),
    createWorkerType: builder.mutation<void, CreateWorkerTypeRequest>({
      query: (payload) => ({
        url: "/worker-type",
        method: "POST",
        body: {
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          active: payload.active,
        },
      }),
      invalidatesTags: ["WorkerTypes"],
    }),
    updateWorkerType: builder.mutation<void, UpdateWorkerTypeParams>({
      query: ({ id, request }) => ({
        url: `/worker-type/${id}`,
        method: "PUT",
        body: {
          name: request.name.trim(),
          description: request.description?.trim() || null,
          active: request.active,
        },
      }),
      invalidatesTags: ["WorkerTypes"],
    }),
    deleteWorkerType: builder.mutation<void, DeleteWorkerTypeParams>({
      query: ({ id }) => ({
        url: `/worker-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkerTypes"],
    }),
  }),
});

export const {
  useGetWorkerTypesQuery,
  useCreateWorkerTypeMutation,
  useUpdateWorkerTypeMutation,
  useDeleteWorkerTypeMutation,
} = workerTypeApi;
