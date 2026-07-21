import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { articleBlocksToSections } from "@/lib/content/article-blocks-to-sections";
import {
  getMagazineIssueBySlug,
  getIssueArticles,
  getIssueContributors,
} from "@/services/magazine-issues.service";
import {
  MagazineIssueDetailContent,
  type MagazineIssueDetail,
} from "@/components/magazine-issues/MagazineIssueDetailContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function MagazineIssueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const issue = await getMagazineIssueBySlug(slug);
  if (!issue) return notFound();

  const [articles, contributors] = await Promise.all([
    getIssueArticles(issue.id),
    getIssueContributors(issue.id),
  ]);
  const priceNum =
    issue.price == null || issue.price === "" ? null : Number(issue.price);

  const ref = issue.cover_image?.trim();
  const cover =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;

  const detail: MagazineIssueDetail = {
    id: issue.id,
    title: issue.title,
    slug: issue.slug ?? null,
    edition: issue.edition ?? null,
    category: issue.category ?? null,
    kind: issue.kind ?? null,
    excerpt: issue.excerpt ?? null,
    description: issue.description ?? null,
    coverImage: cover,
    pageCount:
      typeof issue.page_count === "number" && issue.page_count > 0
        ? issue.page_count
        : null,
    publishedAt: issue.published_at ?? null,
    language: issue.language ?? "en",
    price: priceNum != null && priceNum > 0 ? priceNum : null,
    currency: issue.currency ?? "USD",
    isFree: Boolean(issue.is_free),
    isOwned: Boolean(issue.is_owned),
    sections: (issue.sections ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      isVisible: s.is_visible !== false,
      layout: (s.layout ?? "list") as "list" | "grid" | "feature",
    })),
    bodySections: issue.body_blocks?.length
      ? articleBlocksToSections(issue.body_blocks)
      : [],
    editorsLetter: issue.editors_letter
      ? {
          id: issue.editors_letter.id,
          title: issue.editors_letter.title,
          slug: issue.editors_letter.slug ?? null,
          excerpt: issue.editors_letter.excerpt ?? null,
        }
      : null,
    // Public TOC shows published articles only; drafts are admin-visible via
    // the same endpoint but never surfaced to readers.
    articles: articles
      .filter((a) => a.status === "published")
      .map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug ?? null,
        sectionId: a.section_id ?? null,
        locked: a.access === "locked",
      })),
    contributors: contributors.map((c) => ({
      id: c.id,
      name:
        c.writer?.pen_name?.trim() ||
        c.writer?.display_name?.trim() ||
        c.writer?.user?.full_name?.trim() ||
        "—",
      role: c.role,
    })),
  };

  return <MagazineIssueDetailContent issue={detail} />;
}
