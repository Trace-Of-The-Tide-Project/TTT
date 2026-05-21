import { useTranslations } from "next-intl";
import { ContributionPageLayout } from "@/components/contribute/ContributionPageLayout";
import { OpenCallForm } from "@/components/open-call/OpenCallForm";

const SANS = "'Inter', var(--font-sans, sans-serif)";
const META_TEXT = "#A3A3A3";
const META_SHADOW = "0px 1px 2px rgba(0, 0, 0, 0.24)";
const TAG_GOLD = "#DBC99E";
const TAG_INK = "#332217";
const ICON_STROKE = "#7B7B7B";

function MetaDot() {
  return (
    <span
      aria-hidden
      style={{
        width: "4px",
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
        color: "rgba(255, 255, 255, 0.24)",
        textShadow: META_SHADOW,
      }}
    >
      ·
    </span>
  );
}

function MetaText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
        color: META_TEXT,
        textShadow: META_SHADOW,
      }}
    >
      {children}
    </span>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_STROKE}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.32))" }}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_STROKE}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.32))" }}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

export default function OpenCallPage() {
  const t = useTranslations("Dashboard.openCallPublic");

  // Article header — Figma "Title" frame: H4 title, then a Meta Data row
  // (Edition tag · Author · Date · Category), then the intro paragraphs.
  // Page-specific, so it's passed to the shared layout as a slot.
  const titleBlock = (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex flex-col items-start" style={{ gap: "12px" }}>
        <h1
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: "32px",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          British Restrict Jewish Immigration to Palestine
        </h1>

        {/* Meta Data */}
        <div className="flex flex-row flex-wrap items-center" style={{ gap: "8px" }}>
          {/* Edition tag — gold label with end-caps */}
          <span className="inline-flex items-center" style={{ height: "16px" }}>
            <span
              aria-hidden
              style={{ width: "8px", height: "16px", background: TAG_GOLD, boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.04)", transform: "scaleX(-1)" }}
            />
            <span className="inline-flex items-center justify-center" style={{ padding: "2px 0", height: "16px", background: TAG_GOLD }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: "11px",
                  lineHeight: "12px",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: TAG_INK,
                }}
              >
                Edition
              </span>
            </span>
            <span
              aria-hidden
              style={{ width: "8px", height: "16px", background: TAG_GOLD, boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.04)" }}
            />
          </span>

          <MetaDot />

          {/* Author — avatar + name */}
          <span className="inline-flex items-center" style={{ gap: "4px" }}>
            <span
              className="inline-flex items-center justify-center"
              style={{ width: "16px", height: "16px", borderRadius: "999px", background: TAG_GOLD, border: "1px solid rgba(0, 0, 0, 0.08)", boxSizing: "border-box" }}
            >
              <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "8.5px", lineHeight: "10px", color: TAG_INK }}>A</span>
            </span>
            <MetaText>Author</MetaText>
          </span>

          <MetaDot />

          {/* Date */}
          <span className="inline-flex items-center" style={{ gap: "4px" }}>
            <CalendarIcon />
            <MetaText>Date</MetaText>
          </span>

          <MetaDot />

          {/* Category */}
          <span className="inline-flex items-center" style={{ gap: "4px" }}>
            <FolderIcon />
            <MetaText>Category</MetaText>
          </span>
        </div>
      </div>

      {/* Intro paragraphs — Figma "Paragraph/Small", white */}
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          As Great Britain launched the Palestine campaign in 1917 during World War I, and its
          forces were close to conquering Jerusalem, it issued the Balfour Declaration that
          expressed its support for the establishment of a Jewish National Home in Palestine.
          Though Palestinians were relieved that the hardships of the war and the Ottoman rule
          (which had become increasingly unpopular in the years preceding the war) will be finally
          over, they realized at the same time that efforts toward Arab independence were being
          undermined in favor of a system of control that will be sanctioned by the League of
          Nations, will divide the Levant into five entities under British or French mandate, and
          will put, in particular, Palestine under a British mandate with the implementation of the
          Balfour declaration as an integral part of the latter.
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          Jewish immigration, though uneven, significantly increased Palestine&apos;s Jewish
          population, and Zionist institutions grew stronger and increasingly entrenched within the
          Mandate&apos;s governing structures. As Palestinian political leaders sought to engage the
          British administration, popular forms of resistance periodically erupted into violent
          clashes, the most significant being the al-Buraq Uprising of 1929 and widespread
          anti-British demonstrations in 1933. By the end of 1935, Palestine stood poised on the
          brink of full-blown revolt.
        </p>
      </div>
    </div>
  );

  return (
    <ContributionPageLayout
      titleBlock={titleBlock}
      support={{
        title: t("supportTitle"),
        description: t("supportDescription"),
        ctaLabel: t("supportCta"),
        ctaHref: "/contribute",
      }}
    >
      <OpenCallForm />
    </ContributionPageLayout>
  );
}
