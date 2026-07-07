"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const FALLBACK_IMAGE = "/images/image.png";

export type LessReadArticleItem = {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  coverImage?: string | null;
};

export type MagazineLessReadProps = {
  items: LessReadArticleItem[];
};

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * "Explore Less Read Content" — plain rectangular article-card grid
 * (replaces the old hex/Mask.png "category card" row). Same visual
 * language as MagazineIssuesV2/MagazineLatestPublishedV2: cover image,
 * category eyebrow, title, author/date meta — no hex silhouette.
 */
export function MagazineLessReadV2({ items }: MagazineLessReadProps) {
  const t = useTranslations("Home.magazine.editorialBoard");

  if (items.length === 0) return null;

  const visible = items.slice(0, 5);

  return (
    <div
      className="mx-auto flex w-full max-w-[1128px] flex-col items-center"
      style={{ gap: 32 }}
    >
      <h2
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: 24,
          lineHeight: "32px",
          color: "var(--tott-home-text-strong)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {t("lessReadHeading")}
      </h2>

      <div
        className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        style={{ gap: 24 }}
      >
        {visible.map((item) => (
          <ArticleCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ArticleCard({ item }: { item: LessReadArticleItem }) {
  const href = item.id
    ? `/content/article?id=${encodeURIComponent(item.id)}`
    : "/magazine";
  const hasRealCover = isValidImageUrl(item.coverImage);
  const [coverFailed, setCoverFailed] = useState(false);
  const imgSrc =
    hasRealCover && !coverFailed && item.coverImage
      ? item.coverImage
      : FALLBACK_IMAGE;
  const meta = [item.author, item.date].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      className="flex w-full flex-col items-start transition-opacity hover:opacity-90"
    >
      <div
        className="relative w-full overflow-hidden rounded-[12px]"
        style={{ aspectRatio: "4 / 5" }}
      >
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          unoptimized={hasRealCover && !coverFailed}
          className="select-none object-cover"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
          draggable={false}
          onError={() => setCoverFailed(true)}
        />
      </div>

      <div className="flex w-full flex-col" style={{ gap: 4, marginTop: 12 }}>
        {item.category ? (
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "16px",
              color: "var(--tott-dash-gold-label)",
              margin: 0,
            }}
          >
            {item.category}
          </p>
        ) : null}

        {item.title ? (
          <h3
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              margin: 0,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {item.title}
          </h3>
        ) : null}

        {meta ? (
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "16px",
              color: "var(--tott-home-text-muted)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
