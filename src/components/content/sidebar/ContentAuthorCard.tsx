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
  color = "var(--tott-gold-chip-bg)",
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
        style={{ backgroundColor: color, color: "var(--tott-gold-chip-ink)" }}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xl font-medium text-foreground wrap-break-word">{name}</p>
          <button
            type="button"
            className="shrink-0 rounded-md p-1.5 text-[var(--tott-dash-control-fg)] shadow-[inset_0_1px_0_var(--tott-glass-highlight)] hover:opacity-90"
            style={{ backgroundColor: "var(--tott-dash-control-bg)" }}
          >
            <MoreDotsIcon />
          </button>
          <button
            type="button"
            onClick={handleFollow}
            disabled={toggling || !authorId}
            className="shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: isFollowing ? "transparent" : "var(--tott-accent-gold)",
              color: isFollowing ? "var(--tott-accent-gold)" : "var(--tott-on-accent)",
              border: isFollowing ? "1px solid var(--tott-accent-gold)" : "none",
              boxShadow: isFollowing ? "none" : "inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {isFollowing ? t("following") : t("follow")}
          </button>
        </div>
        {link && (
          <p className="mt-1 flex items-center gap-1.5 text-sm break-all" style={{ color: "var(--tott-accent-gold)" }}>
            <LinkIcon />
            <span>{link}</span>
          </p>
        )}
      </div>
    </div>
  );
}
