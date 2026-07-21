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

/** Mirrors the admin Branding tab's shape (BrandingTab.tsx). */
export type CmsBranding = { primary_color?: string; logo?: string; favicon?: string };

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Admin-editable branding (logo/favicon/primary color) from
 * `GET /cms/settings` (key "branding"), written by the admin editor's
 * Branding tab. Returns null on any failure/absence/malformed shape —
 * never throws, never blocks the page. `primary_color` is validated
 * against a strict hex pattern here so every consumer gets an
 * already-safe value (or none) rather than re-validating individually.
 */
export async function getCmsBranding(): Promise<CmsBranding | null> {
  const raw = await serverGet<unknown>("/cms/settings");
  const settings = unwrap(raw);
  const branding = settings?.branding;
  if (!branding || typeof branding !== "object") return null;
  const b = branding as Record<string, unknown>;
  const primary_color =
    typeof b.primary_color === "string" && HEX_COLOR_PATTERN.test(b.primary_color)
      ? b.primary_color
      : undefined;
  const logo = typeof b.logo === "string" && b.logo ? b.logo : undefined;
  const favicon = typeof b.favicon === "string" && b.favicon ? b.favicon : undefined;
  if (!primary_color && !logo && !favicon) return null;
  return { primary_color, logo, favicon };
}
