import type { FormInstance } from "antd";

interface ApiFieldError {
  path?: string;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ApiFieldError[];
}

/** RTK Query rejects with `{ status, data }`; `data` is our API error envelope. */
const readBody = (error: unknown): ApiErrorBody | undefined => {
  if (typeof error !== "object" || error === null) return undefined;
  const data = (error as { data?: unknown }).data;
  return typeof data === "object" && data !== null ? (data as ApiErrorBody) : undefined;
};

/** One human-readable message for toasts. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  const body = readBody(error);
  if (body?.message) return body.message;
  if (error && typeof error === "object" && (error as { status?: unknown }).status === "FETCH_ERROR") {
    return "Cannot reach the server. Check your connection and try again.";
  }
  return fallback;
}

/**
 * Puts server-side validation errors (`errors[].path`) onto the matching antd form fields.
 * `fieldNames` lists the form's field names; errors for other paths fall through to the generic toast.
 * Returns true when at least one field was matched, so callers can skip the generic toast.
 */
export function applyFormErrors<T>(form: FormInstance<T>, error: unknown, fieldNames: readonly string[]): boolean {
  const fieldErrors = (readBody(error)?.errors ?? []).filter((e) => e.path && e.message);
  if (fieldErrors.length === 0) return false;

  const known = new Set(fieldNames);
  const matched = fieldErrors.filter((e) => known.has(e.path as string));
  if (matched.length === 0) return false;

  form.setFields(
    matched.map((e) => ({ name: e.path as string, errors: [e.message as string] })) as Parameters<
      FormInstance<T>["setFields"]
    >[0],
  );
  return true;
}
