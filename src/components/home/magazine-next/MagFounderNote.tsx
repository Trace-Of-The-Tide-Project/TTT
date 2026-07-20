"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import { SectionShell } from "@/components/home/SectionShell";
import { dirFor } from "@/i18n/dir";
import type { FounderQuoteLocaleFields } from "@/services/magazine-page.service";
import type { ImageFraming } from "@/lib/image-framing";
import { MagImage } from "./MagImage";
import { coverSrc, initial } from "./ui";

/**
 * Founder's quote, avatar, and name/role — placed right before Voices, since
 * the founder is a writer too. CMS override per field wins; quote and name fall
 * back to i18n. Role is CMS-only (no i18n key) and simply omitted when empty.
 * The founder quote was defined in the CMS but never rendered on the old page —
 * this surfaces it for the first time. Renders nothing when there is no quote.
 */
export function MagFounderNote({
  founder,
  avatar,
  avatarFraming,
  locale,
}: {
  founder: FounderQuoteLocaleFields;
  avatar?: string;
  avatarFraming?: ImageFraming;
  locale: string;
}) {
  const t = useTranslations("Home.magazine.editorialBoard");
  const tf = useTranslations("MagazineNext.founder");

  const quote = founder.quote?.trim() || t("founderQuote");
  if (!quote) return null;

  const name = founder.name?.trim() || t("founderName");
  const role = founder.role?.trim(); // CMS-only, no i18n fallback
  const dir = dirFor(locale);

  return (
    <SectionShell id="magazine-founder" eyebrow={tf("eyebrow")}>
      <RevealOnScroll className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--tott-elevated)] text-lg font-semibold text-[var(--tott-salt)] ring-1 ring-[var(--tott-card-border)]">
          {avatar ? (
            <MagImage
              src={coverSrc(avatar)}
              alt=""
              framing={avatarFraming}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            initial(name)
          )}
        </span>
        <figure className="min-w-0">
          <blockquote
            dir={dir}
            className="font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            <RichContent html={quote} variant="inline" dir={dir} />
          </blockquote>
          <figcaption className="mt-4 text-sm text-[var(--tott-salt)]">
            <span className="font-medium text-[var(--tott-gold-primary)]">{name}</span>
            {role ? <span> · {role}</span> : null}
          </figcaption>
        </figure>
      </RevealOnScroll>
    </SectionShell>
  );
}
