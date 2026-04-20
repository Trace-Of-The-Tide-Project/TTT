import type { ArticleListItem } from "@/services/articles.service";
import type { ArticleRow } from "@/components/dashboard/admin/articles/articles-main/ArticlesTable";

function stringLabel(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  for (const key of ["title", "name", "collection_name", "label"] as const) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/**
 * List endpoints sometimes echo collection/collaboration name in `title` instead of the article headline.
 * Prefer nested `article.title`, then disambiguate with `seo_title` when `title` matches collection/collaboration.
 */
export function articleListItemDisplayTitle(a: ArticleListItem): string {
  const nested = a.article?.title;
  if (typeof nested === "string" && nested.trim()) return nested.trim();

  const raw = (a.title ?? "").trim();
  const seo = (a.seo_title ?? "").trim();
  const coll = stringLabel(a.collection);
  const collab = stringLabel(a.collaboration);

  const titleIsGroupLabel =
    (coll != null && raw === coll) || (collab != null && raw === collab);
  if (titleIsGroupLabel && seo) return seo;

  return raw || seo || "—";
}

/** Relative / absolute display for article `updatedAt` (list + cards). */
export function formatArticleListDate(iso: string, locale: string, justNowLabel: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diffMs = d.getTime() - now;
  if (diffMs > 0) {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
  }
  const pastMs = -diffMs;
  const mins = Math.floor(pastMs / 60000);
  if (mins < 1) return justNowLabel;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (hours >= 1) return rtf.format(-hours, "hour");
    return rtf.format(-mins, "minute");
  }
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function formatScheduledSubtitle(iso: string | null | undefined, locale = "en"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
}

/** Map API / localized status strings to a canonical key before table/card logic. */
function articleStatusKey(status: string | null | undefined): string {
  const raw = String(status ?? "draft").trim();
  const lower = raw.toLowerCase() || "draft";

  if (
    lower === "scheduled" ||
    lower === "schedule_pending" ||
    lower === "scheduled_for_publish"
  ) {
    return "scheduled";
  }
  if (lower === "published" || lower === "publish") {
    return "published";
  }
  if (lower === "draft" || lower === "archived") {
    return "draft";
  }

  // Localized labels (e.g. list API follows Accept-Language: ar)
  const publishedAr = ["منشور", "منشورة", "منشوره"];
  const scheduledAr = ["مجدول", "مجدولة", "مجدوله"];
  const draftAr = ["مسودة", "مسوده"];
  if (publishedAr.some((s) => raw === s || raw.includes(s))) return "published";
  if (scheduledAr.some((s) => raw === s || raw.includes(s))) return "scheduled";
  if (draftAr.some((s) => raw === s || raw.includes(s))) return "draft";

  return lower;
}

export type AdminArticleListNormalizedStatus = "draft" | "published" | "scheduled";

/** Canonical status for admin list filtering, cards, and table (matches row mapper). */
export function normalizeAdminArticleListStatus(
  status: string | null | undefined,
): AdminArticleListNormalizedStatus {
  const s = articleStatusKey(status);
  if (s === "published") return "published";
  if (s === "scheduled") return "scheduled";
  return "draft";
}

/** Same normalization as the articles table (scheduled variants). */
export function isArticleListItemScheduled(a: Pick<ArticleListItem, "status">): boolean {
  return normalizeAdminArticleListStatus(a.status) === "scheduled";
}

export function mapArticleListItemToTableRow(a: ArticleListItem): ArticleRow {
  const s = normalizeAdminArticleListStatus(a.status);
  let status: ArticleRow["status"];
  let statusColor: string;
  if (s === "published") {
    status = "published";
    statusColor = "emerald";
  } else if (s === "scheduled") {
    status = "scheduled";
    statusColor = "blue";
  } else {
    status = "draft";
    statusColor = "orange";
  }

  const contributors = Array.isArray(a.contributors) ? a.contributors.length : 0;

  return {
    id: a.id,
    slug: a.slug?.trim() || a.id,
    title: articleListItemDisplayTitle(a),
    content_type: a.content_type || "article",
    status,
    statusColor,
    updatedAtIso: a.updatedAt,
    views: String(a.view_count ?? 0),
    supporters: contributors > 0 ? String(contributors) : "—",
  };
}
