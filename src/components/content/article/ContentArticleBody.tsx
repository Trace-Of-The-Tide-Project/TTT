import { theme } from "@/lib/theme";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { ArticleBodyVideo } from "@/components/content/article/ArticleBodyVideo";
import { ArticleBodyAudio } from "@/components/content/article/ArticleBodyAudio";

export type ContentArticleCallout = string | { title: string; body: string };

export type ContentArticleSection = {
  heading?: string;
  paragraphs: string[];
  quote?: string;
  /** Callout block — title + body card or legacy body-only string */
  callout?: ContentArticleCallout;
  /** API divider block — horizontal rule (not body text) */
  divider?: boolean;
  /** Inline figures from API image / gallery blocks */
  images?: { src: string; alt?: string; caption?: string }[];
};

type ContentArticleBodyProps = {
  sections: ContentArticleSection[];
};

export function ContentArticleBody({ sections }: ContentArticleBodyProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <div key={i} className="space-y-4">
          {section.heading && (
            <h2 className="text-xl font-medium leading-7 text-foreground">
              {section.heading}
            </h2>
          )}

          {section.paragraphs.map((p, j) => (
            <p key={j} className="text-sm leading-relaxed text-foreground">
              {p}
            </p>
          ))}

          {section.divider ? (
            <div className="py-3" role="separator">
              <hr
                className="mx-auto h-px w-full max-w-2xl border-0"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${theme.accentGold}33 15%, ${theme.accentGold}55 50%, ${theme.accentGold}33 85%, transparent 100%)`,
                }}
              />
            </div>
          ) : null}

          {section.callout != null && section.callout !== "" ? (
            <aside
              className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] p-8"
              role="note"
            >
              {typeof section.callout === "object" ? (
                <div className="flex flex-col gap-3">
                  {section.callout.title ? (
                    <p className="m-0 text-4xl font-bold leading-tight text-foreground">
                      {section.callout.title}
                    </p>
                  ) : null}
                  {section.callout.body ? (
                    <p className="m-0 text-lg font-normal leading-relaxed text-foreground/80">
                      {section.callout.body}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="m-0 text-lg font-normal leading-relaxed text-foreground/80">
                  {section.callout}
                </p>
              )}
            </aside>
          ) : null}

          {section.images && section.images.length > 0
            ? section.images.map((img, k) => (
                <figure key={k} className="space-y-2">
                  {isLikelyVideoUrl(img.src) ? (
                    <ArticleBodyVideo src={img.src} />
                  ) : isLikelyAudioUrl(img.src) ? (
                    <ArticleBodyAudio src={img.src} />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element -- remote article URLs from API */
                    <img
                      src={resolveArticleMediaSrc(img.src)}
                      alt={img.alt ?? ""}
                      className="max-h-[min(70vh,720px)] w-full max-w-3xl rounded-lg border border-[var(--tott-card-border)] object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {img.caption ? (
                    <figcaption className="mt-2 text-sm italic text-foreground/65">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))
            : null}

          {section.quote && (
            <blockquote
              className="rounded-r-lg border-l-2 px-6 py-4 text-sm font-medium leading-relaxed text-foreground"
              style={{ borderColor: "#BD9352", backgroundColor: "#262626" }}
            >
              {section.quote}
            </blockquote>
          )}
        </div>
      ))}
    </div>
  );
}
