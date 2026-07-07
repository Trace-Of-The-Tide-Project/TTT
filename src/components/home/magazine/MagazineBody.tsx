"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagazineTabs, type MagazineTabId, type MagazineTabsProps } from "./MagazineTabs";
import { MagazineNewsletter, type MagazineNewsletterProps } from "./MagazineNewsletter";

type Props = {
  /** Slots forwarded to MagazineTabs (stacked + standalone overrides). */
  tabs: Omit<MagazineTabsProps, "active" | "onActiveChange">;
  /** Props forwarded to MagazineNewsletter. titleOverride/bodyOverride
   * provided here act as the *default* copy override (e.g. CMS-driven);
   * the editorial-board tab takes precedence when active. */
  newsletter: MagazineNewsletterProps;
  /** Optional auxiliary nodes rendered between tabs and newsletter. */
  betweenTabsAndNewsletter?: ReactNode;
};

/**
 * Client wrapper that owns the active-tab state for the magazine
 * landing page. Two children read it:
 *   - <MagazineTabs>: receives `active` + `onActiveChange` so the
 *     tab selection lives here instead of in the tabs' internal
 *     useState (page-level state, not tab-local).
 *   - <MagazineNewsletter>: swaps its title + body to the
 *     "Interested in contributing to our editorial board?" copy
 *     while the Editorial Board tab is active; otherwise falls
 *     back to the default "Join our cultural circle" copy.
 */
export function MagazineBody({
  tabs,
  newsletter,
  betweenTabsAndNewsletter,
}: Props) {
  const tEditorial = useTranslations("Home.magazine.editorialBoard");
  const [active, setActive] = useState<MagazineTabId>("manifesto");

  const isEditorial = active === "editorialBoard";
  // Editorial-board tab override wins over the CMS-supplied default.
  const titleOverride = isEditorial
    ? tEditorial("newsletterTitle")
    : newsletter.titleOverride;
  const bodyOverride = isEditorial
    ? tEditorial("newsletterBody")
    : newsletter.bodyOverride;
  const ctaButton = isEditorial
    ? { label: tEditorial("newsletterCta"), href: "/contribute" }
    : newsletter.ctaButton;

  return (
    <>
      <MagazineTabs {...tabs} active={active} onActiveChange={setActive} />
      {betweenTabsAndNewsletter}
      <RevealOnScroll>
        <MagazineNewsletter
          {...newsletter}
          titleOverride={titleOverride}
          bodyOverride={bodyOverride}
          ctaButton={ctaButton}
        />
      </RevealOnScroll>
    </>
  );
}
