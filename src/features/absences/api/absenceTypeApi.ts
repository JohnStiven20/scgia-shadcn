import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/api/rtkBaseQuery";
import type { PageResponse } from "@/types/api/page-response";
import type { CreateAbsenceTypeRequest } from "@/features/interface/absence-type/request/create-absence-type-request";
import type { DeleteAbsenceTypeParams } from "@/features/interface/absence-type/request/delete-absence-type-params";
import type { GetAbsenceTypesParams } from "@/features/interface/absence-type/request/get-absence-types-params";
import type { UpdateAbsenceTypeParams } from "@/features/interface/absence-type/request/update-absence-type-params";
import type { AbsenceTypeResponse } from "@/features/interface/absence-type/response/absence-type-response";

export const absenceTypeApi = createApi({
  reducerPath: "absenceTypeApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AbsenceType"],
  endpoints: (builder) => ({
    getAbsenceTypes: builder.query<PageResponse<AbsenceTypeResponse>, GetAbsenceTypesParams | void>({
      query: (params) => ({
        url: "/absence/type",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          search: params?.search?.trim() || undefined,
          sort: params?.sort,
        },
      }),
      providesTags: ["AbsenceType"],
    }),
    createAbsenceType: builder.mutation<void, CreateAbsenceTypeRequest>({
      query: (payload) => ({
        url: "/absence/type",
        method: "POST",
        body: {
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          active: payload.active,
          allowsHalfDay: payload.allowsHalfDay,
          maxDays: payload.maxDays ?? null,
          calendarColor: payload.calendarColor.trim(),
        },
      }),
      invalidatesTags: ["AbsenceType"],
    }),
    updateAbsenceType: builder.mutation<void, UpdateAbsenceTypeParams>({
      query: ({ id, request }) => ({
        url: `/absence/type/${id}`,
        method: "PUT",
        body: {
          name: request.name.trim(),
          description: request.description?.trim() || null,
          active: request.active,
          allowsHalfDay: request.allowsHalfDay,
          maxDays: request.maxDays ?? null,
          calendarColor: request.calendarColor.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "AbsenceType", id }, "AbsenceType"],
    }),
    findAbsenceTypeById: builder.query<AbsenceTypeResponse, number>({
      query: (id) => ({
        url: `/absence/type/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "AbsenceType", id }, "AbsenceType"],
    }),
    deleteAbsenceType: builder.mutation<void, DeleteAbsenceTypeParams>({
      query: ({ id }) => ({
        url: `/absence/type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "AbsenceType", id }, "AbsenceType"],
    }),
  }),
});

export const {
  useGetAbsenceTypesQuery,
  useCreateAbsenceTypeMutation,
  useUpdateAbsenceTypeMutation,
  useFindAbsenceTypeByIdQuery,
  useDeleteAbsenceTypeMutation,
} = absenceTypeApi;
