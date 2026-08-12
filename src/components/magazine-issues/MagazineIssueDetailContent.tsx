"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { IssuePurchaseModule } from "./IssuePurchaseModule";
import { IssueStickyBuyBar } from "./IssueStickyBuyBar";
import { RelatedIssuesStrip } from "./RelatedIssuesStrip";
import { nameInitials } from "@/components/dashboard/admin/writers/initials";
import { ContentLanguageNotice } from "@/components/content/ContentLanguageNotice";
import { LockIcon } from "@/components/ui/icons";
import { ShareButton } from "@/components/ui/ShareButton";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import type { ImageFraming } from "@/lib/image-framing";
import type { IssueCard } from "@/components/home/magazine-next/data";
import {
  ContentArticleBody,
  type ContentArticleSection,
} from "@/components/content/article/ContentArticleBody";

export type IssueIndexArticle = {
  id: string;
  title: string;
  slug?: string | null;
  sectionId?: string | null;
  locked?: boolean;
};
export type IssueSectionEntry = {
  id: string;
  title: string;
  isVisible?: boolean;
  layout?: "list" | "grid" | "feature";
};
export type IssueEditorsLetterEntry = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
};
export type IssueContributorEntry = {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
};

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";
const PURCHASE_ANCHOR_ID = "issue-purchase-module";

export type MagazineIssueDetail = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  edition: string | null;
  editionNumber: number | null;
  category: string | null;
  kind: string | null;
  excerpt: string | null;
  description: string | null;
  coverImage: string | null;
  coverFraming?: ImageFraming;
  pageCount: number | null;
  publishedAt: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
  hasPdf: boolean;
  language: string;
  sections: IssueSectionEntry[];
  /** Content blocks authored directly on the issue (quote/callout/image/…). */
  bodySections: ContentArticleSection[];
  editorsLetter: IssueEditorsLetterEntry | null;
  articles: IssueIndexArticle[];
  contributors: IssueContributorEntry[];
  relatedIssues: IssueCard[];
};

function formatLongDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    const fmt = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" });
    return fmt.format(d);
  } catch {
    return "";
  }
}

function padIndex(n: number): string {
  const s = String(n);
  return s.length >= 2 ? s : "0" + s;
}

export function MagazineIssueDetailContent({
  issue,
}: {
  issue: MagazineIssueDetail;
}) {
  const t = useTranslations("MagazineIssueDetail");
  const locale = useLocale();
  const date = formatLongDate(issue.publishedAt, locale);
  const eyebrowParts = [
    issue.edition ? t("issuePrefix") + " " + issue.edition : "",
    issue.category || issue.kind || "",
  ].filter(Boolean);
  const eyebrow = eyebrowParts.join(" · ");

  const articleHref = (slug: string) =>
    issue.slug
      ? `/magazine-issues/${encodeURIComponent(issue.slug)}/${encodeURIComponent(slug)}`
      : null;

  // First readable article — drives the "Start reading" CTA.
  const firstReadable = issue.articles.find((a) => a.slug);

  // Group the TOC by section, preserving section order; a trailing "ungrouped"
  // bucket collects articles with no section. With no sections defined, the
  // whole list falls into one unlabelled group (the flat legacy layout).
  const groups = useMemo(() => {
    const bySection = new Map<string | null, IssueIndexArticle[]>();
    for (const a of issue.articles) {
      const key = a.sectionId ?? null;
      const bucket = bySection.get(key);
      if (bucket) bucket.push(a);
      else bySection.set(key, [a]);
    }
    const ordered: {
      id: string;
      label: string | null;
      layout: "list" | "grid" | "feature";
      items: IssueIndexArticle[];
    }[] = [];
    for (const s of issue.sections) {
      if (s.isVisible === false) continue;
      const items = bySection.get(s.id);
      if (items?.length) {
        ordered.push({ id: s.id, label: s.title, layout: s.layout ?? "list", items });
      }
    }
    const ungrouped = bySection.get(null);
    if (ungrouped?.length) {
      ordered.push({
        id: "__ungrouped",
        label: issue.sections.length > 0 ? t("ungrouped") : null,
        layout: "list",
        items: ungrouped,
      });
    }
    return ordered;
  }, [issue.articles, issue.sections, t]);

  // Metadata rows: only fields that actually exist show up — a thin issue
  // shows two rows, not six placeholders.
  const metaRows: { label: string; value: string }[] = [
    issue.pageCount ? { label: t("meta.pages"), value: t("pages", { count: issue.pageCount }) } : null,
    date ? { label: t("meta.published"), value: date } : null,
    issue.language ? { label: t("meta.language"), value: issue.language.toUpperCase() } : null,
    issue.editionNumber != null
      ? { label: t("meta.edition"), value: String(issue.editionNumber) }
      : null,
    issue.hasPdf || issue.isFree || issue.isOwned
      ? { label: t("meta.format"), value: t("format.digital") }
      : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  const relatedIssues = issue.relatedIssues.filter((r) => r.id !== issue.id).slice(0, 4);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto w-full px-4 pb-28 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32 lg:pb-20"
        style={{ maxWidth: "min(94vw, 1200px)" }}
      >
        {/* Back to archive */}
        <Link
          href="/magazine-issues"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: ACCENT }}
        >
          <span aria-hidden className="inline-block rtl:-scale-x-100">←</span>
          {t("allIssues")}
        </Link>

        {/* Hero: cover | info + purchase */}
        <div className="mt-6 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          {/* Cover */}
          <div className="lg:sticky lg:top-28">
            <div className="relative mx-auto w-full max-w-[420px]">
              <ChamferedFrame />
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {issue.coverImage ? (
                  <MagImage
                    src={issue.coverImage}
                    alt={issue.title}
                    framing={issue.coverFraming}
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="select-none object-cover"
                    draggable={false}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Info + purchase */}
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: ACCENT }}
              >
                {eyebrow}
              </p>
            ) : null}

            <div className="mt-3 flex items-start justify-between gap-4">
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.25rem]"
                style={{
                  color: TEXT_STRONG,
                  lineHeight: "var(--tott-display-leading)",
                  letterSpacing: "var(--tott-display-tracking)",
                }}
              >
                {issue.title}
              </h1>
              <div className="shrink-0 pt-1">
                <ShareButton title={issue.title} />
              </div>
            </div>

            {issue.subtitle ? (
              <p className="font-display mt-2 text-lg" style={{ color: TEXT_MUTED }}>
                {issue.subtitle}
              </p>
            ) : null}

            {date ? (
              <p className="mt-3 text-sm" style={{ color: TEXT_MUTED }}>
                {date}
              </p>
            ) : null}

            {issue.excerpt ? (
              <p className="mt-4 text-lg leading-[1.7]" style={{ color: TEXT_MUTED }}>
                {issue.excerpt}
              </p>
            ) : null}

            <ContentLanguageNotice
              contentType="issue"
              contentId={issue.id}
              contentLanguage={issue.language}
              variant="issue"
              statusFilter={(v) => v.status === "published"}
              hrefFor={(v) => `/magazine-issues/${v.slug ?? v.id}`}
              className="mt-3"
            />

            {/* Start reading — jump straight into the first article */}
            {firstReadable?.slug && articleHref(firstReadable.slug) ? (
              <Link
                href={articleHref(firstReadable.slug) as string}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: "color-mix(in srgb, var(--tott-accent-gold) 55%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
                  color: ACCENT,
                }}
              >
                {t("startReading")}
                <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
              </Link>
            ) : null}

            {issue.description ? (
              <p
                className="mt-6 whitespace-pre-line text-base leading-relaxed"
                style={{ color: TEXT_STRONG }}
              >
                {issue.description}
              </p>
            ) : null}

            {/* Purchase module */}
            <div id={PURCHASE_ANCHOR_ID} className="mt-8">
              <IssuePurchaseModule
                issueId={issue.id}
                slug={issue.slug}
                price={issue.price}
                currency={issue.currency}
                isFree={issue.isFree}
                isOwned={issue.isOwned}
              />
            </div>

            {/* Metadata */}
            {metaRows.length > 0 ? (
              <dl
                className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-5 sm:grid-cols-3"
                style={{ borderColor: "var(--tott-card-border)" }}
              >
                {metaRows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium" style={{ color: TEXT_STRONG }}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {/* Issue content blocks (quote/callout/image/gallery/etc) */}
        {issue.bodySections.length > 0 ? (
          <RevealOnScroll className="mt-16">
            <ContentArticleBody sections={issue.bodySections} />
          </RevealOnScroll>
        ) : null}

        {/* Editor's letter */}
        {issue.editorsLetter ? (
          <RevealOnScroll className="mt-16">
            <div
              className="rounded-2xl border p-5 sm:p-6"
              style={{
                borderColor: "var(--tott-card-border)",
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 6%, transparent)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: ACCENT }}
              >
                {t("editorsLetter")}
              </p>
              <h2 className="font-display mt-2 text-xl" style={{ color: TEXT_STRONG }}>
                {issue.editorsLetter.title}
              </h2>
              {issue.editorsLetter.excerpt ? (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                  {issue.editorsLetter.excerpt}
                </p>
              ) : null}
              {issue.editorsLetter.slug && articleHref(issue.editorsLetter.slug) ? (
                <Link
                  href={articleHref(issue.editorsLetter.slug) as string}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: ACCENT }}
                >
                  {t("readEditorsLetter")}
                  <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
                </Link>
              ) : null}
            </div>
          </RevealOnScroll>
        ) : null}

        {/* Table of contents (grouped by section) */}
        {groups.length > 0 ? (
          <RevealOnScroll className="mt-16">
            <h2
              className="font-display border-b pb-3 text-2xl"
              style={{ color: TEXT_STRONG, borderColor: "var(--tott-card-border)" }}
            >
              {t("contents")}
            </h2>
            <div className="mt-6 flex flex-col gap-8">
              {groups.map((g) => (
                <div key={g.id}>
                  {g.label ? (
                    <h3
                      className="mb-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: TEXT_MUTED }}
                    >
                      {g.label}
                    </h3>
                  ) : null}
                  <ul
                    className={
                      g.layout === "grid"
                        ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                        : "flex flex-col gap-1"
                    }
                  >
                    {g.items.map((a, i) => {
                      const href = a.slug ? articleHref(a.slug) : null;
                      const lock = a.locked ? (
                        <span
                          aria-hidden
                          className="inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5"
                          style={{ color: TEXT_MUTED }}
                          title={t("locked")}
                        >
                          <LockIcon />
                        </span>
                      ) : null;
                      const index = padIndex(i + 1);
                      const textClass = g.layout === "feature" ? "text-xl font-medium" : "text-base";
                      const rowStyle: React.CSSProperties = { borderColor: "var(--tott-card-border)" };
                      return (
                        <li key={a.id}>
                          {href ? (
                            <Link
                              href={href}
                              className={`group flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--tott-accent-gold)_8%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${textClass}`}
                              style={rowStyle}
                            >
                              <span aria-hidden className="shrink-0 text-xs tabular-nums" style={{ color: TEXT_MUTED }}>
                                {index}
                              </span>
                              <span
                                className="flex-1 truncate transition-colors group-hover:opacity-90"
                                style={{ color: ACCENT }}
                              >
                                {a.title}
                              </span>
                              {lock}
                            </Link>
                          ) : (
                            <span className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${textClass}`} style={rowStyle}>
                              <span aria-hidden className="shrink-0 text-xs tabular-nums" style={{ color: TEXT_MUTED }}>
                                {index}
                              </span>
                              <span className="flex-1 truncate" style={{ color: TEXT_MUTED }}>
                                {a.title}
                              </span>
                              {lock}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        ) : null}

        {/* Editors / Contributors */}
        {issue.contributors.length > 0 ? (
          <RevealOnScroll className="mt-16">
            <h2
              className="font-display border-b pb-3 text-2xl"
              style={{ color: TEXT_STRONG, borderColor: "var(--tott-card-border)" }}
            >
              {t("contributorsHeading")}
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-5">
              {issue.contributors.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  {c.avatar ? (
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <MagImage src={c.avatar} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                  ) : (
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 18%, transparent)",
                        color: ACCENT,
                      }}
                    >
                      {nameInitials(c.name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium" style={{ color: TEXT_STRONG }}>
                      {c.name}
                    </span>
                    <span className="block truncate text-xs" style={{ color: TEXT_MUTED }}>
                      {t.has(`roles.${c.role}`) ? t(`roles.${c.role}`) : c.role}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        ) : null}

        {/* Back to magazine */}
        <div className="mt-16">
          <Link
            href="/magazine"
            className="inline-flex h-10 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: ACCENT }}
          >
            {t("backToMagazine")}
            <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </div>

        {/* Explore more issues — the page never ends on empty whitespace */}
        {relatedIssues.length > 0 ? (
          <RevealOnScroll className="mt-16">
            <RelatedIssuesStrip issues={relatedIssues} />
          </RevealOnScroll>
        ) : null}
      </div>

      <IssueStickyBuyBar
        anchorId={PURCHASE_ANCHOR_ID}
        issueId={issue.id}
        slug={issue.slug}
        price={issue.price}
        currency={issue.currency}
        isFree={issue.isFree}
        isOwned={issue.isOwned}
      />
    </main>
  );
}
