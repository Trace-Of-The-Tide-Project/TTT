import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { CONTENT_ARTICLE_FULL } from "@/lib/constants";

export default function ContentArticlePage() {
  return <ContentArticlePageClient demoArticle={CONTENT_ARTICLE_FULL} />;
}
