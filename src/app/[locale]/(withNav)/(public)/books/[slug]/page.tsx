import { notFound } from "next/navigation";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import {
  BookDetailContent,
  type BookDetail,
  type BookReview,
} from "@/components/books/BookDetailContent";

export const dynamic = "force-dynamic";

type RawArticle = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  cover_image?: string | null;
  category?: string | null;
  language?: string | null;
  edition?: string | null;
  reading_time?: number | null;
  view_count?: number | null;
  published_at?: string | null;
  createdAt?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null; avatar?: string | null } | null;
  } | null;
  contributors?: Array<{
    full_name?: string | null;
    username?: string | null;
  }> | null;
  blocks?: Array<{ block_type?: string }> | null;
};

function unwrapDetail(raw: unknown): RawArticle | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (
    inner &&
    typeof inner === "object" &&
    inner !== null &&
    "id" in inner &&
    "title" in inner
  ) {
    return inner as RawArticle;
  }
  if ("id" in o && "title" in o) return o as unknown as RawArticle;
  return null;
}

function pickAuthor(a: RawArticle["author"]): string {
  return (
    a?.profile?.display_name?.trim() ||
    a?.full_name?.trim() ||
    a?.username?.trim() ||
    "Author"
  );
}

function prettifyCategory(c: string | null | undefined): string {
  const v = (c ?? "").trim();
  if (!v) return "";
  return v.replace(/[_-]+/g, " ").toLowerCase();
}

function getYear(iso: string | null | undefined): string {
  const v = (iso ?? "").trim();
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

function languageName(code: string | null | undefined): string {
  const v = (code ?? "").trim().toLowerCase();
  if (!v) return "";
  const map: Record<string, string> = {
    en: "English",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
    de: "German",
  };
  return map[v] ?? v.toUpperCase();
}

/** Stable demo reviews keyed by article id so re-renders don't
 * shuffle them. Replace once the backend exposes reviews. */
function demoReviews(articleId: string): BookReview[] {
  const base = articleId.slice(0, 8);
  return [
    {
      id: `${base}-r1`,
      author: "Author Name",
      date: "01 Jan 2024",
      rating: 4,
      body: "Absolutely captivating! Couldn't put it down. Sarah Williams has created a masterpiece of adventure fiction.",
    },
    {
      id: `${base}-r2`,
      author: "Author Name",
      date: "01 Jan 2024",
      rating: 4,
      body: "Great pacing and wonderful character development. The world-building is incredible.",
    },
    {
      id: `${base}-r3`,
      author: "Author Name",
      date: "01 Jan 2024",
      rating: 4,
      body: "Absolutely captivating! Couldn't put it down. Sarah Williams has created a masterpiece of adventure fiction.",
      quote: "“The greatest adventure is what lies ahead.”",
      quotePage: 7,
    },
  ];
}

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const raw = await serverGet<unknown>(
    `/articles/slug/${encodeURIComponent(slug)}`,
  );
  const article = unwrapDetail(raw);
  if (!article) return notFound();

  const ref = article.cover_image?.trim();
  const cover =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;

  const detail: BookDetail = {
    id: article.id,
    slug: article.slug ?? slug,
    title: article.title,
    excerpt: article.excerpt ?? null,
    coverImage: cover,
    category: prettifyCategory(article.category),
    author: pickAuthor(article.author),
    coAuthors: (article.contributors ?? [])
      .map((c) => c.full_name?.trim() || c.username?.trim() || "")
      .filter(Boolean)
      .slice(0, 5)
      .join(", "),
    publisher: "Publisher Name",
    year:
      getYear(article.published_at) ||
      getYear(article.createdAt ?? null) ||
      "",
    language: languageName(article.language),
    pageCount: article.reading_time ? article.reading_time * 220 : 220,
    rating: 4.5,
    reviewCount: 158,
    contentTypeLabel: "Download PDF file",
    blocksCount: Array.isArray(article.blocks) ? article.blocks.length : 0,
  };

  const reviews = demoReviews(article.id);

  return <BookDetailContent book={detail} reviews={reviews} />;
}
