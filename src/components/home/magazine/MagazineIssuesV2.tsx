"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HexCover } from "./HexCover";

const FALLBACK_IMAGE = "/images/image.png";

export type MagazineIssueItem = {
  id: string;
  title: string;
  kind?: string | null;
  pageCount?: number | null;
  coverImage?: string | null;
  excerpt?: string | null;
  edition?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
};

export type MagazineIssuesProps = {
  items: MagazineIssueItem[];
};

/**
 * Placeholder cards used when the backend returns no published
 * magazine-issues. Mirrors the Figma Variant 3 comp so the Issues
 * tab is never empty during pre-launch.
 */
const FALLBACK_ITEMS: MagazineIssueItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: `placeholder-${i}`,
  title: "The Quiet Revolution",
  edition: "12",
  category: "Art & Activism",
  publishedAt: "2026-03-01T00:00:00.000Z",
  coverImage: null,
  slug: null,
}));

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function prettify(s: string | null | undefined): string {
  const v = (s ?? "").trim();
  if (!v) return "";
  return v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Issues pane — 4-up book-card row matching Figma "Property 1=Variant3"
 * with the brand pointy-top hex silhouette as the card cover.
 *
 *   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
 *   │  hex cover│ │  hex cover│ │  hex cover│ │  hex cover│
 *   └──────────┘  └──────────┘  └──────────┘  └──────────┘
 *     Issue 12 · Mar 2026
 *     The Quiet Revolution
 *     Art & Activism
 *     Read Online →
 */
export function MagazineIssuesV2({ items }: MagazineIssuesProps) {
  const t = useTranslations("Home.magazine.issues");
  const visible = [...items, ...FALLBACK_ITEMS].slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-[1128px] flex-wrap items-stretch justify-center gap-2">
      {visible.map((item) => (
        <BookCard
          key={item.id}
          item={item}
          readOnlineLabel={t("readOnline")}
          issuePrefix={t("issuePrefix")}
        />
      ))}
    </div>
  );
}

function BookCard({
  item,
  readOnlineLabel,
  issuePrefix,
}: {
  item: MagazineIssueItem;
  readOnlineLabel: string;
  issuePrefix: string;
}) {
  const date = formatMonthYear(item.publishedAt);
  const editionLabel = item.edition ? `${issuePrefix} ${item.edition}` : "";
  const metaTop = [editionLabel, date].filter(Boolean).join(" · ");
  const tag = prettify(item.category ?? item.kind ?? "");
  const href = item.slug ? `/magazine/${item.slug}` : "/magazine";
  const imgSrc = isValidImageUrl(item.coverImage) ? item.coverImage : FALLBACK_IMAGE;

  return (
    <article className="flex w-full max-w-[276px] flex-col items-center">
      <HexCover src={imgSrc} alt={item.title} showFade />

      <div
        className="flex w-full flex-col items-center"
        style={{ padding: "16px 16px 0", gap: 16 }}
      >
        <div
          className="flex w-full flex-col items-center text-center"
          style={{ gap: 8 }}
        >
          {metaTop ? (
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {metaTop}
            </p>
          ) : null}

          <h3
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {item.title}
          </h3>

          {tag ? (
            <p
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--tott-home-text-muted)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {tag}
            </p>
          ) : null}
        </div>

        <Link
          href={href}
          className="inline-flex items-center"
          style={{
            gap: 8,
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-accent-gold)",
            textDecoration: "none",
          }}
        >
          {readOnlineLabel}
          <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}

/** 20×20 arrow-right matching the Figma Vector (1.5px stroke, accent gold). */
function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
        stroke="var(--tott-accent-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
