import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function AdminEditArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  return <ContentEditorLayout articleId={articleId} />;
}
