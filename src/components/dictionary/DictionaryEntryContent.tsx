"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";

const QUOTE_ICON = "/images/writing-room/quote-icon.svg";

export type DictionaryEntryView = {
  id: string;
  word: string;
  body: string;
  author: string;
  role: string;
};

export function DictionaryEntryContent({
  entry,
}: {
  entry: DictionaryEntryView;
}) {
  const t = useTranslations("DictionaryEntry");

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
        <div className="relative" style={{ padding: "40px 32px" }}>
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

          <span
            aria-hidden
            className="relative block"
            style={{ width: 56, height: 64 }}
          >
            <Image
              src={QUOTE_ICON}
              alt=""
              fill
              sizes="56px"
              className="select-none"
              draggable={false}
            />
          </span>

          <h1
            className="mt-6 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: TEXT_STRONG }}
          >
            {entry.word}
          </h1>

          <p
            className="mt-4 text-base leading-relaxed sm:text-lg"
            style={{ color: TEXT_STRONG }}
          >
            {entry.body}
          </p>

          {entry.author ? (
            <p
              className="mt-6 text-lg font-medium"
              style={{ color: TEXT_STRONG }}
            >
              {entry.author}
            </p>
          ) : null}

          {entry.role ? (
            <p
              className="mt-1 text-xs uppercase tracking-wide"
              style={{ color: TEXT_MUTED, letterSpacing: "0.04em" }}
            >
              {entry.role}
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <Link
            href="/writing-room"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: ACCENT }}
          >
            <span aria-hidden>←</span>
            {t("backToDictionary")}
          </Link>
        </div>
      </div>
    </main>
  );
}
