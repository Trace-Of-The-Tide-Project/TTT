import type { Metadata } from "next";
import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { callBackend } from "@/lib/auth/proxy-backend";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await callBackend({
    path: `/articles/slug/${encodeURIComponent(slug)}`,
  });
  if (!result.ok) return {};
  const article = result.json as { title?: string; excerpt?: string } | null;
  if (!article?.title) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: `/magazine/articles/${slug}` },
  };
}

/** Magazine article reader — loose magazine-pool articles (product=magazine, no
 * issue). Any product='main' article renders not-found via the reader's own
 * productMismatch guard; no issue is required here. */
export default async function MagazineArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <ContentArticlePageClient slug={slug} expectedProduct="magazine" />;
}
