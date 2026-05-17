"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { SupportIssueModal } from "@/components/open-issues/SupportIssueModal";

const ACCENT = "#C9A96E";
const ACCENT_TEXT = "#332217";
const FIELD_BG = "#262626";
const FIELD_BORDER = "#333333";
const LABEL_COLOR = "#FFFFFF";
const HELPER_COLOR = "#A3A3A3";

const PLACEHOLDER_IMAGE = "/images/home/Image-2.png";

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
              color: LABEL_COLOR,
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
              color: HELPER_COLOR,
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

  return (
    <article
      className="flex h-full w-full flex-col"
      style={{
        padding: "16px",
        gap: "12px",
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: "12px",
      }}
    >
      {/* Image with badge */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "256 / 120",
          borderRadius: "8px",
          backgroundColor: "var(--tott-panel-bg, #121212)",
        }}
      >
        <Image
          src={issue.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="select-none object-cover"
          draggable={false}
        />
        {issue.badge === "almost" ? (
          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: ACCENT,
              boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
              color: ACCENT_TEXT,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "11px",
              lineHeight: "16px",
              letterSpacing: "-0.005em",
            }}
          >
            {badgeAlmostFunded}
          </span>
        ) : null}
      </div>

      {/* Title — prefix in gold + main in white */}
      <h3
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
          color: LABEL_COLOR,
          margin: 0,
        }}
      >
        <span style={{ color: ACCENT }}>{issue.prefix}</span> {issue.title}
      </h3>

      {/* Description */}
      <p
        className="line-clamp-3"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "13px",
          lineHeight: "18px",
          letterSpacing: "-0.005em",
          color: HELPER_COLOR,
          margin: 0,
          flex: 1,
        }}
      >
        {issue.description}
      </p>

      {/* Funding row */}
      <div
        className="flex flex-row items-center justify-between"
        style={{ gap: "8px" }}
      >
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "13px",
            lineHeight: "18px",
            color: LABEL_COLOR,
          }}
        >
          {formatUsd(issue.raised)}{" "}
          <span style={{ color: HELPER_COLOR, fontWeight: 400 }}>
            {raisedOfLabel} {formatUsd(issue.goal)}
          </span>
        </span>
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: HELPER_COLOR,
          }}
        >
          {supportersLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div
        aria-hidden
        style={{
          height: "4px",
          width: "100%",
          backgroundColor: FIELD_BORDER,
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: ACCENT,
            borderRadius: "999px",
          }}
        />
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onSupport}
        className="w-full transition-opacity hover:opacity-90"
        style={{
          height: "40px",
          padding: "8px 16px",
          borderRadius: "8px",
          backgroundColor: ACCENT,
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: ACCENT_TEXT,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          textAlign: "center",
          border: "none",
          cursor: "pointer",
        }}
      >
        {ctaLabel}
      </button>
    </article>
  );
}
