import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  deleteArticle,
  publishArticle,
  recordArticleView,
  scheduleArticle,
  updateArticle,
  type CreateArticlePayload,
  type UpdateArticlePayload,
} from "@/services/articles.service";
import { articlesKeys } from "@/hooks/queries/articles";

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => createArticle(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.all }),
  });
}

export function usePublishArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => publishArticle(articleId),
    onSuccess: (_data, articleId) => {
      qc.invalidateQueries({ queryKey: articlesKeys.all });
      qc.invalidateQueries({ queryKey: articlesKeys.byId(articleId) });
    },
  });
}

export function useScheduleArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { articleId: string; scheduledAtIso: string }) =>
      scheduleArticle(args.articleId, args.scheduledAtIso),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: articlesKeys.byId(args.articleId) });
      qc.invalidateQueries({ queryKey: articlesKeys.all });
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { articleId: string; payload: UpdateArticlePayload }) =>
      updateArticle(args.articleId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: articlesKeys.byId(args.articleId) });
      qc.invalidateQueries({ queryKey: articlesKeys.all });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => deleteArticle(articleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.all }),
  });
}

export function useRecordArticleView() {
  return useMutation({
    mutationFn: (articleId: string) => recordArticleView(articleId),
  });
}
