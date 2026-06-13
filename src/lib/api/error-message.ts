import { isAxiosError } from "axios";

/** Pull human-readable strings out of the many shapes backends use for
 *  field-level validation errors:
 *    - ["title is required", "slug must be a string"]
 *    - { title: "is required", slug: ["must be a string"] }
 *    - [{ message: "..." }, { msg: "..." }]
 */
function collectDetails(v: unknown): string[] {
  if (!v) return [];
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  if (Array.isArray(v)) return v.flatMap(collectDetails);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    // Common per-item wrappers.
    if (typeof o.message === "string") return collectDetails(o.message);
    if (typeof o.msg === "string") return collectDetails(o.msg);
    // Otherwise treat as a field→error map: "field: error".
    return Object.entries(o).flatMap(([field, val]) =>
      collectDetails(val).map((m) => `${field}: ${m}`),
    );
  }
  return [];
}

export function formatApiError(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;

      // Base message (may be a generic wrapper like "Validation Error").
      const base =
        (typeof o.message === "string" && o.message.trim()) ||
        (typeof o.error === "string" && o.error.trim()) ||
        "";

      // Field-level details live under varying keys depending on the
      // backend (class-validator, Joi/celebrate, custom). Surface them
      // so "Validation Error" actually tells you what failed.
      const details = [
        ...collectDetails(Array.isArray(o.message) ? o.message : undefined),
        ...collectDetails(o.errors),
        ...collectDetails(o.details),
        ...collectDetails(o.detail),
      ];
      const unique = Array.from(new Set(details.filter(Boolean)));

      if (base && unique.length) return `${base}: ${unique.join("; ")}`;
      if (unique.length) return unique.join("; ");
      if (base) return base;
    }
    return e.message || fallback;
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
