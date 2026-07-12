import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getFeaturedWriters,
  writerAvatar,
  writerDisplayName,
} from "@/services/writers.service";
import { SectionShell } from "../SectionShell";
import { VoicesStrip, type VoiceCard } from "./VoicesStrip";

/**
 * "Voices of TTT" — horizontal strip of featured writers, fetched server-side
 * through the Voices page's own service (GET /writers/featured, one card per
 * translation group). getFeaturedWriters returns [] on failure, so the
 * section degrades to header + view-all link — never empty boxes.
 */
export async function Voices() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("HomeNext"),
  ]);
  const writers = await getFeaturedWriters(locale);

  const cards: VoiceCard[] = writers
    .map((w) => ({
      id: w.id,
      name: writerDisplayName(w),
      headline: w.headline?.trim() || null,
      avatar: writerAvatar(w),
      href: `/writers/${encodeURIComponent(w.id)}`,
    }))
    .filter((card) => card.name !== "");

  return (
    <SectionShell
      id="voices"
      eyebrow={t("voices.eyebrow")}
      title={t("voices.title")}
      fullBleed
    >
      {cards.length > 0 ? (
        <VoicesStrip
          cards={cards}
          rtl={locale === "ar"}
          prevLabel={t("voices.prevLabel")}
          nextLabel={t("voices.nextLabel")}
        />
      ) : null}

      <div className="mx-auto mt-10 flex max-w-6xl justify-end px-6 sm:px-10">
        <Link
          href="/writers"
          className="tott-archive-viewall group inline-flex items-center gap-2 text-sm font-medium text-[var(--tott-gold-primary)] transition-colors hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
        >
          {t("voices.viewAll")}
          <svg
            aria-hidden
            className="tott-archive-arrow"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M2 8h11M9 3.5 13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </SectionShell>
  );
}
