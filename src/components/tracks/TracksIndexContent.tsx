"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Track } from "@/services/tracks.service";

export function TracksIndexContent({ tracks }: { tracks: Track[] }) {
  const t = useTranslations("Tracks");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1
        className="mb-8 font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl"
        style={{
          lineHeight: "var(--tott-display-leading)",
          letterSpacing: "var(--tott-display-tracking)",
        }}
      >
        {t("indexTitle")}
      </h1>

      {tracks.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] py-16 text-center text-sm text-[var(--tott-muted)]">
          {t("indexEmpty")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tracks.map((track) => {
            const accent = track.color
              ? `color-mix(in srgb, ${track.color} 100%, transparent)`
              : "var(--tott-accent-gold)";
            return (
              <li key={track.id}>
                <Link
                  href={`/tracks/${encodeURIComponent(track.slug)}`}
                  className="group block rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] p-5 transition-colors hover:border-[var(--tott-accent-gold)]/50"
                >
                  <span className="mb-3 inline-block h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
                  <p className="font-medium text-foreground group-hover:text-[var(--tott-accent-gold)]">
                    {track.title}
                  </p>
                  {track.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--tott-muted)]">
                      {track.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
