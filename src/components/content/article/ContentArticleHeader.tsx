import { theme } from "@/lib/theme";
import { formatViewCount } from "@/lib/format-view-count";

type ContentArticleHeaderProps = {
  title: string;
  edition?: string;
  category?: string;
  publishedDate?: string;
  readingTime?: string;
  viewCount?: number;
};

export function ContentArticleHeader({
  title,
  edition,
  category,
  publishedDate,
  readingTime,
  viewCount,
}: ContentArticleHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">{title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--tott-muted)]">
        {edition && (
          <span
            className="mr-1 rounded-full border px-3 py-0.5 text-xs font-semibold"
            style={{ borderColor: theme.accentGold, color: theme.accentGold }}
          >
            {edition}
          </span>
        )}
        {category && (
          <>
            <span className="text-[var(--tott-card-border)]">·</span>
            <span>Category: {category}</span>
          </>
        )}
        {publishedDate && (
          <>
            <span className="text-[var(--tott-card-border)]">·</span>
            <span>Published: {publishedDate}</span>
          </>
        )}
        {readingTime && (
          <>
            <span className="text-[var(--tott-card-border)]">·</span>
            <span>Reading Time: {readingTime}</span>
          </>
        )}
        {viewCount != null && viewCount >= 0 && (
          <>
            <span className="text-[var(--tott-card-border)]">·</span>
            <span>{formatViewCount(viewCount)}</span>
          </>
        )}
      </div>
    </div>
  );
}
