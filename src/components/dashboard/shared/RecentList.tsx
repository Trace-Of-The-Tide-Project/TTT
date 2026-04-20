"use client";

import { Link } from "@/i18n/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { theme } from "@/lib/theme";

export type RecentListItem = {
  id: string;
  avatar?: { initials: string; color?: string };
  title: string;
  subtitle?: string;
  trailing?: string;
  href?: string;
};

type RecentListProps = {
  heading: string;
  viewAllHref?: string;
  items: RecentListItem[];
};

export function RecentList({ heading, viewAllHref, items }: RecentListProps) {
  const { isDark } = useTheme();
  const viewAllClass = isDark
    ? "rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-foreground"
    : "rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900";
  const rowHover = isDark ? "hover:bg-[var(--tott-dash-ghost-hover)]" : "hover:bg-gray-100";

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--tott-card-border)] px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        {viewAllHref && (
          <Link href={viewAllHref} className={viewAllClass}>
            View all
          </Link>
        )}
      </div>
      <div className={isDark ? "divide-y divide-gray-800/60" : "divide-y divide-gray-200"}>
        {items.map((item) => {
          const content = (
            <div className="flex items-center gap-3 px-5 py-3.5">
              {item.avatar && (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: item.avatar.color || theme.accentGoldFocus,
                    color: theme.bgDark,
                  }}
                >
                  {item.avatar.initials}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{item.title}</p>
                {item.subtitle && (
                  <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                )}
              </div>
              {item.trailing && (
                <span className="shrink-0 text-sm font-medium text-foreground">{item.trailing}</span>
              )}
              {item.href && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-600"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
          );

          return item.href ? (
            <Link key={item.id} href={item.href} className={`block transition-colors ${rowHover}`}>
              {content}
            </Link>
          ) : (
            <div key={item.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
