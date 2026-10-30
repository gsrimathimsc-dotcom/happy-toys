// ---------------------------------------------------------------
// Frontend helper for calling our own API routes.
// Every API route returns { success, data } or { success, error }.
// ---------------------------------------------------------------
import type { ApiResponse } from "@/types";

/** Used by client components: fetches JSON and throws a friendly error on failure. */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
  } catch {
    throw new Error("Network error. Please check that the server is running.");
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Unexpected server response (status ${response.status}).`);
  }

  if (!body.success) {
    throw new Error(body.error);
  }
  return body.data;
}
