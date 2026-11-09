import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/services/apiClient";

/**
 * Shows an API failure next to the form field it belongs to.
 * - Field messages sent by the API (validation) go to their own fields.
 * - A 409 "already exists" answer goes to `duplicateField`, if one is given.
 * Returns true when at least one field was marked, so the caller can skip a generic message.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  duplicateField?: Path<T>
): boolean {
  if (!(error instanceof ApiError)) return false;
  let marked = false;

  for (const field of fields) {
    const key = Object.keys(error.fieldErrors).find((k) => k.toLowerCase() === String(field).toLowerCase());
    const message = key ? error.fieldErrors[key][0] : undefined;
    if (message) {
      setError(field, { message });
      marked = true;
    }
  }

  if (!marked && error.status === 409 && duplicateField) {
    setError(duplicateField, { message: error.message });
    marked = true;
  }
  return marked;
}
