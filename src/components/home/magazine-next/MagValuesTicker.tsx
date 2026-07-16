import { getTranslations } from "next-intl/server";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { SectionShell } from "@/components/home/SectionShell";

const VALUE_KEYS = ["value1", "value2", "value3", "value4", "value5"] as const;

/**
 * Editorial values as short gold-kicker interstitials between two content
 * strips — not a bulleted manifesto list. Each value keeps the "gold accent on
 * the key word" brand language via FirstWordGold and cascades in on scroll.
 * Values are i18n-only (ManifestoLocaleFields has no per-value CMS field).
 */
export async function MagValuesTicker() {
  const t = await getTranslations("Home.magazine.manifesto");
  const tv = await getTranslations("MagazineNext.values");

  return (
    <SectionShell id="magazine-values" eyebrow={tv("eyebrow")} title={tv("title")}>
      <StaggerContainer className="flex flex-col gap-4 sm:gap-5">
        {VALUE_KEYS.map((key) => (
          <StaggerItem key={key}>
            <p
              className="font-display text-xl text-[var(--tott-home-text-warm)] sm:text-2xl"
              style={{
                lineHeight: "var(--tott-display-leading)",
                letterSpacing: "var(--tott-display-tracking)",
              }}
            >
              <FirstWordGold raw={t(key)} />
            </p>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionShell>
  );
}
