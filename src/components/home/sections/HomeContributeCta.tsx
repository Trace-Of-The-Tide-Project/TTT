import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import HexBackground from "@/components/ui/HexBackground";
import type { HomeOpenCall } from "@/lib/home/fetch-home-data";
import type { ContributeLocaleFields } from "@/services/home-page.service";

/**
 * Meaningful close: a contribute CTA tied to a real active open call
 * (not a generic button). The CMS can pin a specific open call; absent
 * that, it links the first active call, falling back to /contribute.
 */
export function HomeContributeCta({
  copy,
  openCall,
  fallback,
  dir,
}: {
  copy: ContributeLocaleFields;
  /** The open call this CTA points at (CMS-pinned or first active). */
  openCall: HomeOpenCall | null;
  fallback: { heading: string; body: string; ctaLabel: string };
  dir?: "rtl" | "ltr";
}) {
  const heading = copy.heading || openCall?.title || fallback.heading;
  const body = copy.body || openCall?.description || fallback.body;
  const ctaLabel = copy.ctaLabel || fallback.ctaLabel;
  const href = openCall ? openCall.href : "/contribute";

  return (
    <section
      dir={dir}
      aria-label={heading}
      className="relative isolate overflow-hidden py-20"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
        <h2
          className="text-balance text-3xl font-medium leading-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)" }}
        >
          {heading}
        </h2>
        {body ? (
          <p className="max-w-xl text-base leading-relaxed text-[var(--tott-muted)]">
            {body}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-2 inline-flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.accentGold, color: "var(--tott-on-accent)" }}
        >
          {ctaLabel} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
