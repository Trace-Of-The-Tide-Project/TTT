"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MagazineSection } from "./MagazineSection";

const HEX_CLIP = "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

/**
 * Support tab — stripped to the two things a visitor actually needs:
 * "start an issue" or "support an issue", plus a short, honest line on
 * what their support funds. The V2 version's process timeline, impact
 * grid, chamfered frames and open-issue fundraising cards are dropped —
 * issues already have their own tab, and the marketing scaffolding was
 * the bulk of the clutter.
 */
export type MagazineSupportCellsProps = {
  /** CMS heading override (per-locale). Falls back to i18n. */
  headingOverride?: string;
  /** CMS subheading override (per-locale). Falls back to i18n. */
  subheadingOverride?: string;
};

export function MagazineSupportCells({
  headingOverride,
  subheadingOverride,
}: MagazineSupportCellsProps = {}) {
  const t = useTranslations("Home.magazine.supportV2");

  const ctas = [
    {
      key: "start",
      title: t("startIssueTitle"),
      body: t("startIssueBody"),
      button: t("startIssueButton"),
      href: "/contribute",
    },
    {
      key: "support",
      title: t("supportIssueTitle"),
      body: t("supportIssueBody"),
      button: t("supportIssueButton"),
      href: "/open-issues",
    },
  ];

  const funds = [t("payWriters"), t("produceVisuals"), t("publishIssue"), t("growCommunity")];

  return (
    <MagazineSection
      eyebrow={t("ctaEyebrow")}
      heading={headingOverride?.trim() || t("ctaHeading")}
      subtitle={subheadingOverride?.trim() || t("ctaBody")}
    >
      {/* Two primary actions */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {ctas.map((c) => (
          <div
            key={c.key}
            className="flex flex-col items-start rounded-[20px] p-6 sm:p-8"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
            }}
          >
            <h3
              className="text-lg font-medium tracking-tight"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              {c.title}
            </h3>
            <p
              className="mt-2 flex-1 text-sm leading-relaxed"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {c.body}
            </p>
            <Link
              href={c.href}
              className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--tott-magazine-btn-bg)",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {c.button}
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                →
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* What support funds — light hex chips, no frames */}
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {funds.map((label) => (
          <li key={label} className="flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className="h-9 w-9"
              style={{
                clipPath: HEX_CLIP,
                WebkitClipPath: HEX_CLIP,
                backgroundColor: "var(--tott-accent-gold)",
                opacity: 0.9,
              }}
            />
            <span className="text-sm" style={{ color: "var(--tott-home-text-strong)" }}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </MagazineSection>
  );
}
