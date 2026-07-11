import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

/** Magazine article editing under the magazine route — back link and context
 * read as magazine, not the main-site article editor. */
export default async function AdminMagazineArticleEditPage({ params }: PageProps) {
  const { articleId } = await params;
  return (
    <ContentEditorLayout
      articleId={articleId}
      initialProduct="magazine"
      returnTo="/admin/magazine/articles"
    />
  );
}
