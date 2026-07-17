import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import type { CreateArticleBlock, ArticleDetailBlock } from "./articles.service";

/**
 * Magazine issue / spread / collection record. Field set kept tight
 * to what the magazine "Issues" pane actually renders.
 */
/** A department/section within an issue (from the issue detail response). */
export type IssueSectionRef = {
  id: string;
  title: string;
  slug?: string | null;
  position?: number | null;
};

/** The issue's editor's letter — a linked article, basic fields only. */
export type IssueEditorsLetter = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  language?: string | null;
  cover_image?: string | null;
};

export type MagazineIssue = {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  /** Issue kind — backend enum. Documented values: "editorial",
   * "crowdfunded", "slide". */
  kind?: string | null;
  status?: string | null;
  language?: string | null;
  cover_image?: string | null;
  excerpt?: string | null;
  description?: string | null;
  page_count?: number | null;
  edition?: string | null;
  edition_number?: number | null;
  category?: string | null;
  magazine_id?: string | null;
  is_premium?: boolean | null;
  /** The public "current issue" flag. Flipped only via setCurrentIssue. */
  is_current?: boolean | null;
  /** The issue's editor's letter — rich-text HTML (distinct from the legacy
   * `editors_letter` linked article). */
  editors_letter_html?: string | null;
  /** Ordered content blocks authored on the issue (quote/callout/image/…). */
  body_blocks?: ArticleDetailBlock[] | null;
  /** Commerce — sell the issue as a digital product like a book. */
  price?: number | string | null;
  currency?: string | null;
  /** Computed on read for the caller. */
  is_free?: boolean | null;
  is_owned?: boolean | null;
  /** Signed download URL, present only when the caller is entitled. */
  pdf_url?: string | null;
  /** Crowdfunded issues only. */
  funding_goal?: number | null;
  funding_deadline?: string | null;
  open_call_id?: string | null;
  translation_of?: string | null;
  /** Shared id linking this issue's language versions. */
  translation_group_id?: string | null;
  published_at?: string | null;
  /** Ordered departments within this issue (present on single-issue reads). */
  sections?: IssueSectionRef[] | null;
  /** Editor's letter, when set (single-issue reads only). */
  editors_letter?: IssueEditorsLetter | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GetMagazineIssuesParams = {
  kind?: string;
  status?: string;
  magazine_id?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function unwrapList(raw: unknown): MagazineIssue[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as MagazineIssue[];
  if (Array.isArray(o)) return o as unknown as MagazineIssue[];
  return [];
}

export async function getMagazineIssues(
  params?: GetMagazineIssuesParams,
): Promise<MagazineIssue[]> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>("/magazine-issues", params);
    return unwrapList(raw);
  }
  try {
    const { data } = await api.get<unknown>("/magazine-issues", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

/**
 * Create / update payload — mirrors the backend's documented
 * `POST /magazine-issues` body. `title`, `magazine_id`, `slug`, and
 * `edition_number` are required on create; `kind` is an enum
 * ("editorial" | "crowdfunded" | "slide"); crowdfunded issues add `funding_goal`
 * + `funding_deadline`. PATCH accepts any subset.
 */
export type MagazineIssueInput = {
  title: string;
  subtitle?: string | null;
  slug?: string;
  kind?: string | null;
  status?: string | null;
  /** Language/translation-group tag — enum en|ar|es|fr on the backend. */
  language?: string | null;
  cover_image?: string | null;
  excerpt?: string | null;
  description?: string | null;
  page_count?: number | null;
  /** Display label exposed on read (e.g. "12"). */
  edition?: string | null;
  /** Numeric edition — REQUIRED by the create DTO (integer column
   * `edition_number`; `edition` is a read-side alias). */
  edition_number?: number | null;
  category?: string | null;
  /** REQUIRED by the create DTO — the parent magazine the issue belongs to. */
  magazine_id?: string | null;
  is_premium?: boolean | null;
  /** Commerce. null/<=0 price ⇒ free. */
  price?: number | null;
  currency?: string | null;
  pdf_path?: string | null;
  /** Crowdfunded issues only. */
  funding_goal?: number | null;
  funding_deadline?: string | null;
  open_call_id?: string | null;
  translation_of?: string | null;
  published_at?: string | null;
  /** The issue's editor's letter — rich-text HTML. */
  editors_letter_html?: string | null;
  /** Ordered content blocks authored on the issue (quote/callout/image/…). */
  body_blocks?: CreateArticleBlock[] | null;
};

function unwrapOne(raw: unknown): MagazineIssue | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return (raw as { data?: MagazineIssue }).data ?? null;
  }
  return raw as MagazineIssue;
}

/** Admin — fetch a single issue by id. */
export async function getMagazineIssue(
  id: string,
): Promise<MagazineIssue | null> {
  try {
    const { data } = await api.get<unknown>(
      `/magazine-issues/${encodeURIComponent(id)}`,
    );
    return unwrapOne(data);
  } catch {
    return null;
  }
}

/** Admin — create an issue. POST /magazine-issues */
export async function createMagazineIssue(
  payload: MagazineIssueInput,
): Promise<MagazineIssue | null> {
  const { data } = await api.post<unknown>("/magazine-issues", payload);
  return unwrapOne(data);
}

/** Admin — update an issue. PATCH /magazine-issues/{id} */
export async function updateMagazineIssue(
  id: string,
  payload: Partial<MagazineIssueInput>,
): Promise<MagazineIssue | null> {
  const { data } = await api.patch<unknown>(
    `/magazine-issues/${encodeURIComponent(id)}`,
    payload,
  );
  return unwrapOne(data);
}

/** Admin — delete an issue. DELETE /magazine-issues/{id} */
export async function deleteMagazineIssue(id: string): Promise<void> {
  await api.delete(`/magazine-issues/${encodeURIComponent(id)}`);
}

/** Admin — mark this (published) issue as the magazine's current issue. */
export async function setCurrentIssue(id: string): Promise<MagazineIssue | null> {
  const { data } = await api.patch<unknown>(
    `/magazine-issues/${encodeURIComponent(id)}/set-current`,
  );
  return unwrapOne(data);
}

/** The magazine's current issue, resolved to the viewer's language. Public;
 * works on server (hero) and client. Returns null when none is set. */
export async function getCurrentIssue(
  viewerLang?: string,
): Promise<MagazineIssue | null> {
  const params = viewerLang ? { viewer_lang: viewerLang } : undefined;
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>("/magazine-issues/current", params);
    return unwrapOne(raw);
  }
  try {
    const { data } = await api.get<unknown>("/magazine-issues/current", { params });
    return unwrapOne(data);
  } catch {
    return null;
  }
}

/** Article assigned to an issue, as returned by GET /magazine-issues/:id/articles. */
export type IssueArticle = {
  id: string;
  title: string;
  slug?: string | null;
  status?: string | null;
  issue_position?: number | null;
  /** Section/department this article sits under (null = ungrouped). */
  section_id?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  reading_time?: number | null;
  content_type?: string | null;
  /** Article's own tier: open | preview | subscriber | paid. */
  access_level?: string | null;
  /** Per-viewer access, computed by the backend: full | preview | locked. */
  access?: "full" | "preview" | "locked" | null;
};

function unwrapArticlesList(raw: unknown): IssueArticle[] {
  if (Array.isArray(raw)) return raw as IssueArticle[];
  if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).data)) {
    return (raw as Record<string, unknown>).data as IssueArticle[];
  }
  return [];
}

/** List articles assigned to an issue, in display order. Works on server and
 * client — the endpoint is public. */
export async function getIssueArticles(issueId: string): Promise<IssueArticle[]> {
  const path = `/magazine-issues/${encodeURIComponent(issueId)}/articles`;
  if (typeof window === "undefined") {
    return unwrapArticlesList(await serverGet<unknown>(path));
  }
  const { data } = await api.get<unknown>(path);
  return unwrapArticlesList(data);
}

/** Admin — persist the full display order for an issue's articles. */
export async function reorderIssueArticles(
  issueId: string,
  articleIds: string[],
): Promise<IssueArticle[]> {
  const { data } = await api.patch<unknown>(
    `/magazine-issues/${encodeURIComponent(issueId)}/articles/reorder`,
    { article_ids: articleIds },
  );
  return unwrapArticlesList(data);
}

/** GET /magazine-issues/:id/download — signed PDF URL for owners. */
export async function getIssueDownloadUrl(id: string): Promise<string> {
  const { data } = await api.get<unknown>(
    `/magazine-issues/${encodeURIComponent(id)}/download`,
  );
  const inner = unwrapOne(data) as { url?: string } | null;
  if (!inner?.url) throw new Error("Download did not return a URL");
  return inner.url;
}

/** A writer credited as editor/contributor on an issue, from
 * GET /magazine-issues/:id/contributors. */
export type IssueContributor = {
  id: string;
  issue_id: string;
  writer_id: string;
  role: string;
  position?: number | null;
  writer?: {
    id: string;
    pen_name?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    avatar?: string | null;
    user?: { full_name?: string | null; username?: string | null } | null;
  } | null;
};

function unwrapContributors(raw: unknown): IssueContributor[] {
  if (Array.isArray(raw)) return raw as IssueContributor[];
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as Record<string, unknown>).data)
  ) {
    return (raw as Record<string, unknown>).data as IssueContributor[];
  }
  return [];
}

/** List issue editors/contributors, in display order. Public endpoint. */
export async function getIssueContributors(
  issueId: string,
): Promise<IssueContributor[]> {
  const path = `/magazine-issues/${encodeURIComponent(issueId)}/contributors`;
  if (typeof window === "undefined") {
    return unwrapContributors(await serverGet<unknown>(path));
  }
  const { data } = await api.get<unknown>(path);
  return unwrapContributors(data);
}

/** Admin — credit a writer on an issue. */
export async function addIssueContributor(
  issueId: string,
  input: { writer_id: string; role?: string },
): Promise<IssueContributor[]> {
  const { data } = await api.post<unknown>(
    `/magazine-issues/${encodeURIComponent(issueId)}/contributors`,
    input,
  );
  return unwrapContributors(data);
}

/** Admin — remove a contributor credit. */
export async function removeIssueContributor(
  issueId: string,
  contributorId: string,
): Promise<IssueContributor[]> {
  const { data } = await api.delete<unknown>(
    `/magazine-issues/${encodeURIComponent(issueId)}/contributors/${encodeURIComponent(contributorId)}`,
  );
  return unwrapContributors(data);
}

/** Admin — persist contributor display order. */
export async function reorderIssueContributors(
  issueId: string,
  contributorIds: string[],
): Promise<IssueContributor[]> {
  const { data } = await api.patch<unknown>(
    `/magazine-issues/${encodeURIComponent(issueId)}/contributors/reorder`,
    { contributor_ids: contributorIds },
  );
  return unwrapContributors(data);
}

export async function getMagazineIssueBySlug(
  slug: string,
): Promise<MagazineIssue | null> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(
      `/magazine-issues/slug/${encodeURIComponent(slug)}`,
    );
    if (!raw) return null;
    if (typeof raw === "object" && "data" in (raw as object)) {
      return (raw as { data?: MagazineIssue }).data ?? null;
    }
    return raw as MagazineIssue;
  }
  try {
    const { data } = await api.get<unknown>(
      `/magazine-issues/slug/${encodeURIComponent(slug)}`,
    );
    if (data && typeof data === "object" && "data" in (data as object)) {
      return (data as { data?: MagazineIssue }).data ?? null;
    }
    return data as MagazineIssue;
  } catch {
    return null;
  }
}
