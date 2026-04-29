"use client";

import { useTranslations } from "next-intl";
import { LinkIcon, MoreDotsIcon } from "@/components/ui/icons";
import { useIsFollowing } from "@/hooks/queries/follows";
import { useToggleFollow } from "@/hooks/mutations/follows";
import { useAuth } from "@/components/providers/AuthProvider";

type ContentAuthorCardProps = {
  authorId?: string;
  name: string;
  initials: string;
  link?: string;
  color?: string;
};

export function ContentAuthorCard({
  authorId,
  name,
  initials,
  link,
  color = "black",
}: ContentAuthorCardProps) {
  const t = useTranslations("Content");
  const { status } = useAuth();
  const enabled = Boolean(authorId) && status === "authenticated";
  const { data: isFollowing = false } = useIsFollowing(enabled ? authorId : null);
  const toggleMutation = useToggleFollow();
  const toggling = toggleMutation.isPending;

  const handleFollow = () => {
    if (!authorId || toggling) return;
    toggleMutation.mutate(authorId);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
        style={{ backgroundColor: color, color: "#1a1a1a" }}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-lg font-bold text-foreground wrap-break-word">{name}</p>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[var(--tott-card-border)] p-1.5 text-[var(--tott-muted)] hover:text-foreground"
          >
            <MoreDotsIcon />
          </button>
          <button
            type="button"
            onClick={handleFollow}
            disabled={toggling || !authorId}
            className="shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: isFollowing ? "transparent" : "#C9A96E",
              color: isFollowing ? "#C9A96E" : "#1a1a1a",
              border: isFollowing ? "1px solid #C9A96E" : "none",
            }}
          >
            {isFollowing ? t("following") : t("follow")}
          </button>
        </div>
        {link && (
          <p className="mt-1 flex items-center gap-1.5 text-sm break-all" style={{ color: "#C9A96E" }}>
            <LinkIcon />
            <span>{link}</span>
          </p>
        )}
      </div>
    </div>
  );
}
