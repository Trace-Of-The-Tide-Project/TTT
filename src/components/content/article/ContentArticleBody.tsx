import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { ArticleBodyVideo } from "@/components/content/article/ArticleBodyVideo";
import { ArticleBodyAudio } from "@/components/content/article/ArticleBodyAudio";
import { RichContent } from "@/components/ui/rich-text/RichContent";

export type ContentArticleCallout = string | { title: string; body: string };

export type ContentArticleSection = {
  heading?: string;
  /** H2 (default) vs H3. Ignored unless `heading` is set. */
  headingLevel?: 2 | 3;
  paragraphs: string[];
  quote?: string;
  /** Callout block — title + body card or legacy body-only string */
  callout?: ContentArticleCallout;
  /** API divider block — horizontal rule (not body text) */
  divider?: boolean;
  /** Inline figures from API image / gallery blocks */
  images?: { src: string; alt?: string; caption?: string }[];
  /** Highlighted figures shown as a 3-up grid of stat cards */
  stats?: { value: string; label: string }[];
  /** Pull quote — distinct from `quote`: larger type, gold accent, optional attribution. */
  pullQuote?: { text: string; attribution?: string };
  /** Structured list — items are inline-HTML strings, one nesting level via `items`. */
  list?: { ordered: boolean; items: ListItem[] };
  /** Validated video embed (YouTube/Vimeo). `src` is always constructed from
   *  a charset-validated provider id — never authored/stored markup. */
  embed?: { src: string; aspect: string; title: string };
  /** Per-block direction override. Absent = inherit from the article/page container. */
  dir?: "ltr" | "rtl";
};

export type ListItem = string | { items: string[] };

type ContentArticleBodyProps = {
  sections: ContentArticleSection[];
};

/** Stable slug for a heading so the table of contents can anchor to it. */
export function articleHeadingId(heading: string, index: number): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${index}${slug ? `-${slug}` : ""}`;
}

export function ContentArticleBody({ sections }: ContentArticleBodyProps) {
  return (
    /* Measured line length for comfortable long-form reading — caps the
       text column near ~68 characters while figures/galleries can still
       breathe within their own blocks. */
    <div className="max-w-[68ch] space-y-10 text-[1.0625rem] leading-[1.75]">
      {sections.map((section, i) => (
        <div
          key={i}
          dir={section.dir}
          className="space-y-4 scroll-mt-24"
          id={section.heading ? articleHeadingId(section.heading, i) : undefined}
        >
          {section.heading &&
            (section.headingLevel === 3 ? (
              <h3 className="text-xl font-medium leading-snug text-foreground">
                {section.heading}
              </h3>
            ) : (
              <h2 className="text-2xl font-medium leading-snug text-foreground">
                {section.heading}
              </h2>
            ))}

          {section.paragraphs.map((p, j) => (
            <p key={j} className="text-[1.0625rem] leading-[1.75] text-foreground">
              <RichContent html={p} variant="inline" dir={section.dir} />
            </p>
          ))}

          {section.list && section.list.items.length > 0 ? (
            <ArticleList ordered={section.list.ordered} items={section.list.items} dir={section.dir} />
          ) : null}

          {section.embed ? (
            <div
              className="w-full overflow-hidden rounded-2xl border border-[var(--tott-card-border)]"
              style={{ aspectRatio: section.embed.aspect }}
            >
              <iframe
                src={section.embed.src}
                title={section.embed.title}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : null}

          {section.stats && section.stats.length > 0 ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              {section.stats.map((stat, k) => (
                <div
                  key={k}
                  className="flex min-h-[120px] flex-1 flex-col items-start gap-2 rounded-lg border border-[var(--tott-card-border)] p-6"
                  style={{ backgroundColor: "var(--tott-elevated)" }}
                >
                  <span className="text-2xl font-medium leading-8 tracking-[-0.015em] text-foreground">
                    {stat.value}
                  </span>
                  <span
                    className="self-stretch text-xs font-normal leading-4 text-[var(--tott-content-stat-label)]"
                    style={{ textShadow: "var(--tott-home-text-shadow)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {section.divider ? (
            <div className="py-3" role="separator">
              <hr
                className="mx-auto h-px w-full max-w-2xl border-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--tott-accent-gold) 20%, transparent) 15%, color-mix(in srgb, var(--tott-accent-gold) 33%, transparent) 50%, color-mix(in srgb, var(--tott-accent-gold) 20%, transparent) 85%, transparent 100%)",
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
                      <RichContent html={section.callout.body} variant="inline" dir={section.dir} />
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="m-0 text-lg font-normal leading-relaxed text-foreground/80">
                  <RichContent html={section.callout} variant="inline" dir={section.dir} />
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
                      className="aspect-[16/9] w-full rounded-2xl border border-[var(--tott-card-border)] object-cover"
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
              className="rounded-e-lg border-s-2 px-6 py-4 text-sm font-medium leading-relaxed text-foreground"
              style={{ borderColor: "var(--tott-content-quote-border)", backgroundColor: "var(--tott-elevated)" }}
            >
              <RichContent html={section.quote} variant="inline" dir={section.dir} />
            </blockquote>
          )}

          {section.pullQuote && (
            <figure
              className="border-s-4 py-2 ps-6"
              style={{ borderColor: "var(--tott-accent-gold)" }}
            >
              <blockquote
                className="m-0 font-display text-2xl leading-snug"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                <RichContent html={section.pullQuote.text} variant="inline" dir={section.dir} />
              </blockquote>
              {section.pullQuote.attribution ? (
                <figcaption className="mt-3 text-sm text-foreground/65">
                  — {section.pullQuote.attribution}
                </figcaption>
              ) : null}
            </figure>
          )}
        </div>
      ))}
    </div>
  );
}

type ArticleListProps = {
  ordered: boolean;
  items: ListItem[];
  dir?: "ltr" | "rtl";
};

/** Structured list render — real <ul>/<ol>, one nesting level, inline rich text per item. */
function ArticleList({ ordered, items, dir }: ArticleListProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      dir={dir}
      className={`ms-5 space-y-1 text-[1.0625rem] leading-[1.75] text-foreground ${
        ordered ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((item, i) =>
        typeof item === "string" ? (
          <li key={i}>
            <RichContent html={item} variant="inline" dir={dir} />
          </li>
        ) : (
          <li key={i}>
            <Tag
              dir={dir}
              className={`ms-5 space-y-1 ${ordered ? "list-decimal" : "list-disc"}`}
            >
              {item.items.map((sub, j) => (
                <li key={j}>
                  <RichContent html={sub} variant="inline" dir={dir} />
                </li>
              ))}
            </Tag>
          </li>
        )
      )}
    </Tag>
  );
}
