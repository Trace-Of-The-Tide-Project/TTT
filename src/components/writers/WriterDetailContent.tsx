"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { WriterProfileHero } from "@/components/writers/WriterProfileHero";
import { WriterWorksSection } from "@/components/writers/WriterWorksSection";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";
const CARD_BORDER = "var(--tott-card-border)";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";

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
};

const KNOWN_SOCIAL_LABELS: Record<string, string> = {
  website: "Website",
  twitter: "Twitter",
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

function socialLabel(key: string): string {
  return KNOWN_SOCIAL_LABELS[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
      <span
        className="shrink-0 text-xs font-medium uppercase tracking-wide sm:w-36 sm:text-start"
        style={{ color: TEXT_MUTED, fontFamily: SANS }}
      >
        {label}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: TEXT_STRONG }}>
        {value}
      </span>
    </div>
  );
}

export function WriterDetailContent({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");

  const hasAbout =
    Boolean(writer.location) ||
    Boolean(writer.collaborations) ||
    Boolean(writer.recognition);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden pb-24"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <WriterProfileHero writer={writer} />

      {/* Bio */}
      {writer.bio ? (
        <RevealOnScroll className="mx-auto mt-16 max-w-3xl px-6 sm:px-10">
          <p
            className="whitespace-pre-line text-lg leading-relaxed"
            style={{ color: TEXT_STRONG }}
          >
            {writer.bio}
          </p>
        </RevealOnScroll>
      ) : null}

      {/* Themes */}
      {writer.themes.length > 0 ? (
        <RevealOnScroll className="mx-auto mt-8 max-w-3xl px-6 sm:px-10">
          <div className="flex flex-wrap items-center gap-2">
            {writer.themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
              >
                {theme}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      ) : null}

      {/* About — chamfered info panel */}
      {hasAbout ? (
        <RevealOnScroll className="mx-auto mt-10 max-w-3xl px-6 sm:px-10">
          <ChamferedPanel size={14}>
            <div className="space-y-3 px-6 py-6">
              {writer.location ? (
                <InfoRow label={t("about.basedIn")} value={writer.location} />
              ) : null}
              {writer.collaborations ? (
                <InfoRow
                  label={t("about.collaborations")}
                  value={writer.collaborations}
                />
              ) : null}
              {writer.recognition ? (
                <InfoRow
                  label={t("about.recognition")}
                  value={writer.recognition}
                />
              ) : null}
            </div>
          </ChamferedPanel>
        </RevealOnScroll>
      ) : null}

      {/* Social links */}
      {writer.socials.length > 0 ? (
        <RevealOnScroll className="mx-auto mt-8 max-w-3xl px-6 sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            {writer.socials.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ border: `1px solid ${CARD_BORDER}`, color: ACCENT }}
              >
                {s.key.toLowerCase() === "website"
                  ? t("socials.website")
                  : socialLabel(s.key)}
              </a>
            ))}
          </div>
        </RevealOnScroll>
      ) : null}

      {/* Works */}
      <WriterWorksSection userId={writer.userId} />

      {/* Back to magazine */}
      <div className="mx-auto mt-20 flex max-w-6xl justify-center px-6 sm:px-10">
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
