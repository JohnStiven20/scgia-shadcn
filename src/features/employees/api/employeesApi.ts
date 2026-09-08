import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { PageResponse } from "../../../types/api/page-response";
import type { CreateWorkerRequest, SearchWorkersParams } from "@/features/interface/worker/request/create-worker-request";


export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Employees"],
  endpoints: (builder) => ({
    createWorker: builder.mutation<void, CreateWorkerRequest>({
      query: (payload) => ({
        url: "/worker",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Employees"],
    }),
    searchWorkers: builder.query<PageResponse<Worker>, SearchWorkersParams | void>({
      query: (params) => ({
        url: "/worker/search",
        method: "GET",
        params: {
          firstName: params?.firstName,
          surname: params?.surname,
          dni: params?.dni,
          email: params?.email,
          phone: params?.phone,
          active: params?.active,
          employeeCode: params?.employeeCode,
          workerTypeId: params?.workerTypeId,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
        },
      }),
      providesTags: ["Employees"],
    }),
  }),
});

export const { useCreateWorkerMutation, useSearchWorkersQuery } = employeesApi;
