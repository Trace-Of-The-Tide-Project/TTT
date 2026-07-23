"use client";

import { useTranslations } from "next-intl";
import { useBookmarkCheck } from "@/hooks/queries/bookmarks";
import { useAddBookmark, useRemoveBookmark } from "@/hooks/mutations/bookmarks";

export function BookmarkButton({ articleId }: { articleId: string }) {
  const t = useTranslations("Content.bookmark");
  const { data } = useBookmarkCheck(articleId);
  const isBookmarked = data?.isBookmarked ?? false;
  const add = useAddBookmark(articleId);
  const remove = useRemoveBookmark(articleId);
  const pending = add.isPending || remove.isPending;

  function toggle() {
    if (pending) return;
    if (isBookmarked) {
      remove.mutate();
    } else {
      add.mutate();
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={isBookmarked ? t("remove") : t("add")}
      aria-pressed={isBookmarked}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        backgroundColor: isBookmarked ? "var(--tott-gold-chip-bg)" : "transparent",
        color: isBookmarked ? "var(--tott-gold-chip-ink)" : "var(--tott-home-text-muted)",
        border: "1px solid var(--tott-card-border)",
      }}
    >
      <BookmarkIcon filled={isBookmarked} />
      {isBookmarked ? t("saved") : t("save")}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
