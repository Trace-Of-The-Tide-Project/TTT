"use client";

import { Link } from "@/i18n/navigation";
import { FileTextIcon, ShareIcon, EyeIcon } from "@/components/ui/icons";

type ScheduledItem = {
  id: string;
  title: string;
  date: string;
  views: string;
  viewHref: string;
};

type ScheduledListProps = {
  items: ScheduledItem[];
  viewAllHref?: string;
};

export function ScheduledList({ items, viewAllHref }: ScheduledListProps) {
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Scheduled</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-gray-400 transition-colors hover:text-foreground"
          >
            View all
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-gray-500">
                <FileTextIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.date}</p>
                {item.views !== "—" && (
                  <p className="mt-1 text-xs text-gray-400">{item.views} Views</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
              >
                <ShareIcon />
                Share
              </button>
              <Link
                href={item.viewHref}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
              >
                <EyeIcon />
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
