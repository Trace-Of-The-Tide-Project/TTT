"use client";

import { useTranslations } from "next-intl";
import { MagazineSection } from "./MagazineSection";
import { MagazineLatestPublishedV2, type LatestPublishedItem } from "./MagazineLatestPublishedV2";

export type MagazinePublicationsCellsProps = {
  items: LatestPublishedItem[];
};

/**
 * Publications tab — the shared section shell wrapped around the clean
 * book-cover grid. The grid itself (elongated hex covers + minimal
 * caption) is reused as-is; the shell adds the consistent
 * eyebrow / heading / subtitle / "view more" treatment shared by every
 * tab so the page reads as one system.
 */
export function MagazinePublicationsCells({ items }: MagazinePublicationsCellsProps) {
  const t = useTranslations("Home.magazine.publications");
  const tTabs = useTranslations("Home.magazine.tabs");

  return (
    <MagazineSection
      eyebrow={tTabs("publications")}
      heading={t("latestHeading")}
      subtitle={t("latestSubtitle")}
      viewMore={{ label: t("viewMore"), href: "/books" }}
    >
      <MagazineLatestPublishedV2 items={items} />
    </MagazineSection>
  );
}
