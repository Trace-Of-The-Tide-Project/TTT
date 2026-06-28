"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { FollowButton } from "@/components/writers/FollowButton";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";
const CARD_BORDER = "var(--tott-card-border)";

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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-semibold" style={{ color: TEXT_STRONG }}>
        {value}
      </span>
      <span className="mt-0.5 text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <span
        className="shrink-0 text-xs font-medium uppercase tracking-wide sm:w-32 sm:text-right"
        style={{ color: TEXT_MUTED }}
      >
        {label}
      </span>
      <span className="text-sm" style={{ color: TEXT_STRONG }}>
        {value}
      </span>
    </div>
  );
}

export function WriterDetailContent({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");
  const initial = (writer.name || "?").trim().charAt(0).toUpperCase();

  const hasStats = writer.followerCount > 0 || writer.workCount > 0;
  const hasAbout =
    Boolean(writer.location) ||
    Boolean(writer.collaborations) ||
    Boolean(writer.recognition) ||
    writer.themes.length > 0;

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 720px)" }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-full"
            style={{
              width: 120,
              height: 120,
              backgroundColor: "var(--tott-dash-gold-text)",
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            {writer.avatar ? (
              <Image
                src={writer.avatar}
                alt=""
                fill
                sizes="120px"
                // External signed GCS URL — bypass the Next optimizer (it 502s
                // on these); load directly.
                unoptimized
                className="select-none object-cover"
                draggable={false}
              />
            ) : (
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                  fontWeight: 600,
                  fontSize: 44,
                  color: "var(--tott-auth-btn-text)",
                }}
              >
                {initial}
              </span>
            )}
          </div>

          <h1
            className="mt-6 text-3xl font-medium tracking-tight"
            style={{ color: TEXT_STRONG }}
          >
            {writer.name}
          </h1>

          {writer.headline ? (
            <p className="mt-1.5 text-sm" style={{ color: TEXT_MUTED }}>
              {writer.headline}
            </p>
          ) : null}

          <div className="mt-5">
            <FollowButton targetUserId={writer.userId} />
          </div>

          {/* Stats */}
          {hasStats ? (
            <div className="mt-8 flex items-center gap-10">
              <Stat
                value={String(writer.followerCount)}
                label={t("stats.followers")}
              />
              <Stat value={String(writer.workCount)} label={t("stats.works")} />
            </div>
          ) : null}

          {/* Bio */}
          {writer.bio ? (
            <p
              className="mt-8 max-w-[60ch] whitespace-pre-line text-base leading-relaxed"
              style={{ color: TEXT_STRONG }}
            >
              {writer.bio}
            </p>
          ) : null}

          {/* Pull-quote */}
          {writer.quote ? (
            <blockquote
              className="mt-8 max-w-[55ch] border-l-2 pl-4 text-left text-lg italic leading-relaxed"
              style={{ borderColor: ACCENT, color: TEXT_STRONG }}
            >
              “{writer.quote}”
            </blockquote>
          ) : null}

          {/* Themes */}
          {writer.themes.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {writer.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    border: `1px solid ${CARD_BORDER}`,
                    color: TEXT_MUTED,
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* About — left-aligned info rows */}
        {hasAbout ? (
          <div
            className="mx-auto mt-10 max-w-md space-y-3 rounded-xl px-5 py-5"
            style={{ border: `1px solid ${CARD_BORDER}` }}
          >
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
        ) : null}

        {/* Social links */}
        {writer.socials.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {writer.socials.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: `1px solid ${CARD_BORDER}`,
                  color: ACCENT,
                }}
              >
                {s.key.toLowerCase() === "website"
                  ? t("socials.website")
                  : socialLabel(s.key)}
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-12 flex justify-center">
          <Link
            href="/magazine"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: ACCENT }}
          >
            <span aria-hidden className="inline-block rtl:-scale-x-100">←</span>
            {t("backToMagazine")}
          </Link>
        </div>
      </div>
    </main>
  );
}
