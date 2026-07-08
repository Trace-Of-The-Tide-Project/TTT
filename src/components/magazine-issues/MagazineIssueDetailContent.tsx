"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { IssuePurchaseActions } from "./IssuePurchaseActions";
import { nameInitials } from "@/components/dashboard/admin/writers/initials";
import { AvailableLanguagesBadge } from "@/components/content/AvailableLanguagesBadge";

export type IssueIndexArticle = { id: string; title: string };
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
  readingTime: number | null;
  publishedAt: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
  language: string;
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

        <h1
          className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
          style={{ color: TEXT_STRONG }}
        >
          {issue.title}
        </h1>

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

        {issue.description ? (
          <RevealOnScroll
            className="mt-8 whitespace-pre-line text-base leading-relaxed"
            style={{ color: TEXT_STRONG }}
          >
            {issue.description}
          </RevealOnScroll>
        ) : null}

        {/* Stats */}
        {(issue.pageCount || issue.readingTime) ? (
          <RevealOnScroll
            className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm"
            style={{ color: TEXT_MUTED }}
          >
            {issue.pageCount ? (
              <span>{t("pages", { count: issue.pageCount })}</span>
            ) : null}
            {issue.readingTime ? (
              <span>{t("readTime", { minutes: issue.readingTime })}</span>
            ) : null}
          </RevealOnScroll>
        ) : null}

        {/* Table of contents */}
        {issue.articles.length > 0 ? (
          <RevealOnScroll className="mt-10">
            <h2
              className="text-lg font-medium tracking-tight"
              style={{ color: TEXT_STRONG }}
            >
              {t("contents")}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {issue.articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/content/article?id=${encodeURIComponent(a.id)}`}
                    className="inline-flex items-center gap-2 text-base transition-opacity hover:opacity-90"
                    style={{ color: ACCENT }}
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
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
