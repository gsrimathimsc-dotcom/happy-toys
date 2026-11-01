// ---------------------------------------------------------------
// The single Axios client for the ASP.NET Core API.
// It adds the login token, unwraps { success, data } and turns every
// failure into an ApiError with a message that is safe to show.
// ---------------------------------------------------------------
import axios, { type AxiosRequestConfig } from "axios";
import { loadFromStorage, STORAGE_KEYS } from "@/lib/storage";
import type { ApiResponse, AuthResult } from "@/types";

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 if the server could not be reached */
    public readonly status: number,
    /** Messages per form field, for validation failures */
    public readonly fieldErrors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "" });

client.interceptors.request.use((config) => {
  const session = loadFromStorage<AuthResult | null>(STORAGE_KEYS.session, null);
  if (session) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiResponse<unknown>>(error) && error.response) {
    const { data, status } = error.response;
    if (data && typeof data === "object" && "error" in data) {
      return new ApiError(data.error, status, data.errors);
    }
    return new ApiError(`Unexpected server response (status ${status}).`, status);
  }
  return new ApiError("Could not reach the server. Please check that the API is running.", 0);
}

/** Sends a request and returns the "data" part of the answer. */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<ApiResponse<T>>(config);
    if (!response.data.success) throw new ApiError(response.data.error, response.status);
    return response.data.data;
  } catch (error) {
    throw error instanceof ApiError ? error : toApiError(error);
  }
}
