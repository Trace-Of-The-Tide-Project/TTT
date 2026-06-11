"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

export type CollectionCardData = {
  id: string;
  name: string;
  description: string;
  coverImage: string | null;
  /** Item count to display, or null to omit the line. */
  itemCount: number | null;
};

const FALLBACK_IMAGE = "/images/image.png";

export function CollectionCard({ data }: { data: CollectionCardData }) {
  const t = useTranslations("Collections");
  return (
    <Link
      href={`/collections/${data.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-colors hover:border-[color:var(--tott-accent-gold)]"
      style={{ borderColor: theme.cardBorder, backgroundColor: theme.homeSurface }}
    >
      <div className="relative aspect-[16/10] w-full bg-[var(--tott-well-bg)]">
        <Image
          src={data.coverImage || FALLBACK_IMAGE}
          alt={data.name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="truncate text-base font-medium text-foreground group-hover:text-[color:var(--tott-accent-gold)]">
          {data.name}
        </h3>
        {data.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--tott-muted)]">
            {data.description}
          </p>
        )}
        {data.itemCount != null && (
          <p className="mt-auto pt-1 text-xs text-[var(--tott-muted)]">
            {t("itemsCount", { count: data.itemCount })}
          </p>
        )}
      </div>
    </Link>
  );
}
