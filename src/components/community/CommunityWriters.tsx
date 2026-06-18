"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FeaturedHexCard } from "@/components/content/related/FeaturedHexCard";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
} from "@/services/writers.service";

export function CommunityWriters({ writers }: { writers: WriterProfile[] }) {
  const t = useTranslations("Community");

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-medium"
            style={{ color: "var(--tott-home-text-heading)" }}
          >
            {t("writersHeading")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("writersSubtitle")}
          </p>
        </div>
        <Link
          href="/writers"
          className="shrink-0 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("writersCta")}
        </Link>
      </div>

      <div
        className="mt-6 flex gap-4 overflow-x-auto pb-2 [--carousel-card-w:240px]"
        style={{ scrollbarWidth: "thin" }}
      >
        {writers.map((w) => (
          <FeaturedHexCard
            key={w.id}
            title={writerDisplayName(w) || "Writer"}
            author={w.headline?.trim() || "TTT Writer"}
            coverImage={writerAvatar(w)}
            href={`/writers/${encodeURIComponent(w.id)}`}
          />
        ))}
      </div>
    </section>
  );
}
