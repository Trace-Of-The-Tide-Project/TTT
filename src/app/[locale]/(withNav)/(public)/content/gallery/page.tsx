import { ContentArticlePageClient } from "@/components/content/ContentArticlePageClient";
import { CONTENT_MEDIA_GALLERY } from "@/lib/constants";

export default function ContentGalleryPage() {
  return (
    <ContentArticlePageClient
      demoMedia={{ ...CONTENT_MEDIA_GALLERY, items: CONTENT_MEDIA_GALLERY.items.map((i) => ({ ...i })) }}
    />
  );
}
