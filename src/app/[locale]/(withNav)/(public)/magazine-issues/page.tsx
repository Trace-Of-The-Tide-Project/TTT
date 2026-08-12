import {
  fetchIssues,
  fetchCurrentIssue,
  attachIssueFraming,
} from "@/components/home/magazine-next/data";
import { IssuesArchiveContent } from "@/components/magazine-issues/IssuesArchiveContent";

export const dynamic = "force-dynamic";

// ponytail: 24 issues covers years of a print-cadence magazine with no
// pagination. Add pagination when the archive exceeds one page.
export default async function MagazineIssuesArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [issues, currentIssue] = await Promise.all([
    fetchIssues(locale, 24),
    fetchCurrentIssue(locale),
  ]);

  const union =
    currentIssue && !issues.some((i) => i.id === currentIssue.id)
      ? [currentIssue, ...issues]
      : issues;
  const framed = await attachIssueFraming(union);
  const current = currentIssue
    ? (framed.find((i) => i.id === currentIssue.id) ?? currentIssue)
    : (framed[0] ?? null);
  const previous = framed.filter((i) => i.id !== current?.id);

  return <IssuesArchiveContent current={current} previous={previous} locale={locale} />;
}
