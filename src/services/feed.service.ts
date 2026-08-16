import { api } from "./api";
import type { ArticleListItem } from "./articles.service";
import type { ReactionSummary } from "./reactions.service";

export type FeedSocial = ReactionSummary & { comment_count: number };

export type FeedArticleItem = {
  type: "article";
  id: string;
  published_at: string | null;
  origin: "follow" | "platform";
  article: ArticleListItem;
  social: FeedSocial;
};

export type FeedMagazineIssueItem = {
  type: "magazine_issue";
  id: string;
  published_at: string | null;
  origin: "follow" | "platform";
  issue: {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    cover_image: string | null;
    excerpt: string | null;
    description: string | null;
    edition_number: number | null;
    language: string;
  };
  social: FeedSocial;
};

export type FeedBookItem = {
  type: "book";
  id: string;
  published_at: string | null;
  origin: "follow" | "platform";
  book: {
    id: string;
    title: string;
    author: string;
    cover_image: string | null;
    summary: string | null;
    language: string;
  };
  social: FeedSocial;
};

export type FeedItem = FeedArticleItem | FeedMagazineIssueItem | FeedBookItem;

export type FeedPage = {
  rows: FeedItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** GET /follows/feed — mixed stream of articles/issues/books from follows + platform highlights. */
export async function getFollowingFeed(params?: {
  page?: number;
  limit?: number;
}): Promise<FeedPage> {
  const res = await api.get("/follows/feed", { params });
  return { rows: res.data.data ?? [], meta: res.data.meta };
}
