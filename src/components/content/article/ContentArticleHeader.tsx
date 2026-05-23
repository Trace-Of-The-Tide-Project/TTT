import { formatViewCount } from "@/lib/format-view-count";

type ContentArticleHeaderProps = {
  title: string;
  edition?: string;
  category?: string;
  publishedDate?: string;
  readingTime?: string;
  viewCount?: number;
  /** Show folder/calendar/clock icons before the meta items (Thread Figma). */
  metaIcons?: boolean;
};

const META_ICON_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "shrink-0",
};

function FolderIcon() {
  return (
    <svg {...META_ICON_PROPS} aria-hidden>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...META_ICON_PROPS} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg {...META_ICON_PROPS} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ContentArticleHeader({
  title,
  edition,
  category,
  publishedDate,
  readingTime,
  viewCount,
  metaIcons = false,
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
              backgroundColor: "var(--tott-gold-chip-bg)",
              color: "var(--tott-gold-chip-ink)",
              boxShadow: "inset 0px 1px 1px var(--tott-glass-highlight)",
            }}
          >
            {edition}
          </span>
        )}
        {category && (
          <>
            <span className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1">
              {metaIcons && <FolderIcon />}
              {metaIcons ? category : `Category: ${category}`}
            </span>
          </>
        )}
        {publishedDate && (
          <>
            <span className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1">
              {metaIcons && <CalendarIcon />}
              Published: {publishedDate}
            </span>
          </>
        )}
        {readingTime && (
          <>
            <span className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1">
              {metaIcons && <ClockIcon />}
              {metaIcons ? readingTime : `Reading Time: ${readingTime}`}
            </span>
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
