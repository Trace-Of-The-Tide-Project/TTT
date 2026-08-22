"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useBookmarkCheck } from "@/hooks/queries/bookmarks";
import { useAddBookmark, useRemoveBookmark } from "@/hooks/mutations/bookmarks";
import { mutationToast } from "@/hooks/useMutationToast";

export function BookmarkButton({ articleId }: { articleId: string }) {
  const t = useTranslations("Content.bookmark");
  const pathname = usePathname();
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && Boolean(user);
  const { data } = useBookmarkCheck(articleId, isAuthed);
  const isBookmarked = data?.isBookmarked ?? false;
  const add = useAddBookmark(articleId);
  const remove = useRemoveBookmark(articleId);
  const pending = add.isPending || remove.isPending;

  function toggle() {
    if (pending) return;
    if (!isAuthed) {
      toast(t("loginRequired"), {
        description: t("loginRequiredHint"),
        action: {
          label: t("logIn"),
          onClick: () => {
            window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(pathname);
          },
        },
      });
      return;
    }
    if (isBookmarked) {
      void mutationToast(() => remove.mutateAsync(), {
        loading: t("removing"),
        success: t("removed"),
        error: t("removeFailed"),
      });
    } else {
      void mutationToast(() => add.mutateAsync(), {
        loading: t("saving"),
        success: t("saved"),
        error: t("saveFailed"),
      });
    }
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={pending}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      aria-label={isBookmarked ? t("remove") : t("add")}
      aria-pressed={isBookmarked}
      className="relative inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        backgroundColor: isBookmarked ? "var(--tott-gold-chip-bg)" : "var(--tott-panel-bg)",
        borderColor: isBookmarked ? "var(--tott-accent-gold)" : "var(--tott-card-border)",
        color: isBookmarked ? "var(--tott-gold-chip-ink)" : "var(--tott-home-text-muted)",
      }}
    >
      <BookmarkIcon filled={isBookmarked} />
      {isBookmarked ? t("saved") : t("save")}
    </motion.button>
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
