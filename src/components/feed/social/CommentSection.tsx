"use client";

import { useTranslations } from "next-intl";
import { useArticleComments } from "@/hooks/queries/comments";
import { useCreateComment } from "@/hooks/mutations/comments";
import { Skeleton } from "@/components/ui/Skeleton";
import { CommentItem } from "./CommentItem";
import { CommentComposer } from "./CommentComposer";

export function CommentSection({ articleId }: { articleId: string }) {
  const t = useTranslations("Social");
  const { data, isLoading, isError } = useArticleComments(articleId, true);
  const createComment = useCreateComment(articleId);
  const createReply = useCreateComment(articleId);

  return (
    <div
      className="mt-2 flex flex-col gap-3 border-t pt-3"
      style={{ borderColor: "var(--tott-card-border)" }}
    >
      <CommentComposer
        isPending={createComment.isPending}
        onSubmit={(content) => createComment.mutate({ content })}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : isError ? (
        <p className="text-xs" style={{ color: "var(--tott-home-text-muted)" }}>
          {t("commentsError")}
        </p>
      ) : !data?.rows.length ? (
        <p className="text-xs" style={{ color: "var(--tott-home-text-muted)" }}>
          {t("noComments")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.rows.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isReplyPending={createReply.isPending}
              onReply={(content) =>
                createReply.mutate({ content, parent_comment_id: comment.id })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
