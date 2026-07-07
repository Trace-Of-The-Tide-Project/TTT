import type { Metadata } from "next";
import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { callBackend } from "@/lib/auth/proxy-backend";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await callBackend({ path: `/articles/slug/${encodeURIComponent(slug)}` });
  if (!result.ok) return {};
  const article = result.json as { title?: string; excerpt?: string } | null;
  if (!article?.title) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: `/content/article/${slug}` },
  };
}

export default async function ContentArticleSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentArticlePageClient slug={slug} />;
}
