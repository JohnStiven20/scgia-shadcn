import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./apiConfig";

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 10000,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
