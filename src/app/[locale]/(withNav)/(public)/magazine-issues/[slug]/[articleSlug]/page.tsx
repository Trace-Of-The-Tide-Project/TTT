import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMagazineIssueBySlug } from "@/services/magazine-issues.service";
import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { IssueReaderShell } from "@/components/magazine-issues/IssueReaderShell";
import { callBackend } from "@/lib/auth/proxy-backend";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; articleSlug: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, articleSlug } = await params;
  const result = await callBackend({
    path: `/articles/slug/${encodeURIComponent(articleSlug)}`,
  });
  if (!result.ok) return {};
  const article = result.json as { title?: string; excerpt?: string } | null;
  if (!article?.title) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: `/magazine-issues/${slug}/${articleSlug}` },
  };
}

/** Magazine article reader — articles here belong to the magazine product and
 * must be part of the issue in the URL; anything else renders not-found. */
export default async function MagazineIssueArticlePage({ params }: PageProps) {
  const { slug, articleSlug } = await params;
  const issue = await getMagazineIssueBySlug(slug);
  if (!issue) return notFound();

  return (
    <IssueReaderShell
      issueSlug={issue.slug ?? slug}
      issueId={issue.id}
      issueTitle={issue.title}
      articleSlug={articleSlug}
    >
      <ContentArticlePageClient
        slug={articleSlug}
        expectedProduct="magazine"
        requiredIssueId={issue.id}
      />
    </IssueReaderShell>
  );
}
