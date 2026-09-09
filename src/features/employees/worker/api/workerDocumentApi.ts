import { createApi } from "@reduxjs/toolkit/query/react"

import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { WorkerTrainingDocument } from "@/features/interface/worker-document/type/worker-document.interface"
import type { WorkerTrainingDocumentRequest } from "@/features/interface/worker-document/response/worker-document-request"

export type CreateWorkerTrainingDocumentRequest = WorkerTrainingDocumentRequest

export type UpdateWorkerTrainingDocumentRequest =
  WorkerTrainingDocumentRequest & {
    active?: boolean | null
  }
export type CreateWorkerTrainingDocumentParams = {
  request: CreateWorkerTrainingDocumentRequest
  file: File
}

export type UpdateWorkerTrainingDocumentParams = {
  id: number
  request: UpdateWorkerTrainingDocumentRequest
  file?: File | null
}

export type DeleteWorkerTrainingDocumentParams = {
  id: number
  workerId: number
}

const buildWorkerTrainingDocumentFormData = (
  request:
    | CreateWorkerTrainingDocumentRequest
    | UpdateWorkerTrainingDocumentRequest,
  file?: File | null
) => {
  const formData = new FormData()

  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" })
  )

  if (file) {
    formData.append("file", file)
  }

  return formData
}

export const workerDocumentApi = createApi({
  reducerPath: "workerDocumentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkerTrainingDocuments"],
  endpoints: (builder) => ({
    getWorkerTrainingDocumentById: builder.query<
      WorkerTrainingDocument,
      number
    >({
      query: (id) => ({
        url: `/worker-training-document/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "WorkerTrainingDocuments", id },
      ],
    }),
    getWorkerTrainingDocumentsByWorkerId: builder.query<
      WorkerTrainingDocument[],
      number
    >({
      query: (workerId) => ({
        url: `/worker-training-document/worker/${workerId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, workerId) => [
        { type: "WorkerTrainingDocuments", id: `worker-${workerId}` },
      ],
    }),
    createWorkerTrainingDocument: builder.mutation<
      void,
      CreateWorkerTrainingDocumentParams
    >({
      query: ({ request, file }) => ({
        url: "/worker-training-document",
        method: "POST",
        body: buildWorkerTrainingDocumentFormData(request, file),
      }),
      invalidatesTags: (_result, _error, { request }) => [
        { type: "WorkerTrainingDocuments", id: `worker-${request.workerId}` },
      ],
    }),
    updateWorkerTrainingDocument: builder.mutation<
      void,
      UpdateWorkerTrainingDocumentParams
    >({
      query: ({ id, request, file }) => ({
        url: `/worker-training-document/${id}`,
        method: "PUT",
        body: buildWorkerTrainingDocumentFormData(request, file),
      }),
      invalidatesTags: (_result, _error, { id, request }) => [
        { type: "WorkerTrainingDocuments", id },
        { type: "WorkerTrainingDocuments", id: `worker-${request.workerId}` },
      ],
    }),
    deleteWorkerTrainingDocument: builder.mutation<
      void,
      DeleteWorkerTrainingDocumentParams
    >({
      query: ({ id }) => ({
        url: `/worker-training-document/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, workerId }) => [
        { type: "WorkerTrainingDocuments", id },
        { type: "WorkerTrainingDocuments", id: `worker-${workerId}` },
      ],
    }),
  }),
})

export const {
  useGetWorkerTrainingDocumentByIdQuery,
  useGetWorkerTrainingDocumentsByWorkerIdQuery,
  useCreateWorkerTrainingDocumentMutation,
  useUpdateWorkerTrainingDocumentMutation,
  useDeleteWorkerTrainingDocumentMutation,
} = workerDocumentApi
