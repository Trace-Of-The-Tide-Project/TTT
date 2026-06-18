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
