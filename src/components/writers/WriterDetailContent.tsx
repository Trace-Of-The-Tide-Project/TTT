"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { WriterProfileHero } from "@/components/writers/WriterProfileHero";
import { WriterWorksSection } from "@/components/writers/WriterWorksSection";

const TEXT_STRONG = "var(--tott-home-text-strong)";
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

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";

/** Gold hex marker + uppercase kicker — same editorial header language as the
 * works section, so every body block reads as a titled section. */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="inline-block shrink-0"
        style={{
          width: 11,
          height: 12,
          backgroundColor: ACCENT,
          clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        }}
      />
      <span
        className="text-xs font-semibold uppercase tracking-[0.24em]"
        style={{ color: ACCENT, fontFamily: SANS }}
      >
        {label}
      </span>
    </div>
  );
}

/** Definition-style about row — gold label, hairline-divided, dense. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 border-t py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <span
        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] sm:w-40 sm:text-start"
        style={{ color: ACCENT, fontFamily: SANS }}
      >
        {label}
      </span>
      <span
        className="text-base leading-relaxed"
        style={{ color: TEXT_STRONG, fontFamily: SERIF }}
      >
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

      {/* Unified editorial body — one column, titled sections, shared rhythm. */}
      <div className="mx-auto mt-20 max-w-3xl px-6 sm:px-10">
        {/* Bio */}
        {writer.bio ? (
          <RevealOnScroll>
            <SectionEyebrow label={t("about.biography")} />
            <p
              className="mt-6 whitespace-pre-line text-lg leading-[1.85] sm:text-xl sm:leading-[1.85]"
              style={{ color: "var(--tott-salt)", fontFamily: SERIF }}
            >
              {writer.bio}
            </p>
          </RevealOnScroll>
        ) : null}

        {/* Themes */}
        {writer.themes.length > 0 ? (
          <RevealOnScroll className="mt-14">
            <SectionEyebrow label={t("about.themes")} />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {writer.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full px-4 py-1.5 text-sm font-medium"
                  style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_STRONG }}
                >
                  {theme}
                </span>
              ))}
            </div>
          </RevealOnScroll>
        ) : null}

        {/* About + socials — one titled region */}
        {hasAbout || writer.socials.length > 0 ? (
          <RevealOnScroll className="mt-14">
            <SectionEyebrow label={t("about.heading")} />
            {hasAbout ? (
              <div className="mt-5">
                <ChamferedPanel size={14}>
                  <div className="px-7 py-5">
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
              </div>
            ) : null}

            {writer.socials.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {writer.socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ border: `1px solid ${CARD_BORDER}`, color: ACCENT }}
                  >
                    {s.key.toLowerCase() === "website"
                      ? t("socials.website")
                      : socialLabel(s.key)}
                  </a>
                ))}
              </div>
            ) : null}
          </RevealOnScroll>
        ) : null}
      </div>

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
