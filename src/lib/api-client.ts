import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TOKEN_STORAGE_KEY } from "@/types/constants";
import type { ApiErrorResponse } from "@/types/api.types";

export class ApiError extends Error {
  public statusCode: number;
  public errorType: string;

  constructor(statusCode: number, errorType: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

function attachAuthToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function handleResponseError(error: AxiosError<ApiErrorResponse>): never {
  if (error.response?.status === 401) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem("pawn_user");
    window.location.href = "/";
  }

  const statusCode = error.response?.status ?? 500;
  const errorType = error.response?.data?.error ?? "Network Error";
  const message = error.response?.data?.message ?? error.message;

  throw new ApiError(statusCode, errorType, message);
}

const apiClient = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(attachAuthToken);
apiClient.interceptors.response.use(
  (response) => response,
  handleResponseError,
);

export default apiClient;
