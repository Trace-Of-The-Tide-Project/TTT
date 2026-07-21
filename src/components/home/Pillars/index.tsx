import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { SectionShell } from "../SectionShell";
import { PILLAR_MOTIFS, type PillarKey } from "./motifs";

/**
 * The pillar taxonomy has no data model (labels only — see PLAN.md Session 2
 * handoff), so groups/keys are static; copy lives in the HomeNext i18n slice.
 * All cards funnel to /content until a real pillar route exists.
 */
const PILLAR_HREF = "/content";

const GROUPS: readonly {
  heading: "palestineHeading" | "fieldsHeading";
  keys: readonly PillarKey[];
}[] = [
  { heading: "palestineHeading", keys: ["stone", "salt", "compass"] },
  { heading: "fieldsHeading", keys: ["harbour", "courtyard", "hill"] },
];

/** CMS override copy for this section — falls back to i18n when absent. */
export type RailCopyOverride = { heading?: string; subheading?: string };

export async function Pillars({ copy }: { copy?: RailCopyOverride } = {}) {
  const t = await getTranslations("HomeNext");
  return (
    <SectionShell
      id="pillars"
      eyebrow={t("pillars.eyebrow")}
      title={copy?.heading || t("pillars.title")}
    >
      <div className="space-y-14">
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--tott-salt)]">
              {t(`pillars.${group.heading}`)}
            </h3>
            <StaggerContainer className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.keys.map((key) => (
                <StaggerItem key={key} className="h-full">
                  <Link
                    href={PILLAR_HREF}
                    className="tott-pillar-card group block h-full [--pillar-bg:var(--tott-elevated)] hover:[--pillar-bg:var(--tott-elevated-hover)] focus-visible:[--pillar-bg:var(--tott-elevated-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                  >
                    <ChamferedSurface
                      chamfer={20}
                      borderColor="color-mix(in srgb, var(--tott-gold-muted) 45%, transparent)"
                      innerFill="var(--pillar-bg)"
                      className="h-full p-6 transition-colors duration-300 sm:p-7"
                    >
                      <span
                        aria-hidden
                        className="relative block text-[var(--tott-gold-muted)] transition-colors duration-300 group-hover:text-[var(--tott-gold-primary)] group-focus-visible:text-[var(--tott-gold-primary)]"
                      >
                        {PILLAR_MOTIFS[key]}
                      </span>
                      <span
                        className="font-display relative mt-5 block text-xl text-[var(--tott-home-text-warm)]"
                        style={{
                          lineHeight: "var(--tott-display-leading)",
                          letterSpacing: "var(--tott-display-tracking)",
                        }}
                      >
                        {t(`pillars.items.${key}.title`)}
                      </span>
                      <span className="relative mt-1.5 block text-sm leading-relaxed text-[var(--tott-salt)]">
                        {t(`pillars.items.${key}.description`)}
                      </span>
                    </ChamferedSurface>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
