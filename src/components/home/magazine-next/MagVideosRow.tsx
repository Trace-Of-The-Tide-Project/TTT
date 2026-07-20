import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionShell } from "@/components/home/SectionShell";
import { MagCarousel } from "./MagCarousel";
import { MagImage } from "./MagImage";
import type { ArticleCard } from "./data";
import { articleHref, coverSrc } from "./ui";

/**
 * Horizontal video row (content_type=video articles). Renders nothing when
 * there are no videos, so the section stays hidden until the first video is
 * published — no dead "coming soon" box. 16:9 thumbnails with a play
 * affordance and a duration badge pinned to the logical end corner.
 */
export async function MagVideosRow({ videos }: { videos: ArticleCard[] }) {
  if (videos.length === 0) return null;
  const t = await getTranslations("MagazineNext.videos");

  return (
    <SectionShell
      id="magazine-videos"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
      fullBleed
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <MagCarousel prevLabel={t("prev")} nextLabel={t("next")}>
          {videos.map((v) => (
            <Link key={v.id} href={articleHref(v.id)} className="group w-72 shrink-0 sm:w-80">
              <div
                className="relative w-full overflow-hidden border border-[var(--tott-card-border)]"
                style={{ aspectRatio: "16 / 9", backgroundColor: "var(--tott-card-border)" }}
              >
                <MagImage
                  src={coverSrc(v.coverImage)}
                  alt={v.title}
                  framing={v.coverFraming}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                {/* Play affordance. */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tott-well-bg)_70%,transparent)] backdrop-blur transition-transform duration-300 group-hover:scale-110">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-[var(--tott-home-text-warm)] ms-0.5" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
                {v.mediaDuration ? (
                  <span className="absolute bottom-2 end-2 rounded bg-[color-mix(in_srgb,var(--tott-well-bg)_82%,transparent)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--tott-home-text-warm)] backdrop-blur">
                    {t("duration", { minutes: v.mediaDuration })}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-[var(--tott-home-text-strong)] group-hover:text-[var(--tott-gold-bright)]">
                {v.title}
              </h3>
            </Link>
          ))}
        </MagCarousel>
      </div>
    </SectionShell>
  );
}
