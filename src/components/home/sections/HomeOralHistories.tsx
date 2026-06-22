import { theme } from "@/lib/theme";
import { FeaturedHexRow } from "@/components/content/related/FeaturedHexRow";
import type { FeaturedHexItem } from "@/components/content/related/FeaturedHexCard";
import {
  isOpenCall,
  type HomeArticle,
  type HomeOpenCall,
} from "@/lib/home/fetch-home-data";
import { contentBadge } from "./contentTypeBadge";

/**
 * The emotional core: testimony-shaped articles (audio/video/thread)
 * mixed with active open calls inviting people to add their own. Given
 * weight via the full-bleed silk-hex carousel (the same row the related
 * + writing-room sections use) so it reads as a primary surface, not a
 * thin strip. Hidden when empty.
 */
export function HomeOralHistories({
  items,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  dir,
}: {
  items: Array<HomeArticle | HomeOpenCall>;
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dir?: "rtl" | "ltr";
}) {
  if (items.length === 0) return null;

  const hexItems: FeaturedHexItem[] = items.map((item) => {
    if (isOpenCall(item)) {
      return {
        id: `oc-${item.id}`,
        title: item.title,
        author: contentBadge("open_call").label,
        coverImage: item.image,
        chipLabel: contentBadge("open_call").label,
        href: item.href,
      };
    }
    const badge = contentBadge(item.contentType);
    return {
      id: `a-${item.id}`,
      title: item.title,
      author: item.authorName ?? "—",
      coverImage: item.image,
      chipLabel: badge.label,
      href: item.href,
    };
  });

  return (
    <section
      dir={dir}
      className="relative overflow-x-hidden py-12 sm:py-16"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <FeaturedHexRow
        items={hexItems}
        heading={heading}
        subtitle={subheading}
        viewMoreHref={viewAllHref}
        viewMoreLabel={viewAllLabel}
      />
    </section>
  );
}
