import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import type { HomeCollection } from "@/lib/home/fetch-home-data";
import { HomeSectionShell } from "./HomeSectionShell";

/**
 * Curated series ("Stories from Jaffa"-style) as browse-deeper cards.
 * Hidden when empty.
 */
export function HomeCollections({
  collections,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  piecesLabel,
  dir,
}: {
  collections: HomeCollection[];
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  piecesLabel: string;
  dir?: "rtl" | "ltr";
}) {
  if (collections.length === 0) return null;

  return (
    <HomeSectionShell
      anchorId="home-collections"
      heading={heading}
      subheading={subheading}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      dir={dir}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 6).map((col) => (
          <li key={col.id}>
            <Link
              href={col.href}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border"
              style={{ borderColor: theme.cardBorder }}
            >
              {col.image ? (
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-white/5" />
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-5"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)",
                }}
              >
                <h3 className="line-clamp-2 text-lg font-medium text-white">
                  {col.name}
                </h3>
                {col.articleCount > 0 ? (
                  <p className="mt-1 text-xs text-white/75">
                    {col.articleCount} {piecesLabel}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSectionShell>
  );
}
