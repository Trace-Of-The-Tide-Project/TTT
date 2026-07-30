import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui";
import { SpringCard } from "@/components/motion/SpringCard";
import type { UpcomingIssueCard, UpcomingIssueStatus } from "./data";

const STATUS_BADGE_STYLE: Record<UpcomingIssueStatus, { bg: string; fg: string }> = {
  comingSoon: { bg: "var(--tott-status-emerald)", fg: "var(--tott-on-accent)" },
  inProduction: { bg: "var(--tott-gold-muted)", fg: "var(--tott-hero-cta-ink)" },
  researchPhase: { bg: "var(--tott-status-amber)", fg: "var(--tott-hero-cta-ink)" },
};

/**
 * Premium card for a not-yet-published issue: cover placeholder, title,
 * expected release date, short teaser, status badge. Status is conveyed by
 * a text label (not color alone) so it reads under any theme and to screen
 * readers/color-blind users alike.
 */
export function V3IssueCard({
  issue,
  statusLabel,
  releaseLabel,
}: {
  issue: UpcomingIssueCard;
  statusLabel: string;
  /** Already-formatted release date, or a "TBA"-style fallback string. */
  releaseLabel: string;
}) {
  const badge = STATUS_BADGE_STYLE[issue.status];

  return (
    <SpringCard preset="gentle" className="h-full">
      <ChamferedSurface
        className="h-full"
        innerFill="var(--tott-panel-bg)"
        borderColor="var(--tott-card-border)"
      >
        <Link href={issue.href} className="group flex h-full flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]">
          <div className="relative h-40 w-full overflow-hidden bg-[var(--tott-elevated)]">
            {issue.coverImage ? (
              <Image
                src={issue.coverImage}
                alt={issue.title}
                fill
                sizes="(min-width: 1024px) 360px, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-full w-full items-center justify-center font-display text-4xl text-[var(--tott-gold-muted)] opacity-40"
              >
                {issue.subtitle ? "◆" : "◇"}
              </div>
            )}
            <span
              className="absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: badge.bg, color: badge.fg }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="font-display text-lg text-[var(--tott-home-text-strong)]" style={{ lineHeight: "var(--tott-display-leading)" }}>
              {issue.title}
            </p>
            {issue.subtitle ? (
              <p className="text-sm text-[var(--tott-salt)]">{issue.subtitle}</p>
            ) : null}
            {issue.teaser ? (
              <p className="line-clamp-3 text-sm leading-5 text-[var(--tott-text-secondary-soft)]">
                {issue.teaser}
              </p>
            ) : null}
            <p className="mt-auto pt-2 text-xs font-medium uppercase tracking-wide text-[var(--tott-gold-muted)]">
              {releaseLabel}
            </p>
          </div>
        </Link>
      </ChamferedSurface>
    </SpringCard>
  );
}
