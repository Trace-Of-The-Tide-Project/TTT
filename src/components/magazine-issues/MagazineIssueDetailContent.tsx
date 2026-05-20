"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";

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

        {issue.description ? (
          <div
            className="mt-8 whitespace-pre-line text-base leading-relaxed"
            style={{ color: TEXT_STRONG }}
          >
            {issue.description}
          </div>
        ) : null}

        {/* Stats */}
        {(issue.pageCount || issue.readingTime) ? (
          <div
            className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm"
            style={{ color: TEXT_MUTED }}
          >
            {issue.pageCount ? (
              <span>{t("pages", { count: issue.pageCount })}</span>
            ) : null}
            {issue.readingTime ? (
              <span>{t("readTime", { minutes: issue.readingTime })}</span>
            ) : null}
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/open-issues"
            className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--tott-magazine-btn-bg)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            {t("supportCta")}
          </Link>
          <Link
            href="/magazine"
            className="inline-flex h-10 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: ACCENT }}
          >
            {t("backToMagazine")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
