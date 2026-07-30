import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui";
import { SpringCard } from "@/components/motion/SpringCard";
import type { PlanCard } from "./data";

/**
 * Premium plan card. Recommended plan gets a gold border glow + a visible
 * text badge (never color alone) and a slight scale lift so it reads as
 * "the" plan at a glance without relying on any single color cue.
 */
export function V3PlanCard({
  plan,
  price,
  perMonthLabel,
  recommendedLabel,
  ctaLabel,
  featureLabel,
}: {
  plan: PlanCard;
  /** Pre-formatted currency string (Intl.NumberFormat, locale-aware). */
  price: string;
  perMonthLabel: string;
  recommendedLabel: string;
  ctaLabel: string;
  /** Translates a raw feature slug (e.g. "shop_discount") to display text,
   * falling back to the slug itself if no translation exists. */
  featureLabel: (slug: string) => string;
}) {
  return (
    <SpringCard preset="gentle" className={`h-full ${plan.recommended ? "sm:-translate-y-2" : ""}`}>
      <ChamferedSurface
        className="flex h-full flex-col p-8"
        innerFill="var(--tott-panel-bg)"
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

        <ul className="mt-6 flex flex-1 flex-col gap-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-5 text-[var(--tott-text-secondary-soft)]">
              <CheckIcon />
              <span>{featureLabel(feature)}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/subscribe?plan=${encodeURIComponent(plan.id)}`}
          className="mt-8 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
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
