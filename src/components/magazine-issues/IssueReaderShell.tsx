"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useIssueArticles } from "@/hooks/queries/issue-articles";
import { LockIcon } from "@/components/ui/icons";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";
const PANEL = "var(--tott-panel-bg, var(--tott-home-surface))";

/**
 * Wraps the magazine article reader with in-issue navigation: a fixed bottom
 * bar (previous / issue position / next) and a table-of-contents drawer. The
 * article body renders as `children`; only published articles with a slug take
 * part in the sequence. Direction follows the UI locale (root layout sets dir),
 * so arrows just mirror via `rtl:-scale-x-100`.
 */
export function IssueReaderShell({
  issueSlug,
  issueId,
  issueTitle,
  articleSlug,
  children,
}: {
  issueSlug: string;
  issueId: string;
  issueTitle: string;
  articleSlug: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("MagazineIssueDetail");
  const { data } = useIssueArticles(issueId);
  const articles = useMemo(
    () => (data ?? []).filter((a) => a.slug && a.status === "published"),
    [data],
  );
  const idx = articles.findIndex((a) => a.slug === articleSlug);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : null;
  const [tocOpen, setTocOpen] = useState(false);

  const hrefFor = (slug: string) =>
    `/magazine-issues/${encodeURIComponent(issueSlug)}/${encodeURIComponent(slug)}`;

  return (
    <div className="relative pb-24">
      {children}

      {/* In-issue navigation — fixed above the fold so it never collides with
          the sticky site nav at the top. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md"
        style={{
          borderColor: "var(--tott-card-border)",
          backgroundColor: "color-mix(in srgb, var(--tott-home-surface) 88%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-2.5">
          {prev?.slug ? (
            <Link
              href={hrefFor(prev.slug)}
              className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ color: ACCENT }}
            >
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                ‹
              </span>
              <span className="truncate">{t("reader.previous")}</span>
            </Link>
          ) : (
            <span aria-hidden className="w-16" />
          )}

          <button
            type="button"
            onClick={() => setTocOpen(true)}
            className="flex min-w-0 flex-col items-center px-2"
            style={{ color: TEXT_STRONG }}
          >
            <span className="max-w-[52vw] truncate text-sm font-medium">
              {issueTitle}
            </span>
            {idx >= 0 ? (
              <span className="text-xs" style={{ color: TEXT_MUTED }}>
                {t("reader.position", { current: idx + 1, total: articles.length })}
              </span>
            ) : null}
          </button>

          {next?.slug ? (
            <Link
              href={hrefFor(next.slug)}
              className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ color: ACCENT }}
            >
              <span className="truncate">{t("reader.next")}</span>
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                ›
              </span>
            </Link>
          ) : (
            <span aria-hidden className="w-16" />
          )}
        </div>
      </div>

      {tocOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label={t("reader.close")}
            onClick={() => setTocOpen(false)}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "var(--tott-overlay, rgba(0,0,0,0.5))" }}
          />
          <div
            className="relative m-3 max-h-[75vh] w-full max-w-md overflow-y-auto rounded-2xl border p-5 shadow-2xl"
            style={{ borderColor: "var(--tott-card-border)", backgroundColor: PANEL }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold" style={{ color: TEXT_STRONG }}>
                {t("contents")}
              </h2>
              <Link
                href={`/magazine-issues/${encodeURIComponent(issueSlug)}`}
                onClick={() => setTocOpen(false)}
                className="text-xs font-medium transition-opacity hover:opacity-90"
                style={{ color: ACCENT }}
              >
                {t("reader.backToIssue")}
              </Link>
            </div>
            <ol className="flex flex-col gap-1">
              {articles.map((a, i) => {
                const active = a.slug === articleSlug;
                return (
                  <li key={a.id}>
                    <Link
                      href={hrefFor(a.slug as string)}
                      onClick={() => setTocOpen(false)}
                      className="flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                      style={{
                        color: active ? ACCENT : TEXT_STRONG,
                        backgroundColor: active
                          ? "color-mix(in srgb, var(--tott-accent-gold) 12%, transparent)"
                          : "transparent",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span className="tabular-nums text-xs" style={{ color: TEXT_MUTED }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">{a.title}</span>
                      {a.access === "locked" ? (
                        <span
                          aria-hidden
                          className="inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5"
                          style={{ color: TEXT_MUTED }}
                          title={t("locked")}
                        >
                          <LockIcon />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}
