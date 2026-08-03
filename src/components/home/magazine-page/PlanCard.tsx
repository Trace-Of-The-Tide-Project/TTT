"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui";
import { SpringCard } from "@/components/motion/SpringCard";
import type { PlanCard as PlanCardData } from "./data";

/** Cards with more features than this collapse behind a "show more" toggle
 * so a short-feature plan (e.g. Bookshelf) isn't stretched to match a
 * long-feature plan (e.g. Subscriber) — content decides height, not the grid. */
const VISIBLE_FEATURE_COUNT = 3;

/**
 * Premium plan card. Recommended plan gets a gold border glow + a visible
 * text badge (never color alone) and a slight scale lift so it reads as
 * "the" plan at a glance without relying on any single color cue.
 */
export function PlanCard({
  plan,
  price,
  perMonthLabel,
  recommendedLabel,
  ctaLabel,
  featureLabels,
  showMoreLabel,
  showLessLabel,
}: {
  plan: PlanCardData;
  /** Pre-formatted currency string (Intl.NumberFormat, locale-aware). */
  price: string;
  perMonthLabel: string;
  recommendedLabel: string;
  ctaLabel: string;
  /** Already-translated feature display text, same order as `plan.features`
   * — resolved server-side since a translator function can't cross into
   * this client component as a prop. */
  featureLabels: string[];
  /** Already-formatted expand-toggle text, e.g. "+3 more". */
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = featureLabels.length > VISIBLE_FEATURE_COUNT;
  const visibleFeatures = expanded || !canCollapse ? featureLabels : featureLabels.slice(0, VISIBLE_FEATURE_COUNT);

  return (
    <SpringCard preset="gentle" className={`h-full ${plan.recommended ? "sm:-translate-y-2" : ""}`}>
      <ChamferedSurface
        className="flex h-full flex-col p-8"
        innerFill="var(--tott-elevated)"
        borderColor={plan.recommended ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}
        style={
          plan.recommended
            ? { boxShadow: "0 0 0 1px color-mix(in srgb, var(--tott-accent-gold) 35%, transparent), 0 12px 32px -12px color-mix(in srgb, var(--tott-accent-gold) 45%, transparent)" }
            : undefined
        }
      >
        {plan.recommended ? (
          <span className="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--tott-hero-cta-ink)]" style={{ backgroundColor: "var(--tott-accent-gold)" }}>
            {recommendedLabel}
          </span>
        ) : null}

        <h3 className="font-display text-xl text-[var(--tott-home-text-strong)]">{plan.display_name}</h3>

        <p className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl text-[var(--tott-gold-bright)]">{price}</span>
          <span className="text-sm text-[var(--tott-salt)]">{perMonthLabel}</span>
        </p>

        <ul className="mt-6 flex flex-col gap-3">
          {visibleFeatures.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-5 text-[var(--tott-text-secondary-soft)]">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {canCollapse ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-fit text-sm font-medium text-[var(--tott-gold-bright)] underline-offset-2 hover:underline"
          >
            {expanded ? showLessLabel : showMoreLabel}
          </button>
        ) : null}

        <Link
          href={`/subscribe?plan=${encodeURIComponent(plan.id)}`}
          className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={
            plan.recommended
              ? { backgroundColor: "var(--tott-accent-gold)", color: "var(--tott-hero-cta-ink)" }
              : { backgroundColor: "var(--tott-elevated)", color: "var(--tott-home-text-warm)" }
          }
        >
          {ctaLabel}
        </Link>
      </ChamferedSurface>
    </SpringCard>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--tott-status-emerald)"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
