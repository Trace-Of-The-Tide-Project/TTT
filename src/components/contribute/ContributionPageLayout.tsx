"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { HexImageGrid } from "@/components/ui/HexImageGrid";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const TIP_JAR_ICON = "/images/start-an-issue/tip-jar-icon.svg";

// Shared chrome resolves through the project's --tott-* variables so it
// swaps cleanly between light and dark themes.
const FRAME_BORDER = "var(--tott-card-border)";
const FRAME_RADIUS = 8;
const LABEL_COLOR = "var(--tott-home-text-strong)";
const HELPER_COLOR = "var(--tott-home-text-muted)";
const ACCENT = "var(--tott-accent-gold)";
const ACCENT_TEXT = "var(--tott-auth-btn-text)";

type SupportCard = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type ContributionPageLayoutProps = {
  /** Page header above the form — the bit that legitimately differs between
   *  pages (an article header on Open Call, eyebrow/title/subtitle on Start an Issue). */
  titleBlock: ReactNode;
  /** The form, dropped into the shared chamfered frame. Owns its own fields,
   *  submit button, and back-to-home link. */
  children: ReactNode;
  /** "Support / Contribute" card rendered below the form. */
  support: SupportCard;
  /** Content-column max width in px. Defaults to 552 (Start an Issue); Open Call
   *  passes a wider value to keep its article intro readable. */
  contentMaxWidth?: number;
};

/**
 * Page scaffold shared by the Open Call and Start an Issue pages: hex backdrop,
 * the HexImageGrid + content column, a chamfered frame around the form, and the
 * support card. Each page supplies its own header and form as children.
 */
export function ContributionPageLayout({
  titleBlock,
  children,
  support,
  contentMaxWidth = 552,
}: ContributionPageLayoutProps) {
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
        className="relative mx-auto flex w-full flex-col items-stretch px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 1600px)" }}
      >
        <section className="relative flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <HexImageGrid className="pt-2" />

          <div
            className="relative flex w-full min-w-0 flex-col items-start"
            style={{ maxWidth: `${contentMaxWidth}px` }}
          >
            <div className="w-full" style={{ marginBottom: "24px" }}>
              {titleBlock}
            </div>

            {/* Form frame — ChamferedFrame paints the 24px-cut edges; the form
                fields sit in the padded body. */}
            <div className="relative w-full" style={{ padding: "24px 0" }}>
              <ChamferedFrame size={24} borderColor={FRAME_BORDER} />
              <div
                className="flex w-full flex-col items-stretch"
                style={{ padding: "16px 40px" }}
              >
                {children}
              </div>
            </div>

            {/* Support card — same chamfered treatment, single icon + text + CTA row. */}
            <div className="relative mt-8 w-full" style={{ padding: "24px 0" }}>
              <ChamferedFrame size={24} borderColor={FRAME_BORDER} />
              <div
                className="flex w-full flex-col items-stretch sm:flex-row sm:items-center"
                style={{ padding: "16px 40px", gap: "24px" }}
              >
                <span
                  aria-hidden
                  className="relative inline-block shrink-0 self-center sm:self-auto"
                  style={{ width: "56px", height: "64px" }}
                >
                  <Image
                    src={TIP_JAR_ICON}
                    alt=""
                    fill
                    sizes="56px"
                    className="select-none"
                    draggable={false}
                  />
                </span>

                <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "8px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: LABEL_COLOR,
                    }}
                  >
                    {support.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: HELPER_COLOR,
                      textShadow: "var(--tott-home-text-shadow)",
                    }}
                  >
                    {support.description}
                  </p>
                </div>

                <Link
                  href={support.ctaHref}
                  className="inline-flex shrink-0 items-center justify-center self-stretch transition-opacity hover:opacity-90 sm:self-center"
                  style={{
                    height: "40px",
                    padding: "8px",
                    borderRadius: `${FRAME_RADIUS}px`,
                    backgroundColor: ACCENT,
                    boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                    color: ACCENT_TEXT,
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    textAlign: "center",
                  }}
                >
                  <span style={{ padding: "2px 4px" }}>{support.ctaLabel}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
