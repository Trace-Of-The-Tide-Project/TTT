import { getTranslations } from "next-intl/server";
import { getHomepageHeroImage } from "@/services/system.service";
import { HeroClient } from "./HeroClient";

// Hero owns the page's single <h1> — no SectionShell (its title renders an <h2>).
export async function Hero() {
  const t = await getTranslations("HomeNext");
  const image = await getHomepageHeroImage();

  return (
    <HeroClient
      eyebrow={t("hero.eyebrow")}
      title={t("hero.title")}
      subheadline={t("hero.subheadline")}
      primary={{ label: t("hero.ctaPrimary"), href: "/content" }}
      secondary={{ label: t("hero.ctaSecondary"), href: "/writers" }}
      scrollCue={t("hero.scrollCue")}
      image={image}
    />
  );
}
