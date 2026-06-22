/**
 * Shared types + pure helpers for "The Atrium" — the /content hub.
 *
 * Plain module (no "use client"): importable by both the server page that
 * fetches/buckets the data and the client section components that render it.
 */

/** The five content rooms the hub surfaces, keyed to their sub-routes. */
export type GatewayType = "article" | "audio" | "gallery" | "video" | "threads";

/** Ordered list driving the gateway row and bucketing — single source of truth. */
export const GATEWAY_TYPES: readonly GatewayType[] = [
  "article",
  "audio",
  "gallery",
  "video",
  "threads",
] as const;

/** One content row, mapped into the shape the Atrium components consume. */
export type AtriumItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  type: GatewayType;
  /** Canonical detail href from previewHrefForContentType — query-param route. */
  href: string;
  /** Short display meta (e.g. "5 min · Memory"). */
  meta?: string | null;
  /** Seconds, for audio/video runtime chips. */
  mediaDuration?: number | null;
};

/** One gateway tile's data — always present so the tile renders even when empty. */
export type GatewayData = {
  type: GatewayType;
  /** Real bucket size, or null when 0/unknown — the number is never fabricated. */
  count: number | null;
  /** Route into the room, e.g. "/content/audio". */
  href: string;
  /** Up to two newest items for the focus-to-expand peek. */
  items: AtriumItem[];
};

/** Featured hero item, or null → hero renders its non-image intro variant. */
export type HeroData = AtriumItem | null;

/**
 * Normalize the API `content_type` to one of the five rooms.
 *
 * The threads route is `/content/threads`, but the API content_type value is
 * the SINGULAR `thread` — map both. Dash/underscore-insensitive; anything
 * unrecognized falls back to "article" (the written reader).
 */
export function normalizeContentType(raw: string | null | undefined): GatewayType {
  const t = (raw || "article").toLowerCase().replace(/-/g, "_");
  if (t === "video") return "video";
  if (t === "audio") return "audio";
  if (t === "gallery") return "gallery";
  if (t === "thread" || t === "threads") return "threads";
  return "article";
}

/** Format a duration in seconds to "m:ss" for runtime chips (null-safe). */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
