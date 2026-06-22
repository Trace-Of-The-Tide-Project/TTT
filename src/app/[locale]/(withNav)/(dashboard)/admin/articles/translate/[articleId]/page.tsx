import { TranslationWizard } from "@/components/dashboard/admin/articles/articles-editor/TranslationWizard";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function AdminTranslateArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  return <TranslationWizard articleId={articleId} />;
}
