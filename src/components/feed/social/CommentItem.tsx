"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import type { CommentItem as CommentItemType } from "@/services/comments.service";
import { CommentComposer } from "./CommentComposer";

function authorName(user: CommentItemType["user"] | null | undefined): string {
  return user?.full_name?.trim() || user?.username?.trim() || "";
}

export function CommentItem({
  comment,
  onReply,
  isReplyPending,
}: {
  comment: CommentItemType;
  onReply?: (content: string) => void;
  isReplyPending?: boolean;
}) {
  const t = useTranslations("Social");
  const relativeTime = useRelativeTime();
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          style={{ backgroundColor: "var(--tott-panel-bg)", color: "var(--tott-home-text-muted)" }}
          aria-hidden
        >
          {authorName(comment.user).charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--tott-home-text-strong)" }}>
              {authorName(comment.user)}
            </span>
            <span className="text-[11px]" style={{ color: "var(--tott-home-text-muted)" }}>
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--tott-home-text-strong)" }}>
            {comment.content}
          </p>
          {onReply ? (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="mt-0.5 self-start text-[11px] font-medium"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {t("reply")}
            </button>
          ) : null}
          {replying && onReply ? (
            <div className="mt-1.5">
              <CommentComposer
                autoFocus
                isPending={isReplyPending}
                placeholder={t("writeReply")}
                onSubmit={(content) => {
                  onReply(content);
                  setReplying(false);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {comment.replies?.length ? (
        <div className="ms-9 flex flex-col gap-2 border-s ps-3" style={{ borderColor: "var(--tott-card-border)" }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
