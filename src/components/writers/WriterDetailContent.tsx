"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WriterProfileHero } from "@/components/writers/WriterProfileHero";
import { WriterLatestRelease } from "@/components/writers/WriterLatestRelease";
import { WriterPublicationsList } from "@/components/writers/WriterPublicationsList";
import { WriterTopReading } from "@/components/writers/WriterTopReading";
import { WriterAboutSection } from "@/components/writers/WriterAboutSection";
import { WriterConnectBand } from "@/components/writers/WriterConnectBand";
import { useWriterWorks } from "@/hooks/queries/writers";
import type { ImageFraming } from "@/lib/image-framing";

const ACCENT = "var(--tott-accent-gold)";

export type WriterSocialLink = {
  /** Stable key — drives the label (website/twitter/instagram/youtube/…). */
  key: string;
  url: string;
};

export type WriterDetailView = {
  id: string;
  /** User id the follow toggle targets (writer profiles wrap a user). */
  userId: string | null;
  name: string;
  headline: string | null;
  bio: string | null;
  quote: string | null;
  location: string | null;
  themes: string[];
  socials: WriterSocialLink[];
  collaborations: string | null;
  recognition: string | null;
  followerCount: number;
  workCount: number;
  avatar: string | null;
  /** Admin-set framing for `avatar`. Undefined renders as before. */
  avatarFraming?: ImageFraming;
  joinedAt: string | null;
  email: string | null;
  externalLink: string | null;
};

export function WriterDetailContent({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");

  const worksQuery = useWriterWorks(writer.id, { status: "published" });
  const works = worksQuery.data?.data ?? [];

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden pb-24"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <WriterProfileHero writer={writer} />

      <WriterLatestRelease works={works} />

      <WriterPublicationsList
        works={works}
        isPending={worksQuery.isPending}
        isError={worksQuery.isError}
      />

      <WriterTopReading writerId={writer.id} />

      <WriterAboutSection writer={writer} />

      <WriterConnectBand writerId={writer.id} userId={writer.userId} name={writer.name} />

      {/* Back to magazine */}
      <div className="mx-auto mt-16 flex max-w-6xl justify-center px-6 sm:px-10">
        <Link
          href="/magazine"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ color: ACCENT }}
        >
          <span aria-hidden className="inline-block rtl:-scale-x-100">←</span>
          {t("backToMagazine")}
        </Link>
      </div>
    </main>
  );
}
