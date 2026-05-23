import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { CONTENT_MEDIA_VIDEO } from "@/lib/constants";

export default function ContentVideoPage() {
  return <ContentArticlePageClient demoMedia={{ ...CONTENT_MEDIA_VIDEO }} />;
}
