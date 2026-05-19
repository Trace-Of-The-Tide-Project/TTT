"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

// Figma "Icon Wrapper" assets — 56×64 chamfered hex with the glyph
// (writing / heart-handshake) baked in, inset shadow filter included.
const ICON_START_ISSUE = "/images/home/support-start-issue.svg";
const ICON_FUND_ISSUE = "/images/home/support-fund-issue.svg";
// 64×72 chamfered hex with the heart glyph + inset gold glow (used as
// the centred badge above "How Support Works").
const ICON_PROCESS_HEART = "/images/home/support-process-heart.svg";
// 56×64 "Icon Wrapper" assets for the four numbered steps in the
// "How Support Works" timeline. Each baked-in SVG includes the
// chamfered hex background + inset shadow + glyph at the right size.
const ICON_STEP_1 = "/images/home/support-step-1.svg"; // check
const ICON_STEP_2 = "/images/home/support-step-2.svg"; // settings
const ICON_STEP_3 = "/images/home/support-step-3.svg"; // eye
const ICON_STEP_4 = "/images/home/support-step-4.svg"; // share
// 56×64 "Icon Wrapper" assets for the four cards in the "Your Impact"
// row. Same chamfered-hex pattern as the step icons.
const ICON_IMPACT_1 = "/images/home/support-impact-1.svg"; // palette
const ICON_IMPACT_2 = "/images/home/support-impact-2.svg"; // users
const ICON_IMPACT_3 = "/images/home/support-impact-3.svg"; // book
const ICON_IMPACT_4 = "/images/home/support-impact-4.svg"; // book-2

/* ─────────────────────────── tokens (Figma) ─────────────────────────── */
const GOLD = "#C9A96E";
const GOLD_TEXT = "#332217";
const TEXT_STRONG = "#FFFFFF";
const TEXT_MUTED = "#A3A3A3";
const TEXT_DIM = "#7B7B7B";
const EYEBROW = "#AF7E47";
const FRAME = "#333333";
const ICON_TINT = "#E8DDC0";
const PANEL_BG = "#262626";

const SECTION_GAP = 48;

/**
 * Support Hand tab — Figma "Property 1=Variant5". Five stacked sections:
 *   1. Create or Fund an Issue — eyebrow + heading + body + 2 CTA cards
 *   2. How Support Works — gradient heading + 4 numbered process steps
 *   3. Your Impact — eyebrow + heading + 4 outcome cards
 *   4. What we fund — 4 small chip cards (Pay Writers / Produce Visuals / …)
 *   5. Open Issues — eyebrow + heading + body + 3 fundraising cards
 *
 * The Figma comp wraps every section in its signature chamfered
 * frame; we share one outline via the project's <ChamferedFrame />.
 */
export function MagazineSupportV2() {
  const t = useTranslations("Home.magazine.supportV2");

  return (
    <div
      className="mx-auto flex w-full max-w-[1317px] flex-col"
      style={{ gap: SECTION_GAP }}
    >
      <CreateOrFundSection t={t} />
      <HowSupportWorksSection t={t} />
      <YourImpactSection t={t} />
      <WhatWeFundSection t={t} />
      <OpenIssuesSection t={t} />
    </div>
  );
}

/* ─────────────────────────── 1. Create or Fund ─────────────────────────── */
function CreateOrFundSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <CornerFrame>
      <div className="flex w-full flex-col items-center" style={{ gap: 8, padding: "32px 0 16px" }}>
        <Eyebrow>{t("ctaEyebrow")}</Eyebrow>
        <SectionHeading>{t("ctaHeading")}</SectionHeading>
        <Body className="max-w-[442px] text-center">{t("ctaBody")}</Body>
      </div>
      <div className="flex flex-col gap-6 px-4 py-4 md:flex-row md:px-10">
        <CornerFrame className="flex-1">
          <CtaCard
            iconSrc={ICON_START_ISSUE}
            title={t("startIssueTitle")}
            body={t("startIssueBody")}
            buttonLabel={t("startIssueButton")}
            href="/start-an-issue"
          />
        </CornerFrame>
        <CornerFrame className="flex-1">
          <CtaCard
            iconSrc={ICON_FUND_ISSUE}
            title={t("supportIssueTitle")}
            body={t("supportIssueBody")}
            buttonLabel={t("supportIssueButton")}
            href="/open-issues"
          />
        </CornerFrame>
      </div>
    </CornerFrame>
  );
}

function CtaCard({
  iconSrc,
  title,
  body,
  buttonLabel,
  href,
}: {
  iconSrc: string;
  title: string;
  body: string;
  buttonLabel: string;
  href: string;
}) {
  // Figma `Form` body — flex column, align flex-start, padding 0 40,
  // gap 16. Icon top → content (title + description) → gold button,
  // all left-aligned. The icon is the brand-exported 56×64 "Icon
  // Wrapper" SVG (chamfered hex + inset shadow + glyph baked in), so
  // we render it directly instead of wrapping a glyph in IconBadge.
  return (
    <div
      className="flex flex-col items-start"
      style={{ gap: 16, padding: "24px 40px" }}
    >
      <Image
        src={iconSrc}
        alt=""
        width={56}
        height={64}
        className="select-none"
        draggable={false}
      />
      <div
        className="flex flex-col items-start"
        style={{ padding: "12px 0", gap: 24, maxWidth: 355 }}
      >
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 20,
            lineHeight: "28px",
            color: TEXT_STRONG,
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            // Figma "Subheading/Small" — Inter 500 12/16 +0.04em UPPERCASE.
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "16px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: TEXT_MUTED,
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>
      <GoldButton href={href}>{buttonLabel}</GoldButton>
    </div>
  );
}

/* ─────────────────────────── 2. How Support Works ─────────────────────────── */
function HowSupportWorksSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const steps = [
    { n: "01", title: t("step1Title"), body: t("step1Body"), iconSrc: ICON_STEP_1 },
    { n: "02", title: t("step2Title"), body: t("step2Body"), iconSrc: ICON_STEP_2 },
    { n: "03", title: t("step3Title"), body: t("step3Body"), iconSrc: ICON_STEP_3 },
    { n: "04", title: t("step4Title"), body: t("step4Body"), iconSrc: ICON_STEP_4 },
  ];

  return (
    <div className="flex w-full flex-col items-center" style={{ gap: 24 }}>
      <div className="flex flex-col items-center" style={{ gap: 8 }}>
        {/* 64×72 chamfered heart hex — Figma-exported asset with the
            inset gold glow + 1px gradient stroke baked in. */}
        <Image
          src={ICON_PROCESS_HEART}
          alt=""
          width={64}
          height={72}
          className="select-none"
          draggable={false}
        />
        <h2
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: "40px",
            color: TEXT_STRONG,
            margin: 0,
            background:
              "radial-gradient(100% 100% at 0% 50%, #C9A96E 0%, rgba(201, 169, 110, 0) 50%), linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), #000000",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          {t("processHeading")}
        </h2>
        <Body className="text-center">{t("processEyebrow")}</Body>
      </div>

      {/* Vertical-zigzag timeline. Each step row has its own
          line+dot+line connector (Figma `Group 1`: top 32.39 line →
          gold dot → bottom 169.75 line). The connectors don't merge
          into a continuous line — there's a small gap between rows
          matching the Figma layout. */}
      <div className="w-full max-w-[780px]">
        <div className="flex flex-col" style={{ gap: 16 }}>
          {steps.map((s, i) => (
            <StepRow
              key={s.n}
              side={i % 2 === 0 ? "left" : "right"}
              number={s.n}
              title={s.title}
              body={s.body}
              iconSrc={s.iconSrc}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRow({
  side,
  number,
  title,
  body,
  iconSrc,
}: {
  side: "left" | "right";
  number: string;
  title: string;
  body: string;
  iconSrc: string;
}) {
  const isLeft = side === "left";
  const textAlign: React.CSSProperties = { textAlign: isLeft ? "right" : "left" };

  return (
    <div className="relative grid grid-cols-2">
      {/* Per-row connector — Figma `Group 1`: top line 32.39 → gold
          dot 17.87 → bottom line 169.75, all on the same vertical
          axis at the centre of the row. Each row owns its own
          connector; consecutive rows leave a small visible gap
          between them (matching the Figma 12-16px spacing). */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: 0, height: 32, width: 1, backgroundColor: FRAME }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: 32,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: GOLD,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: 50, bottom: 0, width: 1, backgroundColor: FRAME }}
      />

      {isLeft ? (
        <>
          <div className="pr-6">
            <StepCard number={number} title={title} body={body} iconSrc={iconSrc} textAlign={textAlign} alignItems="flex-end" />
          </div>
          <div />
        </>
      ) : (
        <>
          <div />
          <div className="pl-6">
            <StepCard number={number} title={title} body={body} iconSrc={iconSrc} textAlign={textAlign} alignItems="flex-start" />
          </div>
        </>
      )}
    </div>
  );
}

function StepCard({
  number,
  title,
  body,
  iconSrc,
  textAlign,
  alignItems,
}: {
  number: string;
  title: string;
  body: string;
  iconSrc: string;
  textAlign: React.CSSProperties;
  alignItems: "flex-start" | "flex-end";
}) {
  // Figma `Body` — padding 0 40 (the corner frame already provides
  // the outer chrome), gap 16 between Icon Wrapper and Frame 52
  // (number / title / body stack with gap 4).
  return (
    <CornerFrame>
      <div
        className="flex flex-col"
        style={{ padding: "24px 40px", gap: 16, alignItems }}
      >
        <Image
          src={iconSrc}
          alt=""
          width={56}
          height={64}
          className="select-none"
          draggable={false}
        />
        <div className="flex w-full flex-col" style={{ gap: 4, alignItems }}>
          <p
            style={{
              // Figma "01" — Paragraph/Small, Inter 400 14/20 ‑0.005em #7B7B7B.
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: TEXT_DIM,
              margin: 0,
              width: "100%",
              ...textAlign,
            }}
          >
            {number}
          </p>
          <h3
            style={{
              // Figma "Select a care stream" — Label/Medium, Inter 500
              // 16/24 ‑0.01em #FFFFFF.
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: TEXT_STRONG,
              margin: 0,
              width: "100%",
              ...textAlign,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              // Figma description — Paragraph/Small, Inter 400 14/20
              // ‑0.005em #7B7B7B.
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: TEXT_DIM,
              margin: 0,
              width: "100%",
              ...textAlign,
            }}
          >
            {body}
          </p>
        </div>
      </div>
    </CornerFrame>
  );
}

/* ─────────────────────────── 3. Your Impact ─────────────────────────── */
function YourImpactSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const items = [
    { title: t("impact1Title"), body: t("impact1Body"), iconSrc: ICON_IMPACT_1 },
    { title: t("impact2Title"), body: t("impact2Body"), iconSrc: ICON_IMPACT_2 },
    { title: t("impact3Title"), body: t("impact3Body"), iconSrc: ICON_IMPACT_3 },
    { title: t("impact4Title"), body: t("impact4Body"), iconSrc: ICON_IMPACT_4 },
  ];

  return (
    <CornerFrame>
      {/* Header — Figma "Group" 1317×68: heading + subtitle, gap 8. */}
      <div
        className="flex w-full flex-col items-center"
        style={{ gap: 8, padding: "32px 0 16px" }}
      >
        <SectionHeading>{t("impactHeading")}</SectionHeading>
        <Body className="text-center">{t("impactEyebrow")}</Body>
      </div>

      {/* Body — Figma "Body" 1317×289: row, justify-center,
          align-items flex-start, padding 16 40, gap 24. */}
      <div
        className="flex flex-col items-stretch justify-center sm:grid sm:grid-cols-2 md:grid-cols-4"
        style={{ gap: 24, padding: "16px 40px" }}
      >
        {items.map((it, i) => (
          <CornerFrame key={i}>
            {/* Form body — Figma 252×212 with padding 0 40, gap 16,
                items center. Outer 24 top/bottom mirrors the Figma
                top/bottom corner rows so the chamfered frame sits at
                a comfortable distance from the content. */}
            <div
              className="flex flex-col items-center"
              style={{ padding: "24px 40px", gap: 16 }}
            >
              <Image
                src={it.iconSrc}
                alt=""
                width={56}
                height={64}
                className="select-none"
                draggable={false}
              />
              {/* Frame 52 — 172×132, gap 4 between title and body. */}
              <div
                className="flex flex-col items-center"
                style={{ gap: 4, maxWidth: 172, width: "100%" }}
              >
                <h3
                  style={{
                    // Label/Medium — Inter 500 16/24 ‑0.01em white.
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: "24px",
                    letterSpacing: "-0.01em",
                    color: TEXT_STRONG,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    // Paragraph/Small — Inter 400 14/20 ‑0.005em #7B7B7B.
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: TEXT_DIM,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {it.body}
                </p>
              </div>
            </div>
          </CornerFrame>
        ))}
      </div>
    </CornerFrame>
  );
}

/* ─────────────────────────── 4. Open Issues ─────────────────────────── */
function OpenIssuesSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const cards = [0, 1, 2];
  return (
    <CornerFrame>
      <div className="flex w-full flex-col items-center" style={{ gap: 8, padding: "32px 0 16px" }}>
        <Eyebrow>{t("openEyebrow")}</Eyebrow>
        <SectionHeading>{t("openHeading")}</SectionHeading>
        <Body className="max-w-[442px] text-center">{t("openBody")}</Body>
      </div>
      <div className="grid grid-cols-1 gap-6 px-4 py-4 md:grid-cols-3 md:px-10">
        {cards.map((i) => (
          <CornerFrame key={i}>
            <OpenIssueCard
              pill={t("openPill")}
              title={t("openIssueTitle")}
              body={t("openIssueBody")}
              progress={t("openProgress")}
              supporters={t("openSupporters")}
              buttonLabel={t("openButton")}
              href="/open-issues"
            />
          </CornerFrame>
        ))}
      </div>
    </CornerFrame>
  );
}

function OpenIssueCard({
  pill,
  title,
  body,
  progress,
  supporters,
  buttonLabel,
  href,
}: {
  pill: string;
  title: string;
  body: string;
  progress: string;
  supporters: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-4 px-10 py-6">
      {/* Pill */}
      <div className="inline-flex items-center self-start">
        <span style={{ width: 8, height: 43, background: "#333333", clipPath: "polygon(100% 0,100% 100%,0 50%)" }} />
        <span
          className="inline-flex items-center justify-center px-2"
          style={{
            background: "#333333",
            height: 43,
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "16px",
            color: TEXT_STRONG,
          }}
        >
          {pill}
        </span>
        <span style={{ width: 8, height: 43, background: "#333333", clipPath: "polygon(0 0,0 100%,100% 50%)" }} />
      </div>

      {/* Thumbnail placeholder (Figma `Thumbnail` — image with white-8% border) */}
      <div
        className="w-full"
        style={{
          height: 98,
          background: "linear-gradient(135deg, #333 0%, #222 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
        }}
      />

      {/* Title + body */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <h3
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "-0.01em",
            color: TEXT_STRONG,
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "-0.01em",
            color: TEXT_DIM,
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 0, borderTop: `1px solid ${FRAME}` }} />

      {/* Progress + supporters */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: TEXT_DIM,
          }}
        >
          {progress}
        </span>
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: TEXT_DIM,
          }}
        >
          {supporters}
        </span>
      </div>

      <GoldButton href={href}>{buttonLabel}</GoldButton>
    </div>
  );
}

/* ─────────────────────────── 4. What we fund ─────────────────────────── */
function WhatWeFundSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  // Figma Frame 60 — row, align-items center, gap 24, width 1128
  // (4 × 264 + 3 × 24). Each Form is 264×104 with the chamfered frame:
  // Top 24 / Body 56 (padding 0 40, gap 8: icon 24 + label 24) /
  // Bottom 24.
  const items = [
    { label: t("payWriters"), icon: <WritingIcon /> },
    { label: t("produceVisuals"), icon: <ImageIcon /> },
    { label: t("publishIssue"), icon: <Book2Icon /> },
    { label: t("growCommunity"), icon: <UsersIcon /> },
  ];
  // Match the Your Impact body layout one-for-one (same outer width,
  // padding 16/40, gap 24, 4-up grid on md+) so the four card columns
  // align horizontally with the Your Impact columns above.
  return (
    <div
      className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      style={{ gap: 24, padding: "16px 40px" }}
    >
      {items.map((it, i) => (
        <CornerFrame key={i}>
          <div
            className="flex flex-col items-center"
            style={{
              // Body padding mirrors the top/bottom corner-row chrome
              // (24) + 40 L/R per Figma `Form` Body.
              padding: "24px 40px",
              gap: 8,
            }}
          >
            <IconInline>{it.icon}</IconInline>
            {/* Figma `Frame 52` — label wrapper. */}
            <div className="w-full" style={{ height: 24 }}>
              <p
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: "-0.01em",
                  color: TEXT_STRONG,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {it.label}
              </p>
            </div>
          </div>
        </CornerFrame>
      ))}
    </div>
  );
}

/* ─────────────────────────── Shared bits ─────────────────────────── */
/**
 * Thin wrapper around the shared `ChamferedFrame` so every section
 * card uses the same brand chamfered outline. The frame is rendered
 * as an `absolute inset-0` overlay, so the parent must be
 * `position: relative`.
 */
function CornerFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <ChamferedFrame borderColor={FRAME} />
      {children}
    </div>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: 56,
        height: 64,
        background: PANEL_BG,
        boxShadow: "inset 0px 1px 0px #333333",
        borderRadius: 8,
        color: ICON_TINT,
      }}
    >
      {children}
    </span>
  );
}

function IconInline({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24, color: ICON_TINT }}>
      {children}
    </span>
  );
}

function GoldButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-opacity hover:opacity-90"
      style={{
        padding: "8px 16px",
        backgroundColor: GOLD,
        boxShadow: "inset 0px 1px 0px rgba(255,255,255,0.4)",
        borderRadius: 8,
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        color: GOLD_TEXT,
        textDecoration: "none",
        height: 40,
      }}
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        color: EYEBROW,
        textShadow: "0px 1px 2px rgba(0,0,0,0.24)",
        margin: 0,
        textAlign: "center",
      }}
    >
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: 32,
        lineHeight: "40px",
        color: TEXT_STRONG,
        margin: 0,
        textAlign: "center",
      }}
    >
      {children}
    </h2>
  );
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        color: TEXT_MUTED,
        textShadow: "0px 1px 2px rgba(0,0,0,0.24)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

/* ─────────────────────────── inline icons (1.5px stroke #E8DDC0) ─────────────────────────── */
const STROKE = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

function WritingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...STROKE}>
      <path d="M16 4l4 4-12 12H4v-4L16 4zM14 6l4 4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...STROKE}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function Book2Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...STROKE}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...STROKE}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
