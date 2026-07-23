"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { IssuePurchaseActions } from "./IssuePurchaseActions";
import { nameInitials } from "@/components/dashboard/admin/writers/initials";
import { AvailableLanguagesBadge } from "@/components/content/AvailableLanguagesBadge";
import { LockIcon } from "@/components/ui/icons";
import { ShareButton } from "@/components/ui/ShareButton";
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
};

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";

export type MagazineIssueDetail = {
  id: string;
  title: string;
  slug: string | null;
  edition: string | null;
  category: string | null;
  kind: string | null;
  excerpt: string | null;
  description: string | null;
  coverImage: string | null;
  pageCount: number | null;
  publishedAt: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
  language: string;
  sections: IssueSectionEntry[];
  /** Content blocks authored directly on the issue (quote/callout/image/…). */
  bodySections: ContentArticleSection[];
  editorsLetter: IssueEditorsLetterEntry | null;
  articles: IssueIndexArticle[];
  contributors: IssueContributorEntry[];
};

function formatLongDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MagazineIssueDetailContent({
  issue,
}: {
  issue: MagazineIssueDetail;
}) {
  const t = useTranslations("MagazineIssueDetail");
  const date = formatLongDate(issue.publishedAt);
  const meta = [
    issue.edition ? `${t("issuePrefix")} ${issue.edition}` : "",
    date,
    issue.category || issue.kind || "",
  ].filter(Boolean);

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
        className="relative mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 960px)" }}
      >
        {/* Cover */}
        {issue.coverImage ? (
          <div
            className="relative w-full overflow-hidden rounded-[20px]"
            style={{ aspectRatio: "16 / 7" }}
          >
            <Image
              src={issue.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 960px) 960px, 100vw"
              className="select-none object-cover"
              draggable={false}
            />
          </div>
        ) : null}

        {/* Meta row */}
        {meta.length > 0 ? (
          <p
            className="mt-8 flex flex-wrap items-center gap-2 text-sm"
            style={{ color: TEXT_MUTED }}
          >
            {meta.map((m, i) => (
              <span key={`${m}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 ? <span aria-hidden>·</span> : null}
                {m}
              </span>
            ))}
          </p>
        ) : null}

        <div className="mt-3 flex items-start justify-between gap-4">
          <h1
            className="text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: TEXT_STRONG }}
          >
            {issue.title}
          </h1>
          <div className="shrink-0 pt-1">
            <ShareButton title={issue.title} />
          </div>
        </div>

        {issue.excerpt ? (
          <p
            className="mt-4 text-base leading-relaxed sm:text-lg"
            style={{ color: TEXT_MUTED }}
          >
            {issue.excerpt}
          </p>
        ) : null}

        <AvailableLanguagesBadge
          contentType="issue"
          contentId={issue.id}
          currentLanguage={issue.language}
          statusFilter={(v) => v.status === "published"}
          hrefFor={(v) => `/magazine-issues/${v.slug ?? v.id}`}
          className="mt-3"
        />

        {/* Start reading — jump straight into the first article */}
        {firstReadable?.slug && articleHref(firstReadable.slug) ? (
          <RevealOnScroll className="mt-6">
            <Link
              href={articleHref(firstReadable.slug) as string}
              className="inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                borderColor: "color-mix(in srgb, var(--tott-accent-gold) 55%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
                color: ACCENT,
              }}
            >
              {t("startReading")}
              <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
            </Link>
          </RevealOnScroll>
        ) : null}

        {issue.description ? (
          <RevealOnScroll
            className="mt-8 whitespace-pre-line text-base leading-relaxed"
            style={{ color: TEXT_STRONG }}
          >
            {issue.description}
          </RevealOnScroll>
        ) : null}

        {/* Stats */}
        {issue.pageCount ? (
          <RevealOnScroll
            className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm"
            style={{ color: TEXT_MUTED }}
          >
            <span>{t("pages", { count: issue.pageCount })}</span>
          </RevealOnScroll>
        ) : null}

        {/* Issue content blocks (quote/callout/image/gallery/etc) */}
        {issue.bodySections.length > 0 ? (
          <RevealOnScroll className="mt-10">
            <ContentArticleBody sections={issue.bodySections} />
          </RevealOnScroll>
        ) : null}

        {/* Editor's letter */}
        {issue.editorsLetter ? (
          <RevealOnScroll className="mt-10">
            <div
              className="rounded-2xl border p-5"
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
              <h2
                className="mt-2 text-lg font-medium tracking-tight"
                style={{ color: TEXT_STRONG }}
              >
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
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
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
          <RevealOnScroll className="mt-10">
            <h2
              className="text-lg font-medium tracking-tight"
              style={{ color: TEXT_STRONG }}
            >
              {t("contents")}
            </h2>
            <div className="mt-4 flex flex-col gap-6">
              {groups.map((g) => (
                <div key={g.id}>
                  {g.label ? (
                    <h3
                      className="mb-2 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: TEXT_MUTED }}
                    >
                      {g.label}
                    </h3>
                  ) : null}
                  <ul
                    className={
                      g.layout === "grid"
                        ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                        : g.layout === "feature"
                          ? "flex flex-col gap-4"
                          : "flex flex-col gap-2"
                    }
                  >
                    {g.items.map((a) => {
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
                      const textClass =
                        g.layout === "feature" ? "text-xl font-medium" : "text-base";
                      return (
                        <li key={a.id}>
                          {href ? (
                            <Link
                              href={href}
                              className={`inline-flex items-center gap-2 transition-opacity hover:opacity-90 ${textClass}`}
                              style={{ color: ACCENT }}
                            >
                              {a.title}
                              {lock}
                            </Link>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-2 ${textClass}`}
                              style={{ color: TEXT_MUTED }}
                            >
                              {a.title}
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
          <RevealOnScroll className="mt-10">
            <h2
              className="text-lg font-medium tracking-tight"
              style={{ color: TEXT_STRONG }}
            >
              {t("contributorsHeading")}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
              {issue.contributors.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 18%, transparent)",
                      color: ACCENT,
                    }}
                  >
                    {nameInitials(c.name)}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block truncate text-sm font-medium"
                      style={{ color: TEXT_STRONG }}
                    >
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

        {/* Actions */}
        <RevealOnScroll className="mt-10 flex flex-wrap items-center gap-3">
          <IssuePurchaseActions
            issueId={issue.id}
            slug={issue.slug}
            price={issue.price}
            currency={issue.currency}
            isFree={issue.isFree}
            isOwned={issue.isOwned}
          />
          <Link
            href="/magazine"
            className="inline-flex h-10 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: ACCENT }}
          >
            {t("backToMagazine")}
            <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </RevealOnScroll>
      </div>
    </main>
  );
}
