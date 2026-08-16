"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useFollowingFeed } from "@/hooks/queries/feed";
import { FeedItem } from "./FeedItem";
import { FeedSkeleton } from "./FeedSkeleton";
import { FeedEmptyState } from "./FeedEmptyState";

export function FeedStream() {
  const t = useTranslations("Feed");
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFollowingFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const items = data?.pages.flatMap((page) => page.rows) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <FeedSkeleton />;

  if (isError) {
    return (
      <div
        className="flex flex-col items-start gap-3 p-8"
        style={{ border: "1px solid var(--tott-card-border)", borderRadius: 12 }}
      >
        <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
          {t("error")}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!items.length) return <FeedEmptyState />;

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="border-t first:border-t-0"
          style={{ borderColor: "var(--tott-card-border)" }}
        >
          <FeedItem item={item} />
        </div>
      ))}
      <div ref={sentinelRef} aria-hidden />
      {isFetchingNextPage ? <FeedSkeleton count={1} /> : null}
    </div>
  );
}
