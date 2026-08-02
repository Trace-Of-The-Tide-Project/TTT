"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { BookIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import type { ArticleListItem } from "@/services/articles.service";

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const ACCENT = "var(--tott-accent-gold)";
const MUTED = "var(--tott-home-text-muted)";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";

export function WriterLatestRelease({ works }: { works: ArticleListItem[] }) {
  const t = useTranslations("Writers");

  const latest = useMemo(() => {
    if (works.length === 0) return null;
    return [...works].sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
      return tb - ta;
    })[0];
  }, [works]);

  if (!latest) return null;

  return (
    <RevealOnScroll className="mx-auto mt-10 max-w-6xl px-6 sm:px-10">
      <Link href={`/content/article?id=${encodeURIComponent(latest.id)}`}>
        <ChamferedPanel size={14}>
          <div className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--tott-accent-gold) 14%, var(--tott-home-surface))",
                color: ACCENT,
              }}
            >
              <BookIcon />
            </span>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--tott-gold-muted)", fontFamily: SANS }}
              >
                {t("latest.eyebrow")}
              </p>
              <p
                className="mt-0.5 truncate text-lg font-medium"
                style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
              >
                {latest.title}
                {latest.reading_time ? (
                  <span className="ms-2 text-sm font-normal" style={{ color: MUTED }}>
                    · {latest.reading_time} min
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </ChamferedPanel>
      </Link>
    </RevealOnScroll>
  );
}
