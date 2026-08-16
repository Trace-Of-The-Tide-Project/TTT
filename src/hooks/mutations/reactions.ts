import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import {
  toggleArticleReaction,
  type ReactionSummary,
  type ReactionType,
} from "@/services/reactions.service";
import { reactionsKeys } from "@/hooks/queries/reactions";
import { feedKeys } from "@/hooks/queries/feed";
import type { FeedItem, FeedPage } from "@/services/feed.service";

function applyToggle(summary: ReactionSummary, type: ReactionType): ReactionSummary {
  const byType = { ...summary.by_type };
  const prev = summary.my_reaction;

  if (prev === type) {
    // same type -> remove
    byType[type] = Math.max(0, (byType[type] ?? 1) - 1);
    return { total: Math.max(0, summary.total - 1), by_type: byType, my_reaction: null };
  }
  if (prev) {
    // different type -> switch
    byType[prev] = Math.max(0, (byType[prev] ?? 1) - 1);
    byType[type] = (byType[type] ?? 0) + 1;
    return { total: summary.total, by_type: byType, my_reaction: type };
  }
  // none -> add
  byType[type] = (byType[type] ?? 0) + 1;
  return { total: summary.total + 1, by_type: byType, my_reaction: type };
}

function patchFeedItem(
  data: InfiniteData<FeedPage> | undefined,
  articleId: string,
  fn: (item: Extract<FeedItem, { type: "article" }>) => Extract<FeedItem, { type: "article" }>,
): InfiniteData<FeedPage> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      rows: page.rows.map((row) =>
        row.type === "article" && row.article.id === articleId ? fn(row) : row,
      ),
    })),
  };
}

/**
 * Optimistic reaction toggle. Patches only the affected card inside the
 * feed's infinite-query cache — never invalidates the whole feed, which
 * would refetch every page and jar the scroll position.
 */
export function useToggleArticleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, type }: { articleId: string; type: ReactionType }) =>
      toggleArticleReaction(articleId, type),
    onMutate: async ({ articleId, type }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: reactionsKeys.article(articleId) }),
        qc.cancelQueries({ queryKey: feedKeys.all }),
      ]);

      const previousSummary = qc.getQueryData<ReactionSummary>(
        reactionsKeys.article(articleId),
      );
      const previousFeedEntries = qc.getQueriesData<InfiniteData<FeedPage>>({
        queryKey: feedKeys.all,
      });

      if (previousSummary) {
        qc.setQueryData(reactionsKeys.article(articleId), applyToggle(previousSummary, type));
      }

      for (const [key, data] of previousFeedEntries) {
        qc.setQueryData(
          key,
          patchFeedItem(data, articleId, (item) => ({
            ...item,
            social: {
              ...applyToggle(item.social, type),
              comment_count: item.social.comment_count,
            },
          })),
        );
      }

      return { previousSummary, previousFeedEntries, articleId };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.previousSummary) {
        qc.setQueryData(reactionsKeys.article(ctx.articleId), ctx.previousSummary);
      }
      for (const [key, data] of ctx.previousFeedEntries) {
        qc.setQueryData(key, data);
      }
    },
    onSettled: (_data, _err, { articleId }) => {
      qc.invalidateQueries({ queryKey: reactionsKeys.article(articleId) });
    },
  });
}
