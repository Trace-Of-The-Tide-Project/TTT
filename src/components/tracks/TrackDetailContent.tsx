"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TrackEntityType } from "@/services/tracks.service";

export type TrackDetailItem = {
  entity_type: TrackEntityType;
  id: string;
  title: string | null;
  slug: string | null;
  cover: string | null;
  publishedAt: string | null;
};

export type TrackDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  color: string | null;
  items: TrackDetailItem[];
};

function hrefFor(item: TrackDetailItem): string {
  if (item.entity_type === "book") return `/books/${encodeURIComponent(item.id)}`;
  if (item.entity_type === "magazine_issue") {
    return `/magazine-issues/${encodeURIComponent(item.slug ?? item.id)}`;
  }
  // Article — plain-article default route; video/audio/gallery/thread and
  // magazine-product variants aren't distinguishable from a TrackItem alone.
  return item.slug
    ? `/content/article/${encodeURIComponent(item.slug)}`
    : `/content/article?id=${encodeURIComponent(item.id)}`;
}

export function TrackDetailContent({ track }: { track: TrackDetail }) {
  const t = useTranslations("Tracks");
  const accent = track.color
    ? `color-mix(in srgb, ${track.color} 100%, transparent)`
    : "var(--tott-accent-gold)";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-3">
        <span
          className="inline-block h-1.5 w-12 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <h1
          className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {track.title}
        </h1>
        {track.description ? (
          <p className="max-w-2xl text-[var(--tott-muted)]">{track.description}</p>
        ) : null}
      </div>

      {track.items.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] py-16 text-center text-sm text-[var(--tott-muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {track.items.map((item) => (
            <li key={`${item.entity_type}:${item.id}`}>
              <Link
                href={hrefFor(item)}
                className="group flex gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] p-4 transition-colors hover:border-[var(--tott-accent-gold)]/50"
              >
                {item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <span className="mb-1 inline-flex rounded-full border border-[var(--tott-card-border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--tott-muted)]">
                    {t(`type.${item.entity_type}`)}
                  </span>
                  <p className="truncate font-medium text-foreground group-hover:text-[var(--tott-accent-gold)]">
                    {item.title ?? item.id}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
