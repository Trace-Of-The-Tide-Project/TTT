import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/**
 * Public system settings surface. Currently just the community
 * guidelines, exposed by the backend at `GET /system/guidelines`
 * (unauthenticated, read-only subset of the admin guidelines).
 */
export type CommunityGuidelines = {
  community_guidelines: string;
  content_policy: string;
};

function unwrap(raw: unknown): CommunityGuidelines {
  const empty: CommunityGuidelines = { community_guidelines: "", content_policy: "" };
  if (!raw || typeof raw !== "object") return empty;
  const o = (raw as { data?: unknown }).data ?? raw;
  if (!o || typeof o !== "object") return empty;
  const r = o as Record<string, unknown>;
  return {
    community_guidelines:
      typeof r.community_guidelines === "string" ? r.community_guidelines : "",
    content_policy: typeof r.content_policy === "string" ? r.content_policy : "",
  };
}

/** GET /system/guidelines — public. SSR- and client-safe. */
export async function getCommunityGuidelines(): Promise<CommunityGuidelines> {
  if (typeof window === "undefined") {
    return unwrap(await serverGet<unknown>("/system/guidelines"));
  }
  try {
    const { data } = await api.get<unknown>("/system/guidelines");
    return unwrap(data);
  } catch {
    return { community_guidelines: "", content_policy: "" };
  }
}

/** Split newline-separated guideline text into trimmed, non-empty rules. */
export function splitGuidelines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

function unwrapHeroImages(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const o = (raw as { data?: unknown }).data ?? raw;
  if (!o || typeof o !== "object") return [];
  const images = (o as { images?: unknown }).images;
  return Array.isArray(images) ? images.filter((v): v is string => typeof v === "string") : [];
}

/** GET /system/community-hero-images — public. SSR- and client-safe.
 * Ordered list of admin-managed hero image storage keys/URLs for the
 * Community page hero rotation. */
export async function getCommunityHeroImages(): Promise<string[]> {
  if (typeof window === "undefined") {
    return unwrapHeroImages(await serverGet<unknown>("/system/community-hero-images"));
  }
  try {
    const { data } = await api.get<unknown>("/system/community-hero-images");
    return unwrapHeroImages(data);
  } catch {
    return [];
  }
}

function unwrapImageUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = (raw as { data?: unknown }).data ?? raw;
  if (!o || typeof o !== "object") return null;
  const url = (o as { url?: unknown }).url;
  return typeof url === "string" && url ? url : null;
}

/** GET /system/homepage-hero-image — public. SSR- and client-safe.
 * Admin-managed background image for the homepage hero section, or null
 * when none has been uploaded. */
export async function getHomepageHeroImage(): Promise<string | null> {
  if (typeof window === "undefined") {
    return unwrapImageUrl(await serverGet<unknown>("/system/homepage-hero-image"));
  }
  try {
    const { data } = await api.get<unknown>("/system/homepage-hero-image");
    return unwrapImageUrl(data);
  } catch {
    return null;
  }
}
