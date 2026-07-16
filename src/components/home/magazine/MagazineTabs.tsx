"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

const TAB_IDS = ["manifesto", "publications", "articles", "issues", "editorialBoard", "support"] as const;
type TabId = (typeof TAB_IDS)[number];

/**
 * Slot props — each pane is rendered by the parent (the page server
 * component) so it can fetch its own data and stream in independently.
 *
 *   - `manifesto / publications / issues / editorialBoard / support`
 *     drive the stacked "Manifesto" view (the original landing page).
 *     Any pane can be omitted; the matching tab will hide.
 *   - `standalone.{publications, issues, editorialBoard, support}`
 *     overrides the slot when that tab is active on its own (Figma
 *     Variants 2-5). Falls back to the same stacked slot when omitted.
 */
export type MagazineTabId = (typeof TAB_IDS)[number];

export type MagazineTabsProps = {
  manifesto?: ReactNode;
  publications?: ReactNode;
  articles?: ReactNode;
  issues?: ReactNode;
  editorialBoard?: ReactNode;
  support?: ReactNode;
  standalone?: {
    publications?: ReactNode;
    issues?: ReactNode;
    editorialBoard?: ReactNode;
    support?: ReactNode;
  };
  /** Optional external active-tab state — lets a parent client
   *  component lift this state up to coordinate sibling sections
   *  (e.g. the page's MagazineNewsletter swapping its copy when the
   *  Editorial Board tab is active). Falls back to internal useState
   *  when omitted. */
  active?: MagazineTabId;
  onActiveChange?: (id: MagazineTabId) => void;
};

/**
 * Magazine body.
 *
 * Tab behavior:
 *   - First tab ("Manifesto") = the full landing experience: every
 *     visible stacked-slot pane rendered vertically. This stays as the
 *     original landing page.
 *   - Every other tab = the matching `standalone[tab]` if provided,
 *     else the stacked slot. Matches the Figma variants where each
 *     tab reveals a single focused redesign.
 */
export function MagazineTabs({
  manifesto,
  publications,
  articles,
  issues,
  editorialBoard,
  support,
  standalone,
  active: activeProp,
  onActiveChange,
}: MagazineTabsProps) {
  const tTabs = useTranslations("Home.magazine.tabs");

  const slots: Record<TabId, ReactNode> = {
    manifesto,
    publications,
    articles,
    issues,
    editorialBoard,
    support,
  };
  /** Per-tab override used when the tab is the active standalone view. */
  const standaloneSlots: Partial<Record<TabId, ReactNode>> = {
    publications: standalone?.publications,
    issues: standalone?.issues,
    editorialBoard: standalone?.editorialBoard,
    support: standalone?.support,
  };
  // A tab shows if it has *either* a stacked slot or a standalone
  // override. Manifesto only ever uses the stacked slot.
  const visibleTabIds = TAB_IDS.filter(
    (id) => slots[id] !== undefined || standaloneSlots[id] !== undefined,
  );
  const initialTab: TabId = visibleTabIds[0] ?? "manifesto";

  // Internal state used as a fallback when a parent doesn't lift the
  // active tab up. When the parent passes `active` + `onActiveChange`,
  // those win and the internal state is unused.
  const [internalActive, setInternalActive] = useState<TabId>(initialTab);
  const active = activeProp ?? internalActive;
  const setActive = (id: TabId) => {
    setInternalActive(id);
    onActiveChange?.(id);
  };

  const options: SegmentedControlOption<TabId>[] = visibleTabIds.map((id) => ({
    id,
    label: tTabs(id),
  }));

  return (
    <section
      className="relative w-full px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1392px]">
        {/* Sticky tab bar — pinned while the user scrolls the active
            pane(s). Capped at max-w-2xl so the 5 tabs stay grouped on
            wide screens. Horizontally scrollable on small screens. */}
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

        {/* min-w-0 on each grid item: a grid item's default min-width
            is `auto` (= its content's min-content). Without this, wide
            content (like Support's carousel) can drag the page wider
            than the viewport.
            Manifesto stack uses the original stacked slots; every other
            tab prefers its standalone override (the Figma variant
            redesign) and falls back to the stacked slot when missing. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {active === "manifesto" ? (
              <div className="grid gap-20 sm:gap-24 md:gap-28">
                {visibleTabIds
                  .filter((id) => slots[id] !== undefined)
                  .map((id) => (
                    <div key={id} className="min-w-0">
                      {/* Publications self-staggers its cards (MagazineLatestPublished);
                          wrapping it too would double-animate. Every other stacked
                          section reveals as a whole block on scroll. */}
                      {id === "publications" ? (
                        slots[id]
                      ) : (
                        <RevealOnScroll>{slots[id]}</RevealOnScroll>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="min-w-0">
                <RevealOnScroll>
                  {standaloneSlots[active] ?? slots[active]}
                </RevealOnScroll>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
