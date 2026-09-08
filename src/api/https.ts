import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export const https = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

https.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

https.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }

    return Promise.reject(error);
  },
);

export default https;
