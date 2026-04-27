import { stripLocalePrefixesFromPath } from "@/lib/i18n/strip-locale-from-path";

/**
 * Validates a `callbackUrl` query param against open-redirect attacks. Only same-origin,
 * absolute-paths are accepted (no `//host`, no `http(s)://other`, no `javascript:`).
 *
 * Returns `null` when the input is unsafe or empty so callers can apply their own default.
 */
export function safeCallbackPath(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  if (raw.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;

  if (!raw.startsWith("/")) return null;

  const stripped = stripLocalePrefixesFromPath(raw);
  if (!stripped.startsWith("/") || stripped.startsWith("//")) return null;

  return stripped;
}
