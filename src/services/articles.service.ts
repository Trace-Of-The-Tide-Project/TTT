import { api } from "./api";
import { isAxiosError } from "axios";

export type CreateArticleBlock = {
  block_order: number;
  block_type:
    | "paragraph"
    | "quote"
    | "image"
    | "video"
    | "audio"
    | "gallery"
    | "callout"
    | "author_note"
    | "divider"
    | "heading"
    | "caption_text"
    | "meta_data";
  content: string | null;
  metadata?: string | null;
};

export type ArticleAccessLevel = "open" | "preview" | "subscriber" | "paid";

export type CreateArticlePayload = {
  title: string;
  content_type: string;
  category: string;
  language?: string;
  visibility?: "public" | "private";
  access_level?: ArticleAccessLevel;
  preview_block_count?: number;
  price?: number;
  currency?: string;
  seo_title?: string;
  meta_description?: string;
  collection_id?: string;
  tag_ids?: string[];
  blocks: CreateArticleBlock[];
  excerpt?: string;
  cover_image?: string;
  media_url?: string;
  media_duration?: number;
  edition?: string;
  scheduled_at?: string | null;
  open_call_id?: string;
  /** When set, links this article as a translation of the given article. */
  translation_of?: string;
};

export type ArticleCreateResponse = {
  id?: string;
  data?: { id?: string };
  article?: { id?: string };
};

function extractArticleId(res: ArticleCreateResponse): string | null {
  if (typeof res?.id === "string") return res.id;
  if (typeof res?.data?.id === "string") return res.data.id;
  if (typeof res?.article?.id === "string") return res.article.id;
  return null;
}

/** Shape JSON like the API examples: no `null` collection_id, divider blocks omit `content`. */
function toCreateArticleBody(payload: CreateArticlePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title,
    content_type: payload.content_type,
    blocks: payload.blocks.map((block) => {
      const row: Record<string, unknown> = {
        block_order: block.block_order,
        block_type: block.block_type,
      };
      if (block.content != null) {
        row.content = block.content;
      }
      if (block.metadata != null && block.metadata !== "") {
        row.metadata = block.metadata;
      }
      return row;
    }),
  };

  body.category = payload.category;
  if (payload.language) body.language = payload.language;
  if (payload.visibility) body.visibility = payload.visibility;
  if (payload.seo_title) body.seo_title = payload.seo_title;
  if (payload.meta_description) body.meta_description = payload.meta_description;
  if (payload.collection_id?.trim()) body.collection_id = payload.collection_id.trim();
  if (payload.tag_ids?.length) body.tag_ids = payload.tag_ids;
  if (payload.excerpt) body.excerpt = payload.excerpt;
  if (payload.cover_image) body.cover_image = payload.cover_image;
  if (payload.media_url) body.media_url = payload.media_url;
  if (payload.media_duration != null) body.media_duration = payload.media_duration;
  if (payload.edition) body.edition = payload.edition;
  if (payload.scheduled_at != null) body.scheduled_at = payload.scheduled_at;
  if (payload.open_call_id) body.open_call_id = payload.open_call_id;
  if (payload.translation_of) body.translation_of = payload.translation_of;
  if (payload.access_level) body.access_level = payload.access_level;
  if (payload.preview_block_count != null) body.preview_block_count = payload.preview_block_count;
  if (payload.price != null) body.price = payload.price;
  if (payload.currency) body.currency = payload.currency;

  return body;
}

export async function createArticle(payload: CreateArticlePayload) {
  const { data } = await api.post<ArticleCreateResponse>("/articles", toCreateArticleBody(payload));
  return data;
}

export function getArticleIdFromCreateResponse(data: ArticleCreateResponse): string | null {
  return extractArticleId(data);
}

export type ArticlePublishResponse = {
  id: string;
  status: string;
  published_at: string;
};

/** PATCH — publish draft (requires at least 1 block). */
export async function publishArticle(articleId: string) {
  const { data } = await api.patch<ArticlePublishResponse>(`/articles/${articleId}/publish`, {});
  return data;
}

/** PATCH — schedule for future publishing. */
export async function scheduleArticle(articleId: string, scheduledAtIso: string) {
  const { data } = await api.patch<unknown>(`/articles/${articleId}/schedule`, {
    scheduled_at: scheduledAtIso,
  });
  return data;
}

// ——— List (GET /articles) ———

export type ArticleAuthorProfile = {
  avatar?: string | null;
  social_links?: string | null;
  display_name?: string | null;
};

export type ArticleListAuthor = {
  id: string;
  username: string;
  full_name?: string | null;
  profile?: ArticleAuthorProfile | null;
};

export type ArticleListBlock = {
  id: string;
  article_id: string;
  block_order: number;
  block_type: string;
  content: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  excerpt: string | null;
  cover_image: string | null;
  media_url: string | null;
  media_duration: number | null;
  edition: string | null;
  status: string;
  category: string;
  language: string;
  visibility: string;
  reading_time: number;
  view_count: number;
  seo_title: string | null;
  meta_description: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string;
  collection_id: string | null;
  translation_of: string | null;
  createdAt: string;
  updatedAt: string;
  author: ArticleListAuthor;
  contributors: unknown[];
  tags: unknown[];
  collection: unknown | null;
  /** Some list payloads nest the real article under a collaboration/collection wrapper. */
  collaboration?: unknown | null;
  article?: { title?: string | null } | null;
  translations: unknown[];
  blocks: ArticleListBlock[];
};

export type ArticlesListResponse = {
  status: number;
  results: number;
  data: ArticleListItem[];
};

function isArticleListRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && "id" in x && "title" in x;
}

function coerceArticleListArray(value: unknown): ArticleListItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isArticleListRecord) as ArticleListItem[];
}

/**
 * GET /articles bodies differ by environment: top-level `data[]`, nested `data.articles`,
 * or `articles` / `results` / `items`. Normalizes to a single array so the admin list works.
 */
export function normalizeArticlesListPayload(raw: unknown): ArticleListItem[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return coerceArticleListArray(raw);

  if (typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.data)) return coerceArticleListArray(o.data);

  if (o.data != null && typeof o.data === "object" && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    if (Array.isArray(inner.articles)) return coerceArticleListArray(inner.articles);
    if (Array.isArray(inner.data)) return coerceArticleListArray(inner.data);
    if (Array.isArray(inner.items)) return coerceArticleListArray(inner.items);
    if (Array.isArray(inner.results)) return coerceArticleListArray(inner.results);
  }

  if (Array.isArray(o.articles)) return coerceArticleListArray(o.articles);
  if (Array.isArray(o.results)) return coerceArticleListArray(o.results);
  if (Array.isArray(o.items)) return coerceArticleListArray(o.items);

  return [];
}

export async function getArticles(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<unknown>("/articles", { params });
  const list = normalizeArticlesListPayload(data);
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const results =
    typeof o.results === "number" && Number.isFinite(o.results) ? o.results : list.length;
  const status = typeof o.status === "number" && Number.isFinite(o.status) ? o.status : 200;
  return { status, results, data: list };
}

/** GET /articles/author/me — the authenticated author's own articles.
 *  Backend returns `{ count, rows }` (Sequelize findAndCountAll). */
export async function getMyArticles(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ArticlesListResponse> {
  const { data } = await api.get<unknown>("/articles/author/me", { params });
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  // Backend shape: { count: number, rows: ArticleListItem[] }
  const rows = Array.isArray(o.rows) ? coerceArticleListArray(o.rows) : normalizeArticlesListPayload(data);
  return { status: 200, results: typeof o.count === "number" ? o.count : rows.length, data: rows };
}

// ——— Single article (GET public, PATCH author, DELETE admin) ———

export type ArticleDetailBlock = {
  id?: string;
  article_id?: string;
  block_order: number;
  block_type: string;
  content: string | null;
  metadata?: string | null | Record<string, unknown>;
};

export type ArticleDetailTag = { id: string; name: string };

export type ArticleDetailAuthor = {
  id: string;
  username: string;
  full_name?: string | null;
};

export type ArticleDetail = {
  id: string;
  title: string;
  slug?: string;
  /** e.g. article, video — used to pick the correct editor template on edit */
  content_type?: string;
  category?: string;
  status?: string;
  scheduled_at?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  reading_time?: number;
  language?: string;
  visibility?: string;
  seo_title?: string | null;
  meta_description?: string | null;
  collection_id?: string | null;
  /** Populated when GET /articles/:id includes joined collection. */
  collection?: { id?: string; name?: string; title?: string } | null;
  blocks: ArticleDetailBlock[];
  tags?: ArticleDetailTag[];
  contributors?: unknown[];
  author?: ArticleDetailAuthor | null;
  view_count?: number;
  createdAt?: string;
  open_call_id?: string | null;
  translation_of?: string | null;
  translation_group_id?: string | null;
  is_premium?: boolean;
  access_level?: ArticleAccessLevel | string;
  preview_block_count?: number | null;
  price?: number | null;
  currency?: string | null;
  locked?: boolean;
};

function unwrapArticleDetailPayload(raw: unknown): ArticleDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === "object" && inner !== null && "id" in inner && "title" in inner) {
    return inner as ArticleDetail;
  }
  if ("id" in o && "title" in o) {
    return o as unknown as ArticleDetail;
  }
  return null;
}

export type ArticleViewCountResponse = {
  view_count: number;
};

function unwrapViewCountPayload(raw: unknown): number | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.view_count === "number" && Number.isFinite(o.view_count)) return o.view_count;
  const inner = o.data;
  if (inner && typeof inner === "object") {
    const v = (inner as Record<string, unknown>).view_count;
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/** POST /articles/:id/view — public; increments view count. Returns new total or null if response shape unknown. */
export async function recordArticleView(articleId: string): Promise<number | null> {
  const { data } = await api.post<unknown>(`/articles/${encodeURIComponent(articleId)}/view`, {});
  return unwrapViewCountPayload(data);
}

/** GET /articles/:id — works in browser (Bearer when logged in) and on server. Returns null if 404. */
export async function getArticleById(articleId: string): Promise<ArticleDetail | null> {
  try {
    const { data } = await api.get<unknown>(`/articles/${encodeURIComponent(articleId)}`);
    const detail = unwrapArticleDetailPayload(data);
    if (!detail) return null;
    return {
      ...detail,
      blocks: Array.isArray(detail.blocks) ? detail.blocks : [],
      tags: Array.isArray(detail.tags) ? detail.tags : [],
      contributors: Array.isArray(detail.contributors) ? detail.contributors : [],
    };
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    const { data } = await api.get<unknown>(`/articles/slug/${encodeURIComponent(slug)}`);
    const detail = unwrapArticleDetailPayload(data);
    if (!detail) return null;
    return {
      ...detail,
      blocks: Array.isArray(detail.blocks) ? detail.blocks : [],
      tags: Array.isArray(detail.tags) ? detail.tags : [],
      contributors: Array.isArray(detail.contributors) ? detail.contributors : [],
    };
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

// ── Related articles ───────────────────────────────────────────

export type RelatedArticleItem = {
  id: string;
  title: string;
  slug?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  edition?: string | null;
  category?: string | null;
  content_type?: string | null;
  author?: { id: string; username?: string; full_name?: string | null } | null;
};

export type CollectionArticleItem = {
  id: string;
  title: string;
  slug?: string | null;
  cover_image?: string | null;
  content_type?: string | null;
  reading_time?: number | null;
  media_duration?: number | null;
  edition?: string | null;
  published_at?: string | null;
  excerpt?: string | null;
  author?: {
    id: string;
    username?: string;
    full_name?: string | null;
    profile?: { avatar?: string | null; display_name?: string | null } | null;
  } | null;
};

export type CollectionArticlesResult = {
  /** Total published items in the collection (from meta.total). */
  count: number;
  /** Sum of media/reading minutes ÷ 60, from meta.total_hours. */
  total_hours: number;
  articles: CollectionArticleItem[];
};

/** GET /articles/:id/related — returns up to 4 published articles in same category/tags. */
export async function getRelatedArticles(articleId: string): Promise<RelatedArticleItem[]> {
  try {
    const { data } = await api.get<unknown>(`/articles/${encodeURIComponent(articleId)}/related`);
    const arr = Array.isArray(data) ? data : ((data as Record<string, unknown>)?.data ?? []);
    return arr as RelatedArticleItem[];
  } catch {
    return [];
  }
}

export type GetCollectionArticlesParams = { page?: number; limit?: number };

/** GET /articles/collection/:collectionId — published articles in a collection.
 *  Backend returns `{ rows, meta: { total, total_hours, ... } }`. */
export async function getCollectionArticles(
  collectionId: string,
  params?: GetCollectionArticlesParams,
): Promise<CollectionArticlesResult> {
  try {
    const { data } = await api.get<unknown>(
      `/articles/collection/${encodeURIComponent(collectionId)}`,
      { params },
    );
    const o = (data ?? {}) as Record<string, unknown>;
    const rows = Array.isArray(o.rows) ? (o.rows as CollectionArticleItem[]) : [];
    const meta = (o.meta ?? {}) as Record<string, unknown>;
    return {
      count: typeof meta.total === "number" ? meta.total : rows.length,
      total_hours: typeof meta.total_hours === "number" ? meta.total_hours : 0,
      articles: rows,
    };
  } catch {
    return { count: 0, total_hours: 0, articles: [] };
  }
}

export type ArticleLifecycleStatus = "draft" | "published" | "scheduled" | "archived" | "flagged";

export type UpdateArticlePayload = {
  title?: string;
  status?: ArticleLifecycleStatus;
  category?: string;
  collection_id?: string | null;
  /** Stable storage key (e.g. `images/123.png`) or null to clear. */
  cover_image?: string | null;
  /** When sent, backend replaces blocks (same shape as create). */
  blocks?: CreateArticleBlock[];
  tag_ids?: string[];
  /** Magazine issue to assign this article to, or null to unassign. */
  issue_id?: string | null;
  /** Parent magazine — normally set alongside issue_id. */
  magazine_id?: string | null;
  access_level?: ArticleAccessLevel;
  preview_block_count?: number | null;
  price?: number | null;
  currency?: string;
  seo_title?: string;
  meta_description?: string;
};

function omitUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export type ArticleUpdateResponse = {
  id: string;
  title?: string;
};

/** PATCH /articles/:id — author only; optional blocks/tags replace when provided. */
export async function updateArticle(articleId: string, payload: UpdateArticlePayload) {
  const body = omitUndefined({ ...payload } as Record<string, unknown>);
  const { data } = await api.patch<ArticleUpdateResponse>(
    `/articles/${encodeURIComponent(articleId)}`,
    body
  );
  return data;
}

export type ArticleDeleteResponse = {
  message: string;
};

export async function deleteArticle(articleId: string) {
  const { data } = await api.delete<ArticleDeleteResponse>(
    `/articles/${encodeURIComponent(articleId)}`
  );
  return data;
}
