"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { SupportIssueModal } from "@/components/open-issues/SupportIssueModal";

// All colors map to --tott-* theme tokens so the card swaps cleanly
// between dark and light, matching the Open Issues block in the
// Support Hertz tab.
const ACCENT = "var(--tott-accent-gold)";
const ACCENT_TEXT = "var(--tott-auth-btn-text)";
const FRAME = "var(--tott-card-border)";
const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";

const PLACEHOLDER_IMAGE = "/images/home/support-issue-thumbnail.svg";

type IssueCard = {
  id: string;
  prefix: string;
  title: string;
  author: string;
  description: string;
  raised: number;
  goal: number;
  supporters: number;
  image: string;
  badge?: string;
};

const ISSUES: IssueCard[] = [
  {
    id: "issue-09",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Faiz Berghouli",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
  {
    id: "issue-09-2",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Hala Younes",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
  {
    id: "issue-09-3",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Omar Khalidi",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
  {
    id: "issue-10",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Layla Saab",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
  {
    id: "issue-10-2",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Nadia Rahim",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
  {
    id: "issue-10-3",
    prefix: "Issue 09:",
    title: "Identity & Borders",
    author: "Karim Aboud",
    description:
      "Exploring the fluid boundaries of belonging, displacement, and cultural memory across continents…",
    raised: 1200,
    goal: 5000,
    supporters: 42,
    image: PLACEHOLDER_IMAGE,
    badge: "almost",
  },
];

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function OpenIssuesContent() {
  const t = useTranslations("OpenIssues");
  const [activeIssue, setActiveIssue] = useState<IssueCard | null>(null);
  const issues = useMemo(() => ISSUES, []);

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
        className="relative mx-auto w-full px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 1280px)" }}
      >
        {/* Hero */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{
            width: "100%",
            maxWidth: "640px",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {t("eyebrow")}
          </span>
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "32px",
              lineHeight: "40px",
              color: TEXT_STRONG,
              margin: 0,
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: TEXT_MUTED,
              margin: 0,
            }}
          >
            {t("subtitle")}
          </p>
        </header>

        {/* Grid */}
        <ul
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            gap: "24px",
            padding: 0,
            listStyle: "none",
          }}
        >
          {issues.map((issue) => (
            <li key={issue.id}>
              <IssueCardView
                issue={issue}
                onSupport={() => setActiveIssue(issue)}
                badgeAlmostFunded={t("badgeAlmostFunded")}
                raisedOfLabel={t("raisedOf")}
                supportersLabel={t("supporters", {
                  count: issue.supporters,
                })}
                ctaLabel={t("supportCta")}
              />
            </li>
          ))}
        </ul>
      </div>

      <SupportIssueModal
        open={activeIssue != null}
        onClose={() => setActiveIssue(null)}
        issue={
          activeIssue ?? { title: "", author: "" }
        }
      />
    </main>
  );
}

function IssueCardView({
  issue,
  onSupport,
  badgeAlmostFunded,
  raisedOfLabel,
  supportersLabel,
  ctaLabel,
}: {
  issue: IssueCard;
  onSupport: () => void;
  badgeAlmostFunded: string;
  raisedOfLabel: string;
  supportersLabel: string;
  ctaLabel: string;
}) {
  const pct = Math.min(100, Math.round((issue.raised / issue.goal) * 100));

  // Card layout mirrors `OpenIssueCard` in `MagazineSupportV2`:
  // ChamferedFrame outline → pill chip → silk thumbnail → Frame 52
  // (title + body + gradient progress bar + funding row) → gold CTA.
  return (
    <div className="relative h-full w-full">
      <ChamferedFrame borderColor={FRAME} />
      <div
        className="flex h-full w-full flex-col items-start"
        style={{ padding: "24px 40px", gap: 16 }}
      >
        {/* Pill chip — Figma `Pills` rounded #333 badge. */}
        {issue.badge === "almost" ? (
          <span
            className="inline-flex items-center justify-center self-start"
            style={{
              height: 43,
              padding: "4px 12px",
              backgroundColor: FRAME,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              borderRadius: 8,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "16px",
              color: TEXT_STRONG,
              whiteSpace: "nowrap",
            }}
          >
            {badgeAlmostFunded}
          </span>
        ) : null}

        {/* Thumbnail — 318×98 with rounded corners + 1px white-8% stroke. */}
        <div className="relative w-full" style={{ aspectRatio: "318 / 98" }}>
          <Image
            src={issue.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="select-none object-cover"
            draggable={false}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Frame 52 — title + body + progress bar + funding row, gap 8. */}
        <div className="flex w-full flex-col" style={{ gap: 8 }}>
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
            <span style={{ color: ACCENT }}>{issue.prefix}</span> {issue.title}
          </h3>

          <p
            className="line-clamp-3"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: TEXT_MUTED,
              margin: 0,
            }}
          >
            {issue.description}
          </p>

          {/* Progress bar — 3px grey track + gold linear-gradient fill. */}
          <div
            aria-hidden
            className="relative w-full"
            style={{ height: 3, backgroundColor: FRAME }}
          >
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, #34281A 0%, #AF7E47 100%)",
              }}
            />
          </div>

          {/* Funding row — raised/goal + supporters split. */}
          <div className="flex w-full items-center justify-between">
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: TEXT_MUTED,
              }}
            >
              {formatUsd(issue.raised)}{" "}
              <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                {raisedOfLabel} {formatUsd(issue.goal)}
              </span>
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: TEXT_MUTED,
              }}
            >
              {supportersLabel}
            </span>
          </div>
        </div>

        {/* Gold CTA — same spec as the Support tab's Open Issues button. */}
        <button
          type="button"
          onClick={onSupport}
          className="inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-opacity hover:opacity-90"
          style={{
            minWidth: 116,
            height: 40,
            padding: "8px 16px",
            backgroundColor: ACCENT,
            boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
            borderRadius: 8,
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: ACCENT_TEXT,
            border: "none",
            cursor: "pointer",
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
