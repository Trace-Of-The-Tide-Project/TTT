import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import HexBackground from "@/components/ui/HexBackground";
import type { HomeArticle } from "@/lib/home/fetch-home-data";
import type { HeroLocaleFields } from "@/services/home-page.service";

/**
 * Mission-anchored hero. Replaces the generic "Discover. Create.
 * Inspire." template with copy rooted in the platform's purpose, over a
 * spotlight cover image (the most-recent article) when available. CMS
 * copy wins; i18n fallbacks fill the gaps.
 */
export function HomeHero({
  copy,
  artwork,
  primaryHref,
  secondaryHref,
  spotlight,
  fallback,
  dir,
}: {
  copy: HeroLocaleFields;
  artwork?: string;
  primaryHref?: string;
  secondaryHref?: string;
  spotlight: HomeArticle | null;
  fallback: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  dir?: "rtl" | "ltr";
}) {
  const eyebrow = copy.eyebrow || fallback.eyebrow;
  const title = copy.title || fallback.title;
  const subtitle = copy.subtitle || fallback.subtitle;
  const primaryLabel = copy.primaryCtaLabel || fallback.primaryCta;
  const secondaryLabel = copy.secondaryCtaLabel || fallback.secondaryCta;
  const cover = artwork || spotlight?.image || null;
  const primaryTo = primaryHref || "/content";
  const secondaryTo =
    secondaryHref || (spotlight ? spotlight.href : "/magazine");

  return (
    <section
      dir={dir}
      aria-label={title}
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      {/* Hex backdrop, consistent with the rest of the site. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-28 sm:px-10 sm:pb-20 sm:pt-32 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="flex flex-col gap-5">
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: theme.accentGold }}
          >
            {eyebrow}
          </span>
          <h1
            className="text-balance text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl"
            style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)" }}
          >
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--tott-muted)] sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={primaryTo}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.accentGold, color: "var(--tott-on-accent)" }}
            >
              {primaryLabel} <span aria-hidden>→</span>
            </Link>
            <Link
              href={secondaryTo}
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
              style={{ borderColor: theme.cardBorder }}
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        {cover ? (
          <Link
            href={spotlight ? spotlight.href : primaryTo}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border"
            style={{ borderColor: theme.cardBorder }}
          >
            <Image
              src={cover}
              alt={spotlight?.title ?? ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              unoptimized
            />
            {spotlight ? (
              <div
                className="absolute inset-x-0 bottom-0 p-5"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.72) 100%)",
                }}
              >
                <p className="line-clamp-2 text-lg font-medium text-white">
                  {spotlight.title}
                </p>
                {spotlight.authorName ? (
                  <p className="mt-1 text-sm text-white/75">
                    {spotlight.authorName}
                  </p>
                ) : null}
              </div>
            ) : null}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
