"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";
import { MagazineManifesto } from "./MagazineManifesto";
import { MagazineLatestPublished } from "./MagazineLatestPublished";
import { MagazineIssues } from "./MagazineIssues";
import { MagazineEditorialBoard } from "./MagazineEditorialBoard";
import { MagazineSupport } from "./MagazineSupport";

const TAB_IDS = ["manifesto", "publications", "issues", "editorialBoard", "support"] as const;
type TabId = (typeof TAB_IDS)[number];

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
export function MagazineTabs() {
  const tTabs = useTranslations("Home.magazine.tabs");
  const [active, setActive] = useState<TabId>("manifesto");
  // Suppress scroll-spy updates briefly while we are programmatically
  // smooth-scrolling, so the active pill doesn't flicker through every
  // section the user passes over.
  const lockUntilRef = useRef<number>(0);

  const options: SegmentedControlOption<TabId>[] = TAB_IDS.map((id) => ({
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
  useEffect(() => {
    const els = TAB_IDS.map((id) => ({
      id,
      el: document.getElementById(SECTION_ID[id]),
    })).filter((x): x is { id: TabId; el: HTMLElement } => Boolean(x.el));

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntilRef.current) return;
        // Pick the topmost intersecting section (smallest top after the
        // sticky bar offset).
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const topId = TAB_IDS.find(
          (id) => SECTION_ID[id] === (visible[0].target as HTMLElement).id,
        );
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
  }, []);

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
              ariaLabel={tTabs("manifesto")}
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
          <div id={SECTION_ID.manifesto} className="min-w-0 scroll-mt-28">
            <MagazineManifesto />
          </div>
          <div id={SECTION_ID.publications} className="min-w-0 scroll-mt-28">
            <MagazineLatestPublished />
          </div>
          <div id={SECTION_ID.issues} className="min-w-0 scroll-mt-28">
            <MagazineIssues />
          </div>
          <div id={SECTION_ID.editorialBoard} className="min-w-0 scroll-mt-28">
            <MagazineEditorialBoard />
          </div>
          <div id={SECTION_ID.support} className="min-w-0 scroll-mt-28">
            <MagazineSupport />
          </div>
        </div>
      </div>
    </section>
  );
}
