import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import type { HomeIssue } from "@/lib/home/fetch-home-data";
import { HomeSectionShell } from "./HomeSectionShell";

function FundingBar({
  raised,
  goal,
  fundedLabel,
}: {
  raised: number;
  goal: number;
  fundedLabel: string;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  return (
    <div className="mt-3">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--tott-card-border)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: theme.accentGold }}
        />
      </div>
      <p className="mt-1.5 text-xs text-[var(--tott-muted)]">
        {pct}% {fundedLabel}
      </p>
    </div>
  );
}

/**
 * Magazine issues, including crowdfunded ones with a funding progress
 * bar (funding_raised / funding_goal). Editorial + crowdfunded read
 * differently — crowdfunded shows the bar + a "Support" affordance.
 * Hidden when empty.
 */
export function HomeMagazineIssues({
  issues,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  crowdfundedLabel,
  fundedLabel,
  dir,
}: {
  issues: HomeIssue[];
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  crowdfundedLabel: string;
  fundedLabel: string;
  dir?: "rtl" | "ltr";
}) {
  if (issues.length === 0) return null;

  return (
    <HomeSectionShell
      anchorId="home-magazine-issues"
      heading={heading}
      subheading={subheading}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      dir={dir}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {issues.slice(0, 6).map((issue) => {
          const isCrowd =
            issue.kind === "crowdfunded" && issue.fundingGoal != null;
          return (
            <li key={issue.id}>
              <Link
                href={issue.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors hover:border-[var(--tott-accent-gold)]"
                style={{ borderColor: theme.cardBorder, backgroundColor: theme.panelBackground }}
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                  {issue.image ? (
                    <Image
                      src={issue.image}
                      alt={issue.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: "var(--tott-well-bg)" }} />
                  )}
                  {isCrowd ? (
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: theme.accentGold, color: "var(--tott-on-accent)" }}
                    >
                      {crowdfundedLabel}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-lg font-medium text-foreground">
                    {issue.title}
                  </h3>
                  {issue.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--tott-muted)]">
                      {issue.subtitle}
                    </p>
                  ) : null}
                  {isCrowd ? (
                    <FundingBar
                      raised={issue.fundingRaised ?? 0}
                      goal={issue.fundingGoal ?? 0}
                      fundedLabel={fundedLabel}
                    />
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </HomeSectionShell>
  );
}
