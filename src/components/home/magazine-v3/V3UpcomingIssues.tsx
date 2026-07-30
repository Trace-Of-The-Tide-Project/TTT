import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { V3SectionHeader } from "./V3SectionHeader";
import { V3IssueCard } from "./V3IssueCard";
import type { UpcomingIssueCard, UpcomingIssueStatus } from "./data";

/**
 * "Upcoming Issues" section — premium card row for issues not yet
 * published (funding/funded → Coming Soon, draft → In Production, proposed
 * → Research Phase; see data.ts). Renders null when nothing qualifies so it
 * never shows an empty shelf. Designed to keep working unmodified whatever
 * shape future backend data for this section takes, since it only consumes
 * the already-normalized `UpcomingIssueCard` type.
 */
export function V3UpcomingIssues({
  issues,
  title,
  standfirst,
  viewMoreLabel,
  statusLabels,
  releaseTbaLabel,
  formatReleaseLabel,
}: {
  issues: UpcomingIssueCard[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  statusLabels: Record<UpcomingIssueStatus, string>;
  releaseTbaLabel: string;
  /** Formats an ISO date into a display string (locale-aware, upstream). */
  formatReleaseLabel: (iso: string) => string;
}) {
  if (issues.length === 0) return null;

  return (
    <section id="upcoming-issues" aria-labelledby="upcoming-issues-heading" className="py-8">
      <V3SectionHeader
        id="upcoming-issues-heading"
        title={title}
        standfirst={standfirst}
        viewMoreLabel={viewMoreLabel}
        viewMoreHref="/magazine-issues"
      />
      <StaggerContainer className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {issues.map((issue) => (
          <StaggerItem key={issue.id}>
            <V3IssueCard
              issue={issue}
              statusLabel={statusLabels[issue.status]}
              releaseLabel={issue.releaseDate ? formatReleaseLabel(issue.releaseDate) : releaseTbaLabel}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
