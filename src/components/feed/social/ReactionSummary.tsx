"use client";

import { useTranslations } from "next-intl";

export function ReactionSummary({
  total,
  commentCount,
}: {
  total: number;
  commentCount: number;
}) {
  const t = useTranslations("Social");
  if (total === 0 && commentCount === 0) return null;

  return (
    <div
      className="flex items-center gap-3 text-xs"
      style={{ color: "var(--tott-home-text-muted)" }}
    >
      {total > 0 ? <span>{t("reactionCount", { count: total })}</span> : null}
      {commentCount > 0 ? <span>{t("commentCount", { count: commentCount })}</span> : null}
    </div>
  );
}
