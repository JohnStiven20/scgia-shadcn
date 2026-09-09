import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { CreateWorkerRequest } from "@/features/interface/worker/request/create-worker-request"
import type { Worker } from "@/features/interface/worker/type/worker.inteface"

export type UpdateWorkerParams = {
  id: number
  request: CreateWorkerRequest
}

export type DeleteWorkerParams = {
  id: number
}

export const workerApi = createApi({
  reducerPath: "workerApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Worker"],
  endpoints: (builder) => ({
    getWorkerById: builder.query<Worker, number>({
      query: (id) => ({
        url: `/worker/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Worker", id }],
    }),
    updateWorker: builder.mutation<Worker, UpdateWorkerParams>({
      query: ({ id, request }) => ({
        url: `/worker/${id}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Worker", id }],
    }),
    deleteWorker: builder.mutation<void, DeleteWorkerParams>({
      query: ({ id }) => ({
        url: `/worker/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Worker", id }],
    }),
  }),
})

export const {
  useGetWorkerByIdQuery,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
} = workerApi
