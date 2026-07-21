import { getTranslations } from "next-intl/server";
import { getHomepageHeroImage } from "@/services/system.service";
import { HeroClient } from "./HeroClient";

/** CMS override copy for this section — falls back to i18n when absent. */
export type HeroCopyOverride = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

// Hero owns the page's single <h1> — no SectionShell (its title renders an <h2>).
export async function Hero({ copy }: { copy?: HeroCopyOverride } = {}) {
  const t = await getTranslations("HomeNext");
  const image = await getHomepageHeroImage();

  return (
    <HeroClient
      eyebrow={copy?.eyebrow || t("hero.eyebrow")}
      title={copy?.title || t("hero.title")}
      subheadline={copy?.subtitle || t("hero.subheadline")}
      primary={{ label: t("hero.ctaPrimary"), href: "/content" }}
      secondary={{ label: t("hero.ctaSecondary"), href: "/writers" }}
      scrollCue={t("hero.scrollCue")}
      image={image}
    />
  );
}
