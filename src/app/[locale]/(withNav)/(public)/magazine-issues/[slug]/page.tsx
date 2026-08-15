import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";
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
import { fetchIssues, attachIssueFraming } from "@/components/home/magazine-next/data";
import { getFramingsServer } from "@/services/image-framing.service";
import { ISSUE_FRAMING_ENTITY, ISSUE_FRAMING_FIELD } from "@/components/home/magazine-next/issue-framing";
import {
  MagazineIssueDetailContent,
  type MagazineIssueDetail,
} from "@/components/magazine-issues/MagazineIssueDetailContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function MagazineIssueDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const issue = await getMagazineIssueBySlug(slug);
  if (!issue) {
    const t = await getTranslations({ locale, namespace: "Magazine.issueNotFound" });
    return (
      <ComingSoon
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
        ctaLabel={t("cta")}
        ctaHref="/magazine"
      />
    );
  }

  const [articles, contributors, relatedRaw] = await Promise.all([
    getIssueArticles(issue.id),
    getIssueContributors(issue.id),
    fetchIssues(locale, 8),
  ]);
  const relatedIssues = (
    await attachIssueFraming(relatedRaw.filter((r) => r.id !== issue.id).slice(0, 4))
  );

  const priceNum =
    issue.price == null || issue.price === "" ? null : Number(issue.price);

  // The cover bucket has no public-read grant; prefer the backend's signed URL.
  const ref = (issue.cover_image_url ?? issue.cover_image)?.trim();
  const cover =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;

  // Admin-set focal-point framing for this issue's own cover, same source the
  // archive/related cards use.
  const ownFraming = (
    await getFramingsServer(ISSUE_FRAMING_ENTITY, [issue.id], ISSUE_FRAMING_FIELD)
  )[issue.id]?.[ISSUE_FRAMING_FIELD];

  const detail: MagazineIssueDetail = {
    id: issue.id,
    title: issue.title,
    subtitle: issue.subtitle ?? null,
    slug: issue.slug ?? null,
    edition: issue.edition ?? null,
    editionNumber: issue.edition_number ?? null,
    category: issue.category ?? null,
    kind: issue.kind ?? null,
    excerpt: issue.excerpt ?? null,
    description: issue.description ?? null,
    coverImage: cover,
    coverFraming: ownFraming,
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
    denyReason: issue.deny_reason ?? null,
    commonsAt: issue.commons_at ?? null,
    giftValueInitial: issue.gift_value_initial != null ? Number(issue.gift_value_initial) : null,
    giftRaisedTotal: issue.gift_raised_total != null ? Number(issue.gift_raised_total) : null,
    hasPdf: Boolean(issue.pdf_url),
    relatedIssues,
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
      avatar: c.writer?.avatar_url ?? c.writer?.avatar ?? null,
    })),
  };

  return <MagazineIssueDetailContent issue={detail} />;
}
