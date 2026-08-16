import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { createComment, deleteComment } from "@/services/comments.service";
import { commentsKeys } from "@/hooks/queries/comments";
import { feedKeys } from "@/hooks/queries/feed";
import type { FeedPage } from "@/services/feed.service";

function bumpCommentCount(
  data: InfiniteData<FeedPage> | undefined,
  articleId: string,
  delta: number,
): InfiniteData<FeedPage> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      rows: page.rows.map((row) =>
        row.type === "article" && row.article.id === articleId
          ? {
              ...row,
              social: {
                ...row.social,
                comment_count: Math.max(0, row.social.comment_count + delta),
              },
            }
          : row,
      ),
    })),
  };
}

export function useCreateComment(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; parent_comment_id?: string }) =>
      createComment({ article_id: articleId, ...payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsKeys.article(articleId) });
      for (const [key, data] of qc.getQueriesData<InfiniteData<FeedPage>>({
        queryKey: feedKeys.all,
      })) {
        qc.setQueryData(key, bumpCommentCount(data, articleId, 1));
      }
    },
  });
}

export function useDeleteComment(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsKeys.article(articleId) });
      for (const [key, data] of qc.getQueriesData<InfiniteData<FeedPage>>({
        queryKey: feedKeys.all,
      })) {
        qc.setQueryData(key, bumpCommentCount(data, articleId, -1));
      }
    },
  });
}
