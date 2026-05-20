"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { FollowButton } from "@/components/writers/FollowButton";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";

export type WriterDetailView = {
  id: string;
  /** User id the follow toggle targets (writer profiles wrap a user). */
  userId: string | null;
  name: string;
  bio: string | null;
  edition: string | null;
  avatar: string | null;
};

export function WriterDetailContent({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");
  const initial = (writer.name || "?").trim().charAt(0).toUpperCase();

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
              border: "1px solid var(--tott-card-border)",
            }}
          >
            {writer.avatar ? (
              <Image
                src={writer.avatar}
                alt=""
                fill
                sizes="120px"
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

          {writer.edition ? (
            <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
              {t("editionPrefix")} {writer.edition}
            </p>
          ) : null}

          <div className="mt-5">
            <FollowButton targetUserId={writer.userId} />
          </div>

          {writer.bio ? (
            <p
              className="mt-8 max-w-[60ch] text-base leading-relaxed"
              style={{ color: TEXT_STRONG }}
            >
              {writer.bio}
            </p>
          ) : null}

          <Link
            href="/magazine"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: ACCENT }}
          >
            <span aria-hidden>←</span>
            {t("backToMagazine")}
          </Link>
        </div>
      </div>
    </main>
  );
}
