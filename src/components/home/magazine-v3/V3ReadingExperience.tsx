import type { ReactNode } from "react";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { SpringCard } from "@/components/motion/SpringCard";
import { ChamferedSurface } from "@/components/ui";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";
import { LanguagesIcon, LockIcon, CompassIcon, SaltIcon, LeafIcon, AnchorIcon } from "@/components/ui/icons";

export type ReadingFeature = { title: string; body: string };

const ICONS = [SaltIcon, LanguagesIcon, LockIcon, CompassIcon, LeafIcon, AnchorIcon];

/**
 * "Why read here" section — elegant animated feature cards (typography,
 * multi-language, member content, curated collections, editorial quality,
 * cross-device). Icons cycle through a fixed set rather than requiring one
 * per feature key, so this stays simple if the feature list is edited.
 */
export function V3ReadingExperience({
  title,
  standfirst,
  features,
}: {
  title: string;
  standfirst: string;
  features: ReadingFeature[];
}) {
  if (features.length === 0) return null;

  return (
    <section id="reading-experience" aria-labelledby="reading-experience-heading" className="py-16">
      <div className="mx-auto max-w-6xl px-6 text-center sm:px-10">
        <h2
          id="reading-experience-heading"
          className="font-display text-3xl text-[var(--tott-home-text-strong)] sm:text-4xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-[var(--tott-salt)]">
          {standfirst}
        </p>
      </div>

      <StaggerContainer className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} Icon={ICONS[i % ICONS.length]} />
        ))}
      </StaggerContainer>
    </section>
  );
}

function FeatureCard({
  feature,
  Icon,
}: {
  feature: ReadingFeature;
  Icon: () => ReactNode;
}) {
  return (
    <StaggerItem>
      <SpringCard preset="gentle" className="h-full">
        <ChamferedSurface
          className="flex h-full flex-col items-center gap-4 p-8 text-center"
          innerFill="var(--tott-panel-bg)"
          borderColor="var(--tott-card-border)"
        >
          <div
            className="flex h-14 w-12 items-center justify-center text-[var(--tott-accent-gold-focus)]"
            style={{
              clipPath: TOTT_AUTH_HEX_CLIP_PATH,
              background: "color-mix(in srgb, white 4%, transparent)",
            }}
          >
            <Icon />
          </div>
          <h3 className="text-base font-medium text-[var(--tott-home-text-warm)]">{feature.title}</h3>
          <p className="text-sm leading-5 text-[var(--tott-text-secondary-soft)]">{feature.body}</p>
        </ChamferedSurface>
      </SpringCard>
    </StaggerItem>
  );
}
