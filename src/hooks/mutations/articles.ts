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
import { translationKeys } from "@/hooks/queries/translations";

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => createArticle(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articlesKeys.all });
      // A newly created translation joins an existing group — refresh any open
      // translation panels/badges so the new language version shows up.
      qc.invalidateQueries({ queryKey: translationKeys.all });
    },
    meta: { silent: true },
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
    meta: { silent: true },
  });
}

export function useDeleteArticle(options?: { silent?: boolean }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => deleteArticle(articleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.all }),
    meta: { silent: options?.silent ?? true },
  });
}

export function useRecordArticleView() {
  return useMutation({
    mutationFn: (articleId: string) => recordArticleView(articleId),
  });
}
