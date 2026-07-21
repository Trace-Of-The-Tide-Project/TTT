import { serverGet } from "@/lib/api/isomorphic-fetch";

/** Mirrors the admin Navigation tab's shape (NavigationsFooterTab.tsx). */
export type CmsNavLink = { id: string; text: string; path: string; enabled: boolean };

function unwrap(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return (o.data as Record<string, unknown>) ?? o;
}

function isValidLink(v: unknown): v is CmsNavLink {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return typeof l.text === "string" && typeof l.path === "string";
}

/**
 * Admin-editable nav links from `GET /cms/settings` (key "navigation"),
 * written by the admin editor's Navigation tab. Returns null on any
 * failure/absence/malformed shape so Navbar falls back to its hardcoded
 * defaults — never throws, never blocks the page.
 */
export async function getCmsNavLinks(): Promise<CmsNavLink[] | null> {
  const raw = await serverGet<unknown>("/cms/settings");
  const settings = unwrap(raw);
  const links = settings?.navigation;
  if (!Array.isArray(links) || links.length === 0) return null;
  const valid = links.filter(isValidLink).filter((l) => l.enabled !== false);
  return valid.length > 0 ? valid : null;
}
