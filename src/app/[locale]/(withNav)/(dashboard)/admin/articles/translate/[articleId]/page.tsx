import { redirect } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string; articleId: string }>;
};

/** The translate hub was retired — the article editor now has in-place
 * language tabs. Old links land on the edit page instead. */
export default async function AdminTranslateArticlePage({ params }: PageProps) {
  const { locale, articleId } = await params;
  redirect({ href: `/admin/articles/edit/${articleId}`, locale });
}
