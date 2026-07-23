import { api } from "./api";
import { isAxiosError } from "axios";

/**
 * Content translation groups — the same endpoint shape across every content type
 * that supports translations. All language versions of one piece share a
 * `translation_group_id`; the backend exposes them at
 * `GET /<type>/:id/translations`.
 */

/** Content types the backend exposes translation groups for. */
export const TRANSLATABLE_TYPES = {
  article: "articles",
  "open-call": "open-calls",
  collection: "collections",
  issue: "magazine-issues",
  writer: "writers",
  book: "knowledge/books",
  person: "people",
  contribution: "contributions",
} as const;

export type TranslatableType = keyof typeof TRANSLATABLE_TYPES;

export type TranslationVersion = {
  id: string;
  language: string;
  slug?: string | null;
  status?: string | null;
  /** `title` for most types, `name` for collections. */
  title?: string | null;
  /** Books only: whether this edition has a PDF attached. Undefined for
   * every other content type. */
  has_pdf?: boolean;
  /** Articles only — a sibling version can live on a different public reader
   * than the one currently open ('magazine' product → /magazine* routes,
   * video/audio/gallery/thread → their own routes). Undefined elsewhere. */
  product?: "main" | "magazine" | null;
  issue_id?: string | null;
  content_type?: string | null;
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
  const prefix = TRANSLATABLE_TYPES[type];
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
