import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { CreateWorkerContractRequest } from "@/features/interface/worker-contract/request/create-worker-contract-request"
import type { UpdateWorkerContractRequest } from "@/features/interface/worker-contract/request/update-worker-contract-request"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

export type CreateWorkerContractParams = {
  request: CreateWorkerContractRequest
}

export type UpdateWorkerContractParams = {
  id: number
  request: UpdateWorkerContractRequest
}

export type DeleteWorkerContractParams = {
  id: number
  workerId: number
}

export const workerContractApi = createApi({
  reducerPath: "workerContractApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["WorkerContracts"],
  endpoints: (builder) => ({
    getWorkerContractsByWorkerId: builder.query<
      WorkerContract[],
      number
    >({
      query: (workerId) => ({
        url: `/worker-contract/worker/${workerId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, workerId) => [
        { type: "WorkerContracts", id: workerId },
      ],
    }),
    createWorkerContract: builder.mutation<void, CreateWorkerContractParams>({
      query: ({ request }) => ({
        url: "/worker-contract",
        method: "POST",
        body: request,
      }),
      invalidatesTags: (_result, _error, { request }) => [
        { type: "WorkerContracts", id: request.workerId },
      ],
    }),
    updateWorkerContract: builder.mutation<void, UpdateWorkerContractParams>({
      query: ({ id, request }) => ({
        url: `/worker-contract/${id}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (_result, _error, { request }) => [
        { type: "WorkerContracts", id: request.workerId },
      ],
    }),
    deleteWorkerContract: builder.mutation<void, DeleteWorkerContractParams>({
      query: ({ id }) => ({
        url: `/worker-contract/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workerId }) => [
        { type: "WorkerContracts", id: workerId },
      ],
    }),
  }),
})

export const {
  useGetWorkerContractsByWorkerIdQuery,
  useCreateWorkerContractMutation,
  useUpdateWorkerContractMutation,
  useDeleteWorkerContractMutation,
} = workerContractApi
