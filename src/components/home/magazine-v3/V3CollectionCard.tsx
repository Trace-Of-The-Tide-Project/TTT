import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui";
import { SpringCard } from "@/components/motion/SpringCard";
import type { CollectionCard } from "./data";

/** Collection card — same octagonal chamfer shape as V3PlanCard
 * (ChamferedSurface), not a hex. Cover image, bottom gradient scrim (no
 * blur), name, optional article-count chip. */
export function V3CollectionCard({
  collection,
  articlesLabel,
}: {
  collection: CollectionCard;
  articlesLabel: string | null;
}) {
  return (
    <SpringCard preset="gentle" className="h-[300px] w-[220px] shrink-0">
      <ChamferedSurface
        className="group relative block h-full w-full overflow-hidden"
        innerFill="var(--tott-panel-bg)"
        borderColor="var(--tott-card-border)"
      >
        <Link href={collection.href} className="absolute inset-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]">
          <div className="absolute inset-0 bg-[var(--tott-elevated)]" />
          {collection.coverImage ? (
            <Image
              src={collection.coverImage}
              alt={collection.name}
              fill
              sizes="220px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          <div
            className="absolute inset-x-0 bottom-0 flex h-[140px] flex-col items-center justify-end gap-1 px-4 pb-6 pt-6"
            style={{ background: "linear-gradient(to bottom, transparent 0%, var(--tott-well-bg) 100%)" }}
          >
            <p
              className="line-clamp-2 w-full text-center text-[16px] font-medium leading-5 text-white"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
            >
              {collection.name}
            </p>
            {articlesLabel ? (
              <span
                className="text-[11px] leading-4 text-[var(--tott-text-secondary-soft)]"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
              >
                {articlesLabel}
              </span>
            ) : null}
          </div>
        </Link>
      </ChamferedSurface>
    </SpringCard>
  );
}
