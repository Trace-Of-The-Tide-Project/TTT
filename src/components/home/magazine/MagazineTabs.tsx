"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";

const TAB_IDS = ["manifesto", "publications", "issues", "editorialBoard", "support"] as const;
type TabId = (typeof TAB_IDS)[number];

/**
 * Slot props — each pane is rendered by the parent (the page server
 * component) so it can fetch its own data and stream in independently.
 * Any pane can be omitted; the matching tab will hide and the section
 * anchor won't render.
 */
export type MagazineTabsProps = {
  manifesto?: ReactNode;
  publications?: ReactNode;
  issues?: ReactNode;
  editorialBoard?: ReactNode;
  support?: ReactNode;
};

const SECTION_ID: Record<TabId, string> = {
  manifesto: "magazine-manifesto",
  publications: "magazine-publications",
  issues: "magazine-issues",
  editorialBoard: "magazine-editorial-board",
  support: "magazine-support",
};

/**
 * Magazine body — the design is a single tall scrolling page where every
 * pane (Manifesto / Publications / Issues / Editorial Board / Support) is
 * stacked vertically. The segmented control above the content acts as a
 * sticky scroll-to-anchor nav: clicking a tab smooth-scrolls to that
 * section, and the active highlight updates as the user scrolls (a
 * lightweight IntersectionObserver-based scroll spy).
 */
export function MagazineTabs({
  manifesto,
  publications,
  issues,
  editorialBoard,
  support,
}: MagazineTabsProps) {
  const tTabs = useTranslations("Home.magazine.tabs");

  // Build the slot map from props. Tabs and section anchors only
  // render for slots the parent supplied — empty sections drop out of
  // both the nav and the body.
  const slots: Record<TabId, ReactNode> = {
    manifesto,
    publications,
    issues,
    editorialBoard,
    support,
  };
  const visibleTabIds = TAB_IDS.filter((id) => slots[id] !== undefined);
  const initialTab: TabId = visibleTabIds[0] ?? "manifesto";

  const [active, setActive] = useState<TabId>(initialTab);
  // Suppress scroll-spy updates briefly while we are programmatically
  // smooth-scrolling, so the active pill doesn't flicker through every
  // section the user passes over.
  const lockUntilRef = useRef<number>(0);

  const options: SegmentedControlOption<TabId>[] = visibleTabIds.map((id) => ({
    id,
    label: tTabs(id),
  }));

  const handleChange = (id: TabId) => {
    setActive(id);
    const el = document.getElementById(SECTION_ID[id]);
    if (!el) return;
    // Account for the sticky tab bar (~96px on desktop) so the section
    // heading isn't hidden behind it after scroll.
    const offset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    lockUntilRef.current = Date.now() + 800;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Scroll spy — highlight whichever section is closest to the top.
  // Tracks the set of currently-intersecting sections in a ref so each
  // observer callback re-picks the topmost from the full set, instead
  // of only the entries that changed in this batch (which would leave
  // the active pill stale once a section that previously won leaves
  // the viewport).
  useEffect(() => {
    const els = visibleTabIds
      .map((id) => ({
        id,
        el: document.getElementById(SECTION_ID[id]),
      }))
      .filter((x): x is { id: TabId; el: HTMLElement } => Boolean(x.el));

    if (els.length === 0) return;

    const intersecting = new Set<TabId>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = visibleTabIds.find(
            (tabId) => SECTION_ID[tabId] === (entry.target as HTMLElement).id,
          );
          if (!id) continue;
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }
        if (Date.now() < lockUntilRef.current) return;
        if (intersecting.size === 0) return;
        // Pick the section whose top is closest to (but at or past)
        // the sticky bar offset by sampling fresh getBoundingClientRect
        // values — more reliable than relying on stale entry rects.
        let topId: TabId | null = null;
        let topY = Number.POSITIVE_INFINITY;
        for (const id of intersecting) {
          const el = document.getElementById(SECTION_ID[id]);
          if (!el) continue;
          const y = el.getBoundingClientRect().top;
          if (y < topY) {
            topY = y;
            topId = id;
          }
        }
        if (topId) setActive(topId);
      },
      {
        // Trigger when a section's top crosses ~30% from the viewport top.
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      },
    );

    els.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
    // visibleTabIds is derived from props (which are stable across
    // renders for a given page) so we read it freshly each effect run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabIds.join("|")]);

  return (
    <section
      className="relative w-full px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1392px]">
        {/* Sticky scroll-nav — stays pinned to the top of the viewport
            so the user can jump between sections at any scroll depth.
            Horizontally scrollable on small screens so all 5 tab
            labels remain reachable without crashing the layout. */}
        <div
          className="sticky top-3 z-30 mb-10 overflow-x-auto sm:top-4 sm:mb-12 md:mb-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            backgroundColor: "rgba(var(--tott-home-surface-rgb), 0.85)",
            backdropFilter: "saturate(140%) blur(10px)",
            WebkitBackdropFilter: "saturate(140%) blur(10px)",
            borderRadius: 12,
          }}
        >
          <div className="min-w-max">
            <SegmentedControl
              options={options}
              value={active}
              onChange={handleChange}
              ariaLabel={tTabs("ariaLabel")}
            />
          </div>
        </div>

        {/* All panes stacked, each anchored for the scroll-nav. The
            "Publications" tab now scrolls to the Latest Published row
            (the Featured Publication card was removed).

            min-w-0 on each grid item: a grid item's default min-width
            is `auto` (= its content's min-content). Without this, the
            wide carousel inside MagazineSupport (≈7560px of cards in
            a translateX'd row) bullies the implicit grid track wider
            than the viewport, dragging every other section along with
            it and clipping their wrapped text. */}
        <div className="grid gap-20 sm:gap-24 md:gap-28">
          {visibleTabIds.map((id) => (
            <div
              key={id}
              id={SECTION_ID[id]}
              className="min-w-0 scroll-mt-28"
            >
              {slots[id]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
