"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";

const TAB_IDS = ["manifesto", "publications", "issues", "editorialBoard", "support"] as const;
type TabId = (typeof TAB_IDS)[number];

/**
 * One slot per tab. Each pane is rendered by the parent (the page
 * server component) so it can fetch its own data and stream in
 * independently. A pane left `undefined` hides its tab — so a section
 * with no data never renders as a blank panel.
 */
export type MagazineTabId = (typeof TAB_IDS)[number];

export type MagazineTabsProps = {
  manifesto?: ReactNode;
  publications?: ReactNode;
  issues?: ReactNode;
  editorialBoard?: ReactNode;
  support?: ReactNode;
  /** Optional external active-tab state — lets a parent client
   *  component lift this state up to coordinate sibling sections
   *  (e.g. the page's MagazineNewsletter swapping its copy when the
   *  Editorial Board tab is active). Falls back to internal useState
   *  when omitted. */
  active?: MagazineTabId;
  onActiveChange?: (id: MagazineTabId) => void;
};

/**
 * Magazine body — one focused section per tab.
 *
 * Previously the first tab ("Manifesto") stacked *every* section into
 * one endless scroll. Now each tab reveals a single, self-contained
 * section, so the visitor chooses what to look at instead of wading
 * through the whole page. The active pane is the only one mounted, so
 * its entrance animation replays on each switch.
 *
 * Known production follow-up: because only the active pane is in the
 * DOM, crawlers / no-JS visitors see just the default (manifesto) tab.
 * Acceptable for this redesign; revisit if the page must be fully
 * crawlable without JS.
 */
export function MagazineTabs({
  manifesto,
  publications,
  issues,
  editorialBoard,
  support,
  active: activeProp,
  onActiveChange,
}: MagazineTabsProps) {
  const tTabs = useTranslations("Home.magazine.tabs");

  const slots: Record<TabId, ReactNode> = {
    manifesto,
    publications,
    issues,
    editorialBoard,
    support,
  };
  // A tab shows only when it has content — keeps dataless sections from
  // rendering as an empty panel.
  const visibleTabIds = TAB_IDS.filter((id) => slots[id] !== undefined);
  const initialTab: TabId = visibleTabIds[0] ?? "manifesto";

  // Internal state used as a fallback when a parent doesn't lift the
  // active tab up. When the parent passes `active` + `onActiveChange`,
  // those win and the internal state is unused.
  const [internalActive, setInternalActive] = useState<TabId>(initialTab);
  const activeRaw = activeProp ?? internalActive;
  // Guard against an active tab whose slot vanished (e.g. data emptied).
  const active = slots[activeRaw] !== undefined ? activeRaw : initialTab;
  const setActive = (id: TabId) => {
    setInternalActive(id);
    onActiveChange?.(id);
  };

  const options: SegmentedControlOption<TabId>[] = visibleTabIds.map((id) => ({
    id,
    label: tTabs(id),
  }));

  return (
    <section className="relative w-full px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 md:pb-28">
      <div className="mx-auto w-full max-w-[1392px]">
        {/* Sticky tab bar — pinned while the user scrolls the active
            pane. Capped at max-w-2xl so the tabs stay grouped on wide
            screens. Horizontally scrollable on small screens. */}
        <div
          className="sticky top-3 z-30 mx-auto mb-10 max-w-2xl overflow-x-auto sm:top-4 sm:mb-12 md:mb-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              onChange={setActive}
              ariaLabel={tTabs("ariaLabel")}
            />
          </div>
        </div>

        {/* One focused section at a time. min-w-0 stops wide content
            (carousels, grids) from dragging the page past the viewport. */}
        <div className="min-w-0">{slots[active]}</div>
      </div>
    </section>
  );
}
