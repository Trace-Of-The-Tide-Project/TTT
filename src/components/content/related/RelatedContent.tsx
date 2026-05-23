"use client";

import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { FeaturedHexRow } from "./FeaturedHexRow";
import type { FeaturedHexItem } from "./FeaturedHexCard";
import type { RelatedContentCardData } from "./RelatedContentCard";

type RelatedContentProps = {
  items: RelatedContentCardData[];
  viewMoreHref?: string;
};

export function RelatedContent({ items, viewMoreHref = "#" }: RelatedContentProps) {
  const t = useTranslations("Content");

  const hexItems: FeaturedHexItem[] = items.map((item, i) => ({
    id: item.id ?? `related-${i}`,
    title: item.title,
    author: item.author,
    coverImage: item.image,
    chipLabel: item.edition,
    href: item.href,
  }));

  return (
    <section
      className="relative overflow-x-hidden py-10 sm:py-14"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <FeaturedHexRow
        items={hexItems}
        heading={t("relatedContent")}
        subtitle={t("relatedDescription")}
        viewMoreHref={viewMoreHref}
        viewMoreLabel={t("viewMore")}
      />
    </section>
  );
}
