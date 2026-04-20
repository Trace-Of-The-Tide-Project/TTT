import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "./related/ContentBreadcrumb";
import { ContentMediaPlayer } from "./media/ContentMediaPlayer";
import { ContentArticleHeader } from "./article/ContentArticleHeader";
import { ContentArticleBody, type ContentArticleSection } from "./article/ContentArticleBody";
import { ContentAuthorCard } from "./sidebar/ContentAuthorCard";
import { ContentContributors } from "./sidebar/ContentContributors";
import { ContentCollection } from "./sidebar/ContentCollection";
import { RelatedContent } from "./related/RelatedContent";
import type { RelatedContentCardData } from "./related/RelatedContentCard";

export type ContentPageLayoutProps = {
  articleId?: string;
  openCallId?: string;
  contentType?: string;
  breadcrumbs: { label: string; href?: string }[];
  media: {
    type: "video" | "audio" | "image" | "gallery";
    src?: string;
    thumbnail?: string;
    duration?: string;
    title?: string;
    /** Shown on hero image (e.g. article cover). */
    coverLabel?: string;
    items?: {
      type: "image" | "video" | "audio";
      src: string;
      thumbnail?: string;
      title?: string;
      duration?: string;
    }[];
  };
  article: {
    title: string;
    edition?: string;
    category?: string;
    publishedDate?: string;
    readingTime?: string;
    /** Shown in article header (e.g. after POST /articles/:id/view). */
    viewCount?: number;
    sections: ContentArticleSection[];
  };
  author: {
    name: string;
    initials: string;
    link?: string;
    color?: string;
  };
  contributors: {
    name: string;
    role: string;
    initials: string;
    color?: string;
  }[];
  collection: {
    articleCount: number;
    duration: string;
    items: {
      image: string;
      title: string;
      author: string;
      date: string;
      description: string;
    }[];
  };
  relatedContent: RelatedContentCardData[];
};

export function ContentPageLayout({
  articleId,
  openCallId,
  contentType,
  breadcrumbs,
  media,
  article,
  author,
  contributors,
  collection,
  relatedContent,
}: ContentPageLayoutProps) {
  const isOpenCall =
    contentType === "open_call" || contentType === "open-call" || contentType === "opencall";
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: theme.pageBackground }}>
      {/* Gradient overlay: header + media only (stops before article); white center, fades to outer */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `
            linear-gradient(to bottom, transparent 50%, rgba(25, 25, 25, 0.4) 85%, rgba(35, 35, 35, 0.5) 100%),
            radial-gradient(ellipse 120% 100% at 50% 45%, rgba(120, 120, 120, 0.5) 0%, rgba(70, 70, 70, 0.25) 65%, transparent 100%)
          `,
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 97%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 97%, transparent 100%)",
        }}
      >
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 pt-4 sm:px-10">
          <ContentBreadcrumb items={breadcrumbs} />
        </div>

        {/* Media */}
        <div className="mx-auto max-w-7xl px-6 pb-4 pt-4 sm:px-10 sm:pb-6">
          <ContentMediaPlayer {...media} />
        </div>

        {/* Article title (at end of fade) */}
        <div className="mx-auto max-w-7xl px-6 pb-4 sm:px-10">
          <ContentArticleHeader
            title={article.title}
            edition={article.edition}
            category={article.category}
            publishedDate={article.publishedDate}
            readingTime={article.readingTime}
            viewCount={article.viewCount}
          />
        </div>
      </div>

      {/* Two-column: article body + sidebar */}
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* Left — article body */}
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <ContentArticleBody sections={article.sections} />
            {isOpenCall && (openCallId || articleId) && (
              <Link
                href={`/open-calls/${openCallId || articleId}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accentGold }}
              >
                Join Call
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Right — sidebar */}
          <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-6 lg:w-[24rem] lg:self-start">
            <div
              className="rounded-2xl border border-gray-800 p-5"
              style={{ backgroundColor: theme.pageBackground }}
            >
              <ContentAuthorCard {...author} />
              <div className="my-5 h-px bg-gray-800" />
              <ContentContributors contributors={contributors} />
            </div>
            <ContentCollection {...collection} />
          </aside>
        </div>
      </div>

      {/* Related content */}
      <RelatedContent items={relatedContent} />

      {/* Share your story */}
      <ShareYourStory />
    </div>
  );
}
