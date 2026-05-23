import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { CONTENT_MEDIA_AUDIO } from "@/lib/constants";

export default function ContentAudioPage() {
  return <ContentArticlePageClient demoMedia={{ ...CONTENT_MEDIA_AUDIO }} />;
}
