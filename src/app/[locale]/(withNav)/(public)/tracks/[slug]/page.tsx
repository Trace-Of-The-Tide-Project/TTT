import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";
import { isUsableArticleMediaRef, resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { getTrackBySlug, getTrackItems } from "@/services/tracks.service";
import { TrackDetailContent, type TrackDetail } from "@/components/tracks/TrackDetailContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function TrackDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const track = await getTrackBySlug(slug, locale);
  if (!track) {
    const t = await getTranslations({ locale, namespace: "Tracks.notFound" });
    return (
      <ComingSoon
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
        ctaLabel={t("cta")}
        ctaHref="/tracks"
      />
    );
  }

  const items = await getTrackItems(track.id);

  const detail: TrackDetail = {
    id: track.id,
    title: track.title,
    slug: track.slug,
    description: track.description ?? null,
    color: track.color ?? null,
    items: items.map((item) => ({
      entity_type: item.entity_type,
      id: item.id,
      title: item.title,
      slug: item.slug,
      cover:
        item.cover && isUsableArticleMediaRef(item.cover)
          ? resolveArticleMediaSrc(item.cover)
          : null,
      publishedAt: item.published_at,
    })),
  };

  return <TrackDetailContent track={detail} />;
}
