"use client";

import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import { MapPinIcon } from "@/components/ui/icons";
import { TrendingUpIcon, TrendingDownIcon } from "@/components/ui/icons";

export type TopArticleEntry = {
  id: string;
  title: string;
  contributors?: number;
  views: string;
  trend?: { value: string; direction: "up" | "down" };
};

type TopPerformingArticlesProps = {
  items: TopArticleEntry[];
};

export function TopPerformingArticles({ items }: TopPerformingArticlesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Top Performing Articles</h3>
      <div className="flex flex-col gap-3">
        {items.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[#2f2f2f] px-4 py-3"
          >
            <HexIconOutlined size="md">
              <MapPinIcon />
            </HexIconOutlined>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: "#C9A96E" }}>
                {entry.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              {entry.contributors !== undefined && (
                <p className="text-xs text-gray-400">{entry.contributors} contributors</p>
              )}
              <p className="text-xs text-gray-400">{entry.views} views</p>
            </div>
            {entry.trend && (
              <span
                className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                  entry.trend.direction === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {entry.trend.direction === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {entry.trend.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
