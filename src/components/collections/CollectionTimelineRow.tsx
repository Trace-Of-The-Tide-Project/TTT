"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Grid2x2Icon, CalendarIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import type { CollectionRowItem } from "@/lib/content/collection-buckets";

const FALLBACK_IMAGE = "/images/image.png";

export function CollectionTimelineRow({
  item,
  isLast,
}: {
  item: CollectionRowItem;
  isLast: boolean;
}) {
  return (
    <li className="flex gap-3">
      {/* Connector rail + calendar node */}
      <div className="flex w-8 shrink-0 flex-col items-center">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md border"
          style={{ borderColor: theme.cardBorder, color: "var(--tott-muted)" }}
        >
          <CalendarIcon />
        </span>
        {!isLast && (
          <span
            className="mt-1 w-px flex-1"
            style={{ backgroundColor: theme.cardBorder }}
          />
        )}
      </div>

      <Link
        href={item.href}
        className="group mb-4 flex min-w-0 flex-1 gap-4 rounded-lg p-1 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
      >
        <div
          className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 bg-[var(--tott-well-bg)]"
          style={{ borderColor: theme.cardBorder }}
        >
          <Image
            src={item.coverImage || FALLBACK_IMAGE}
            alt={item.title}
            fill
            className="object-cover"
            sizes="112px"
          />
          <div className="absolute left-1.5 top-1.5 text-white">
            <Grid2x2Icon />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-muted)]">
            {item.date}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground group-hover:text-[color:var(--tott-accent-gold)]">
            {item.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--tott-muted)]">
            {item.excerpt}
          </p>
        </div>
      </Link>
    </li>
  );
}
