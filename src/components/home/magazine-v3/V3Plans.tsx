import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { V3PlanCard } from "./V3PlanCard";
import type { PlanCard } from "./data";

function formatPrice(locale: string, amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Subscription plans section. Renders whatever active plans the backend
 * returns — any count, any tier names — so adding/removing a Stripe tier
 * needs no frontend change. Renders null when the plans fetch comes back
 * empty (outage or none active) rather than showing a broken pricing table.
 */
export function V3Plans({
  plans,
  title,
  standfirst,
  locale,
  perMonthLabel,
  recommendedLabel,
  ctaLabel,
  featureLabel,
}: {
  plans: PlanCard[];
  title: string;
  standfirst: string;
  locale: string;
  perMonthLabel: string;
  recommendedLabel: string;
  ctaLabel: string;
  featureLabel: (slug: string) => string;
}) {
  if (plans.length === 0) return null;

  return (
    <section id="plans" aria-labelledby="plans-heading" className="py-16">
      <div className="mx-auto max-w-6xl px-6 text-center sm:px-10">
        <h2
          id="plans-heading"
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

      <StaggerContainer
        className={`mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 px-6 pt-4 sm:px-10 ${
          plans.length >= 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2" : ""
        }`}
        style={plans.length > 3 ? { gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, minmax(0, 1fr))` } : undefined}
      >
        {plans.map((plan) => (
          <StaggerItem key={plan.id}>
            <V3PlanCard
              plan={plan}
              price={formatPrice(locale, plan.price_monthly, plan.currency)}
              perMonthLabel={perMonthLabel}
              recommendedLabel={recommendedLabel}
              ctaLabel={ctaLabel}
              featureLabel={featureLabel}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
