import { ContentPageLayout } from "@/components/content/ContentPageLayout";
import {
  CONTENT_BREADCRUMBS,
  CONTENT_MEDIA_GALLERY,
  CONTENT_ARTICLE,
  CONTENT_AUTHOR,
  CONTENT_CONTRIBUTORS,
  CONTENT_COLLECTION,
  CONTENT_RELATED,
} from "@/lib/constants";

export default function ContentGalleryPage() {
  return (
    <ContentPageLayout
      breadcrumbs={[...CONTENT_BREADCRUMBS]}
      media={{
        type: CONTENT_MEDIA_GALLERY.type,
        items: CONTENT_MEDIA_GALLERY.items.map((item) => ({
          type: item.type,
          src: item.src,
          title: item.title,
        })),
      }}
      article={{
        title: CONTENT_ARTICLE.title,
        edition: CONTENT_ARTICLE.edition,
        category: CONTENT_ARTICLE.category,
        publishedDate: CONTENT_ARTICLE.publishedDate,
        readingTime: CONTENT_ARTICLE.readingTime,
        sections: CONTENT_ARTICLE.sections.map((s) => ({
          heading: "heading" in s ? s.heading : undefined,
          paragraphs: [...s.paragraphs],
          quote: "quote" in s ? s.quote : undefined,
        })),
      }}
      author={{ ...CONTENT_AUTHOR }}
      contributors={[...CONTENT_CONTRIBUTORS].map((c) => ({ ...c }))}
      collection={{
        articleCount: CONTENT_COLLECTION.articleCount,
        duration: CONTENT_COLLECTION.duration,
        items: [...CONTENT_COLLECTION.items].map((item) => ({ ...item })),
      }}
      relatedContent={[...CONTENT_RELATED].map((r) => ({ ...r }))}
    />
  );
}
