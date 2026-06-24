import { api } from "./api";
import { isAxiosError } from "axios";

/**
 * Content translation groups — the same endpoint shape across every content type
 * that supports translations. All language versions of one piece share a
 * `translation_group_id`; the backend exposes them at
 * `GET /<type>/:id/translations`.
 */

/** Content types the backend ALREADY exposes translation groups for. */
export const TRANSLATABLE_TYPES = {
  article: "articles",
  "open-call": "open-calls",
  collection: "collections",
  issue: "magazine-issues",
} as const;

/**
 * Content types we want translation groups for but which depend on a backend
 * rollout — each needs a `language` + `translation_group_id` column, a
 * `GET /<prefix>/:id/translations` endpoint, and a create payload that accepts
 * `language` + `translation_of`. See `docs/backend-asks-translations.md`.
 *
 * These stay dark behind {@link EXTENDED_TRANSLATIONS_ENABLED} until the backend
 * ships them, so the frontend can be wired ahead of time without surfacing a
 * half-working feature.
 */
export const PENDING_TRANSLATABLE_TYPES = {
  writer: "writers",
  book: "knowledge/books",
  person: "people",
} as const;

/** Flip `NEXT_PUBLIC_FEATURE_EXTENDED_TRANSLATIONS=true` once the backend ships
 * translation groups for the pending types above. */
export const EXTENDED_TRANSLATIONS_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_EXTENDED_TRANSLATIONS === "true";

const ALL_TRANSLATABLE_TYPES = {
  ...TRANSLATABLE_TYPES,
  ...PENDING_TRANSLATABLE_TYPES,
} as const;

export type TranslatableType = keyof typeof ALL_TRANSLATABLE_TYPES;

/** Whether a given content type can have its translation UI shown right now —
 * always-on for backend-supported types, flag-gated for pending ones. */
export function isTranslatableNow(type: TranslatableType): boolean {
  if (type in TRANSLATABLE_TYPES) return true;
  return EXTENDED_TRANSLATIONS_ENABLED;
}

export type TranslationVersion = {
  id: string;
  language: string;
  slug?: string | null;
  status?: string | null;
  /** `title` for most types, `name` for collections. */
  title?: string | null;
};

export type TranslationGroup = {
  group: string;
  original: TranslationVersion | null;
  translations: TranslationVersion[];
  versions: TranslationVersion[];
};

function unwrapGroup(raw: unknown): TranslationGroup {
  const empty: TranslationGroup = {
    group: "",
    original: null,
    translations: [],
    versions: [],
  };
  if (!raw || typeof raw !== "object") return empty;
  const o = raw as Record<string, unknown>;
  // Some environments wrap the body in `data`.
  const body = (o.data && typeof o.data === "object" ? o.data : o) as Record<string, unknown>;
  const versions = Array.isArray(body.versions)
    ? (body.versions as TranslationVersion[])
    : [];
  return {
    group: typeof body.group === "string" ? body.group : "",
    original: (body.original as TranslationVersion | null) ?? null,
    translations: Array.isArray(body.translations)
      ? (body.translations as TranslationVersion[])
      : [],
    versions,
  };
}

/** GET /<type>/:id/translations — returns the full translation group. */
export async function getTranslations(
  type: TranslatableType,
  id: string,
): Promise<TranslationGroup> {
  const prefix = ALL_TRANSLATABLE_TYPES[type];
  try {
    const { data } = await api.get<unknown>(
      `/${prefix}/${encodeURIComponent(id)}/translations`,
    );
    return unwrapGroup(data);
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return { group: "", original: null, translations: [], versions: [] };
    }
    throw e;
  }
}

/** Languages present in a group, as a Set for quick membership checks. */
export function presentLanguages(group: TranslationGroup): Set<string> {
  return new Set(group.versions.map((v) => v.language));
}
