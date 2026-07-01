import { api } from "./api";

export type ContributorRole =
  | "main_contributor"
  | "co-author"
  | "contributor"
  | "editor"
  | "reviewer";

export type ArticleContributor = {
  id: string;
  article_id: string;
  user_id: string;
  role: ContributorRole | string;
  added_at: string;
  user: {
    id: string;
    username: string;
    full_name: string | null;
    profile?: { avatar: string | null; display_name: string | null } | null;
  } | null;
};

function unwrapContributors(raw: unknown): ArticleContributor[] {
  if (Array.isArray(raw)) return raw as ArticleContributor[];
  if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).data)) {
    return (raw as Record<string, unknown>).data as ArticleContributor[];
  }
  return [];
}

export async function getArticleContributors(articleId: string): Promise<ArticleContributor[]> {
  const { data } = await api.get<unknown>(`/articles/${encodeURIComponent(articleId)}/contributors`);
  return unwrapContributors(data);
}

export async function addArticleContributor(
  articleId: string,
  input: { user_id: string; role?: ContributorRole | string },
): Promise<ArticleContributor> {
  const { data } = await api.post<ArticleContributor>(
    `/articles/${encodeURIComponent(articleId)}/contributors`,
    input,
  );
  return data;
}

export async function removeArticleContributor(
  articleId: string,
  contributorId: string,
): Promise<void> {
  await api.delete(`/articles/${encodeURIComponent(articleId)}/contributors/${encodeURIComponent(contributorId)}`);
}
