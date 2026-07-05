"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { SupportIssueModal } from "@/components/open-issues/SupportIssueModal";
import type { MagazineIssue } from "@/services/magazine-issues.service";

// All colors map to --tott-* theme tokens so the card swaps cleanly
// between dark and light, matching the Open Issues block in the
// Support Hertz tab.
const ACCENT = "var(--tott-accent-gold)";
const ACCENT_TEXT = "var(--tott-auth-btn-text)";
const FRAME = "var(--tott-card-border)";
const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";

const PLACEHOLDER_IMAGE = "/images/home/support-issue-thumbnail.svg";

/** Card view-model — only the fields the grid renders. Funding stats
 * stay optional: until the backend exposes a public per-issue stats
 * endpoint we leave them undefined and the card hides the progress
 * bar entirely (rather than showing a misleading 24% on every card). */
type IssueCard = {
  id: string;
  prefix: string;
  title: string;
  author: string;
  description: string;
  image: string;
  funding?: {
    raised: number;
    goal: number;
    supporters: number;
  };
  badge?: "almost";
};

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function mapIssueToCard(it: MagazineIssue): IssueCard {
  const editionLabel = it.edition ? `Issue ${it.edition}:` : "Issue:";
  return {
    id: it.id,
    prefix: editionLabel,
    title: it.title || "",
    // Backend doesn't yet expose a per-issue "lead author/editor"
    // field, so leave author blank — the modal still receives it as
    // an empty string and the title rendering tolerates that.
    author: "",
    description: (it.excerpt || it.description || "").trim(),
    image: isValidImageUrl(it.cover_image) ? it.cover_image! : PLACEHOLDER_IMAGE,
  };
}

export function OpenIssuesContent({
  issues: rawIssues = [],
}: {
  issues?: MagazineIssue[];
}) {
  const t = useTranslations("OpenIssues");
  const [activeIssue, setActiveIssue] = useState<IssueCard | null>(null);
  const issues = useMemo(
    () => rawIssues.map(mapIssueToCard).filter((c) => c.title),
    [rawIssues],
  );

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

        {/* Grid — empty-state row spans all columns. */}
        {issues.length === 0 ? (
          <p
            className="mt-12 text-center"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "20px",
              color: TEXT_MUTED,
            }}
          >
            {t("emptyState")}
          </p>
        ) : (
          <motion.ul
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              gap: "24px",
              padding: 0,
              listStyle: "none",
            }}
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {issues.map((issue) => (
              <motion.li
                key={issue.id}
                variants={staggerChild}
                transition={springs.gentle}
                whileHover={{ y: -4 }}
              >
                <IssueCardView
                  issue={issue}
                  onSupport={() => setActiveIssue(issue)}
                  badgeAlmostFunded={t("badgeAlmostFunded")}
                  raisedOfLabel={t("raisedOf")}
                  supportersLabel={
                    issue.funding
                      ? t("supporters", { count: issue.funding.supporters })
                      : ""
                  }
                  ctaLabel={t("supportCta")}
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <SupportIssueModal
        open={activeIssue != null}
        onClose={() => setActiveIssue(null)}
        issue={
          activeIssue
            ? {
                id: activeIssue.id,
                title: activeIssue.title,
                author: activeIssue.author,
              }
            : { title: "", author: "" }
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
  const pct = issue.funding
    ? Math.min(100, Math.round((issue.funding.raised / issue.funding.goal) * 100))
    : 0;

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
        {/* Pill chip — only renders when we have real funding data AND
            the issue is past the "almost funded" threshold. */}
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

          {issue.description ? (
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
          ) : null}

          {/* Funding bar + numbers only render when backend exposes
              real stats. Until then the card stays informational
              instead of showing a fake 24% on every card. */}
          {issue.funding ? (
            <>
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
                  {formatUsd(issue.funding.raised)}{" "}
                  <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                    {raisedOfLabel} {formatUsd(issue.funding.goal)}
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
            </>
          ) : null}
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
