import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../api/rtkBaseQuery";
import type { DeleteBrandParams } from "../../interface/brand/request/delete-brand-params";
import type { CreateBrandRequest } from "../../interface/brand/request/create-brand-request";
import type { UpdateBrandParams } from "../../interface/brand/request/update-brand-params";
import type { Brand } from "../../interface/brand/type/brand-base";

export const brandApi = createApi({
  reducerPath: "brandApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    createBrand: builder.mutation<void, CreateBrandRequest>({
      query: (payload) => ({
        url: "/fleet/brands",
        method: "POST",
        body: {
          name: payload.name.trim(),
        },
      }),
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation<void, UpdateBrandParams>({
      query: ({ id, request }) => ({
        url: `/fleet/brands/${id}`,
        method: "PUT",
        body: {
          name: request.name.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Brand", id }, "Brand"],
    }),
    findBrandById: builder.query<Brand, number>({
      query: (id) => ({
        url: `/fleet/brands/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Brand", id }, "Brand"],
    }),
    findAllBrands: builder.query<Brand[], void>({
      query: () => ({
        url: "/fleet/brands",
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
    searchBrands: builder.query<Brand[], string>({
      query: (search) => ({
        url: "/fleet/brands",
        method: "GET",
        params: {
          search: search.trim(),
        },
      }),
      providesTags: ["Brand"],
    }),
    deleteBrand: builder.mutation<void, DeleteBrandParams>({
      query: ({ id }) => ({
        url: `/fleet/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Brand", id }, "Brand"],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useFindBrandByIdQuery,
  useFindAllBrandsQuery,
  useSearchBrandsQuery,
  useDeleteBrandMutation,
} = brandApi;
