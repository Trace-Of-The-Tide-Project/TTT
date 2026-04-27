import { isAxiosError } from "axios";

/**
 * Extracts a human-readable message from auth errors thrown by axios calls or our proxy
 * routes. Handles wrapped backend bodies (`{ data: { message } }`), array messages, and
 * raw `error` strings — falling back to the network/status reason.
 */
export function parseAuthErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    const fromData = extractMessage(data);
    if (fromData) return fromData;
    if (err.message) return err.message;
  } else if (err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const inner = isRecord(obj.data) ? obj.data : obj;

  const direct = stringOrFirst(inner.message) ?? stringOrFirst(obj.message);
  if (direct) return direct;

  const errorField = stringOrFirst(inner.error) ?? stringOrFirst(obj.error);
  if (errorField) return errorField;

  return null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

function stringOrFirst(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return null;
}
