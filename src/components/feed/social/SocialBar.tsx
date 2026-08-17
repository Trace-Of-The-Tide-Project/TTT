"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShareButton } from "@/components/ui/ShareButton";
import { BookmarkButton } from "@/components/content/article/BookmarkButton";
import type { ReactionType } from "@/services/reactions.service";
import { useToggleArticleReaction } from "@/hooks/mutations/reactions";
import { ReactionButton } from "./ReactionButton";
import { ReactionSummary } from "./ReactionSummary";
import { CommentSection } from "./CommentSection";

/**
 * Content-type agnostic interaction bar. Only articles carry live reactions
 * and comments today (see reaction-types.ts / comment.model.ts) — issues and
 * books pass canReact=false and render share/bookmark only, ready for when
 * reactions go polymorphic.
 */
export function SocialBar({
  articleId,
  title,
  social,
  canReact = true,
  canComment = true,
  canBookmark = true,
}: {
  articleId: string;
  title: string;
  social: { total: number; my_reaction: ReactionType | null; comment_count: number };
  canReact?: boolean;
  canComment?: boolean;
  canBookmark?: boolean;
}) {
  const t = useTranslations("Social");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const toggle = useToggleArticleReaction();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {canReact ? (
          <ReactionButton
            current={social.my_reaction}
            disabled={toggle.isPending}
            onToggle={(type) => toggle.mutate({ articleId, type })}
          />
        ) : null}
        {canComment ? (
          <button
            type="button"
            onClick={() => setCommentsOpen((v) => !v)}
            aria-expanded={commentsOpen}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("comment")}
          </button>
        ) : null}
        <ShareButton title={title} />
        {canBookmark ? <BookmarkButton articleId={articleId} /> : null}
      </div>

      <ReactionSummary total={social.total} commentCount={social.comment_count} />

      {canComment && commentsOpen ? <CommentSection articleId={articleId} /> : null}
    </div>
  );
}
