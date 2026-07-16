import { getTranslations } from "next-intl/server";
import { TestimonyCycler, type Testimony } from "@/components/home/Editions/TestimonyCycler";
import { dirFor } from "@/i18n/dir";
import type { ManifestoLocaleFields } from "@/services/magazine-page.service";
import { stripHtml } from "./ui";

/**
 * Editorial pull-quote break between two content grids — the closing
 * pull-quote, philosophy, and vision copy, cycling one at a time. Reuses the
 * homepage TestimonyCycler with plain-text attribution (these quotes have no
 * writer page) and a magazine type scale. CMS override per field wins;
 * otherwise the i18n manifesto copy. Renders nothing if no quote survives.
 */
export async function MagQuoteBreak({
  copy,
  locale,
}: {
  copy: ManifestoLocaleFields;
  locale: string;
}) {
  const t = await getTranslations("Home.magazine.manifesto");
  const tb = await getTranslations("MagazineNext.quoteBreak");
  const th = await getTranslations("MagazineNext.hero");
  const dir = dirFor(locale);

  // Field key → CMS override; fall back to i18n. Strip inline markup since the
  // cycler renders the quote as plain text.
  const sources: Array<[string, string | undefined]> = [
    ["closing", copy.closingQuote],
    ["philosophy", copy.philosophyQuote],
    ["vision", copy.visionBody],
  ];
  const i18nKey: Record<string, string> = {
    closing: "closingQuote",
    philosophy: "philosophyQuote",
    vision: "visionBody",
  };

  const testimonies: Testimony[] = sources
    .map(([id, override]): Testimony | null => {
      const quote = stripHtml(override) || stripHtml(t(i18nKey[id]));
      if (!quote) return null;
      return {
        id,
        quote,
        name: th("brandLead"),
        headline: null,
        language: locale,
        dir,
        href: null,
      };
    })
    .filter((q): q is Testimony => q !== null);

  if (testimonies.length === 0) return null;

  return (
    <section id="magazine-quote-break" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="rounded-[28px] bg-[var(--tott-well-bg)] px-6 py-12 sm:px-12 sm:py-16">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
            {tb("eyebrow")}
          </span>
          <TestimonyCycler
            testimonies={testimonies}
            pauseLabel={tb("pause")}
            playLabel={tb("play")}
            dotLabels={testimonies.map((_, i) => tb("goTo", { number: i + 1 }))}
            quoteClassName="max-w-3xl font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl lg:text-4xl"
          />
        </div>
      </div>
    </section>
  );
}
