import { ThreadsPageLayout } from "@/components/content/ThreadsPageLayout";
import {
  THREADS_BREADCRUMBS,
  THREADS_MAIN,
  THREADS_ENTRIES,
  CONTENT_AUTHOR,
  CONTENT_CONTRIBUTORS,
  CONTENT_COLLECTION,
  CONTENT_RELATED,
} from "@/lib/constants";

export default function ThreadsPage() {
  const entries = THREADS_ENTRIES.map((e) => ({
    image: e.image,
    title: e.title,
    edition: e.edition,
    category: e.category,
    publishedDate: e.publishedDate,
    readingTime: e.readingTime,
    sections: e.sections.map((s) => ({
      heading: "heading" in s ? s.heading : undefined,
      paragraphs: [...s.paragraphs],
      quote: "quote" in s ? s.quote : undefined,
    })),
  }));

  return (
    <ThreadsPageLayout
      breadcrumbs={[...THREADS_BREADCRUMBS]}
      mainTitle={THREADS_MAIN.title}
      mainPublishedDate={THREADS_MAIN.publishedDate}
      mainReadingTime={THREADS_MAIN.readingTime}
      entries={entries}
      initialVisibleCount={2}
      loadMoreCount={2}
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
