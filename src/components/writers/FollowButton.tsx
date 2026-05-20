"use client";

import { useTranslations } from "next-intl";
import { useIsFollowing } from "@/hooks/queries/follows";
import { useToggleFollow } from "@/hooks/mutations/follows";

/**
 * Follow/unfollow toggle for a writer. `targetUserId` is the *user*
 * id the follow points at (writer profiles wrap a user). When the
 * caller can't resolve a user id the button renders nothing.
 *
 * Guests who click trigger a POST that 401s; the axios interceptor
 * then redirects to login — same pattern the rest of the app uses
 * for auth-gated actions.
 */
export function FollowButton({
  targetUserId,
  size = "md",
}: {
  targetUserId: string | null | undefined;
  size?: "sm" | "md";
}) {
  const t = useTranslations("Writers");
  const { data: isFollowing } = useIsFollowing(targetUserId);
  const toggle = useToggleFollow();

  if (!targetUserId) return null;

  const following = Boolean(isFollowing);
  const busy = toggle.isPending;
  const height = size === "sm" ? 32 : 40;
  const padding = size === "sm" ? "6px 14px" : "8px 20px";
  const fontSize = size === "sm" ? 13 : 14;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => toggle.mutate(targetUserId)}
      aria-pressed={following}
      className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{
        height,
        padding,
        borderRadius: 8,
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize,
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        // Following = subtle outline; not-following = gold CTA.
        backgroundColor: following
          ? "var(--tott-card-border)"
          : "var(--tott-magazine-btn-bg)",
        color: following
          ? "var(--tott-home-text-strong)"
          : "var(--tott-auth-btn-text)",
        boxShadow: following
          ? "inset 0px 1px 1px rgba(255,255,255,0.08)"
          : "inset 0px 1px 0px rgba(255,255,255,0.4)",
        border: "none",
        cursor: busy ? "not-allowed" : "pointer",
      }}
    >
      {following ? t("following") : t("follow")}
    </button>
  );
}
