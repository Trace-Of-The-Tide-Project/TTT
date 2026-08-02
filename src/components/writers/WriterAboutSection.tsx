"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { MapPinIcon, StarIcon } from "@/components/ui/icons";
import { WriterSupportPanel } from "@/components/writers/WriterSupportPanel";
import type { WriterDetailView } from "@/components/writers/WriterDetailContent";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const ACCENT = "var(--tott-accent-gold)";
const CARD_BORDER = "var(--tott-card-border)";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";

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
        className="text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--tott-gold-muted)", fontFamily: SANS }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <ChamferedPanel size={14} className="h-full">
      <div className="flex h-full flex-col items-center gap-2 px-4 py-6 text-center">
        <span
          className="flex size-14 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--tott-accent-gold) 12%, var(--tott-home-surface))",
            color: ACCENT,
          }}
        >
          {icon}
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
        >
          {label}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: TEXT_STRONG, fontFamily: SANS }}
        >
          {value}
        </span>
      </div>
    </ChamferedPanel>
  );
}

export function WriterAboutSection({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");

  const statCards = [
    writer.location
      ? { key: "basedIn", icon: <MapPinIcon />, label: t("about.basedIn"), value: writer.location }
      : null,
    writer.collaborations
      ? {
          key: "collaborations",
          icon: <MapPinIcon />,
          label: t("about.collaborations"),
          value: writer.collaborations,
        }
      : null,
    writer.recognition
      ? { key: "recognition", icon: <StarIcon />, label: t("about.recognition"), value: writer.recognition }
      : null,
  ].filter(Boolean) as { key: string; icon: React.ReactNode; label: string; value: string }[];

  const hasAbout = writer.bio || writer.quote || writer.themes.length > 0 || statCards.length > 0;
  if (!hasAbout && !writer.userId) return null;

  return (
    <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-10">
      <RevealOnScroll>
        <SectionEyebrow label={t("about.heading")} />
      </RevealOnScroll>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {writer.bio ? (
            <RevealOnScroll>
              <ChamferedPanel size={16}>
                <div className="px-7 py-6">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: TEXT_STRONG, fontFamily: SERIF }}
                  >
                    {t("about.biography")}
                  </h3>
                  <p
                    className="mt-3 whitespace-pre-line text-base leading-[1.75]"
                    style={{ color: "var(--tott-salt)", fontFamily: SERIF }}
                  >
                    {writer.bio}
                  </p>
                </div>
              </ChamferedPanel>
            </RevealOnScroll>
          ) : null}

          {writer.quote ? (
            <RevealOnScroll>
              <blockquote
                className="border-s-2 ps-5"
                style={{ borderColor: ACCENT }}
              >
                <p
                  className="text-xl leading-snug sm:text-2xl"
                  style={{ fontFamily: SERIF, color: TEXT_STRONG }}
                >
                  <span aria-hidden style={{ color: ACCENT }}>
                    “
                  </span>
                  {writer.quote}
                  <span aria-hidden style={{ color: ACCENT }}>
                    ”
                  </span>
                </p>
              </blockquote>
            </RevealOnScroll>
          ) : null}

          {writer.themes.length > 0 ? (
            <RevealOnScroll>
              <ChamferedPanel size={16}>
                <div className="px-7 py-6">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: TEXT_STRONG, fontFamily: SERIF }}
                  >
                    {t("about.themes")}
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
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
                </div>
              </ChamferedPanel>
            </RevealOnScroll>
          ) : null}

          {statCards.length > 0 ? (
            <RevealOnScroll
              className={`grid gap-4 ${
                statCards.length === 1
                  ? "grid-cols-1 sm:max-w-xs"
                  : statCards.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {statCards.map((s) => (
                <StatCard key={s.key} icon={s.icon} label={s.label} value={s.value} />
              ))}
            </RevealOnScroll>
          ) : null}

          {writer.socials.length > 0 ? (
            <RevealOnScroll className="flex flex-wrap items-center gap-3">
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
                    : s.key.charAt(0).toUpperCase() + s.key.slice(1)}
                </a>
              ))}
            </RevealOnScroll>
          ) : null}
        </div>

        <WriterSupportPanel writerId={writer.id} userId={writer.userId} />
      </div>
    </section>
  );
}
