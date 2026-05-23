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
      <h1 className="text-2xl font-medium leading-tight text-foreground sm:text-[2rem] sm:leading-10">
        {title}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-white/65">
        {edition && (
          <span
            className="mr-1 inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium leading-4"
            style={{
              backgroundColor: "#DBC99E",
              color: "#332217",
              boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.04)",
            }}
          >
            {edition}
          </span>
        )}
        {category && (
          <>
            <span className="text-white/40">·</span>
            <span>Category: {category}</span>
          </>
        )}
        {publishedDate && (
          <>
            <span className="text-white/40">·</span>
            <span>Published: {publishedDate}</span>
          </>
        )}
        {readingTime && (
          <>
            <span className="text-white/40">·</span>
            <span>Reading Time: {readingTime}</span>
          </>
        )}
        {viewCount != null && viewCount >= 0 && (
          <>
            <span className="text-white/40">·</span>
            <span>{formatViewCount(viewCount)}</span>
          </>
        )}
      </div>
    </div>
  );
}
