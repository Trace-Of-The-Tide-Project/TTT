import { notFound } from "next/navigation";
import {
  getWriter,
  getWriterProfileFull,
  writerAvatar,
  writerDisplayName,
  type WriterProfileFull,
  type WriterSocialLinks,
} from "@/services/writers.service";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import {
  WriterDetailContent,
  type WriterDetailView,
  type WriterSocialLink,
} from "@/components/writers/WriterDetailContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

const SOCIAL_ORDER = ["website", "twitter", "instagram", "youtube"];

/** Flatten social_links ({website, twitter, …}) into an ordered list,
 * keeping only usable http(s) URLs and putting known keys first. */
function toSocialLinks(links: WriterSocialLinks | null | undefined): WriterSocialLink[] {
  if (!links || typeof links !== "object") return [];
  const entries: Array<{ key: string; url: string }> = [];
  for (const [key, value] of Object.entries(links)) {
    const url = typeof value === "string" ? value.trim() : "";
    if (url && /^https?:\/\//i.test(url)) entries.push({ key, url });
  }
  entries.sort((a, b) => {
    const ia = SOCIAL_ORDER.indexOf(a.key);
    const ib = SOCIAL_ORDER.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return entries;
}

function num(v: number | null | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function buildView(p: WriterProfileFull, fallbackName: string, avatar: string | null): WriterDetailView {
  return {
    id: p.id,
    userId: p.user_id ?? null,
    name: p.display_name?.trim() || p.pen_name?.trim() || fallbackName || "Writer",
    headline: p.headline?.trim() || null,
    bio: p.bio_long?.trim() || null,
    quote: p.quote?.trim() || null,
    location: (p.location ?? p.based_in)?.trim() || null,
    themes: Array.isArray(p.themes) ? p.themes.filter((t) => t?.trim()) : [],
    socials: toSocialLinks(p.social_links),
    collaborations: p.collaborations?.trim() || null,
    recognition: p.recognition?.trim() || null,
    followerCount: num(p.follower_count),
    workCount: num(p.work_count),
    avatar,
  };
}

export default async function WriterDetailPage({ params }: PageProps) {
  const { id } = await params;

  const full = await getWriterProfileFull(id);

  if (full) {
    const avatar = full.avatar_url?.trim()
      ? resolveArticleMediaSrc(full.avatar_url.trim())
      : null;
    const view = buildView(full, full.display_name?.trim() || "", avatar);
    return <WriterDetailContent writer={view} />;
  }

  // Fallback: the rich endpoint failed — fall back to the basic row so the
  // page still renders the name/avatar/follow button instead of 404ing.
  const writer = await getWriter(id);
  if (!writer) return notFound();

  const view: WriterDetailView = {
    id: writer.id,
    userId: writer.user_id ?? writer.user?.id ?? null,
    name: writerDisplayName(writer) || "Writer",
    headline: writer.headline?.trim() || null,
    bio: writer.bio_long?.trim() || writer.bio?.trim() || null,
    quote: writer.quote?.trim() || null,
    location: writer.location?.trim() || null,
    themes: Array.isArray(writer.themes) ? writer.themes.filter((t) => t?.trim()) : [],
    socials: toSocialLinks(writer.social_links),
    collaborations: writer.collaborations?.trim() || null,
    recognition: writer.recognition?.trim() || null,
    followerCount: 0,
    workCount: 0,
    avatar: writerAvatar(writer),
  };

  return <WriterDetailContent writer={view} />;
}
