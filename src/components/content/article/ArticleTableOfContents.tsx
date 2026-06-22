"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { articleHeadingId } from "./ContentArticleBody";

export type TocEntry = { id: string; label: string };

/**
 * Build TOC entries from article sections that carry a heading. Mirrors
 * the id scheme used by ContentArticleBody so anchors line up.
 */
export function tocEntriesFromSections(
  sections: { heading?: string }[],
): TocEntry[] {
  return sections
    .map((s, i) => ({ heading: s.heading, i }))
    .filter((s): s is { heading: string; i: number } => !!s.heading)
    .map((s) => ({ id: articleHeadingId(s.heading, s.i), label: s.heading }));
}

/**
 * Sticky, calm table of contents. Highlights the section currently in
 * view via IntersectionObserver. Collapses to a <details> on small
 * screens. Renders nothing when there are fewer than two headings.
 */
export function ArticleTableOfContents({
  entries,
  title,
}: {
  entries: TocEntry[];
  title: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(
    entries[0]?.id ?? null,
  );

  useEffect(() => {
    if (entries.length === 0) return;
    const observer = new IntersectionObserver(
      (obs) => {
        const visible = obs
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const entry of entries) {
      const el = document.getElementById(entry.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 2) return null;

  const list = (
    <ul className="flex flex-col gap-1.5">
      {entries.map((e) => {
        const active = e.id === activeId;
        return (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="block border-s-2 ps-3 text-sm leading-snug transition-colors"
              style={{
                borderColor: active ? theme.accentGold : "var(--tott-card-border)",
                color: active ? theme.accentGold : "var(--tott-muted)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {e.label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label={title}>
      {/* Desktop: sticky panel */}
      <div
        className="hidden rounded-2xl border p-5 lg:block"
        style={{ borderColor: theme.cardBorder, backgroundColor: theme.homeSurface }}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {title}
        </p>
        {list}
      </div>
      {/* Mobile: collapsed */}
      <details
        className="rounded-2xl border p-4 lg:hidden"
        style={{ borderColor: theme.cardBorder, backgroundColor: theme.homeSurface }}
      >
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {title}
        </summary>
        <div className="mt-3">{list}</div>
      </details>
    </nav>
  );
}
