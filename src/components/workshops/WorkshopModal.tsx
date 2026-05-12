"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Fired when the user clicks "Apply Now" — the host typically
   * closes this modal and opens the JoinWorkshopModal form. */
  onApply: () => void;
  title: string;
  body: string;
  chips: string[];
};

/** Workshop detail modal — Figma "Modal-4" comp. Three-band layout:
 *   • Header: gold-gradient title + chips + close, wrapped in a
 *     blurred translucent "Trip Info" overlay so it lifts off the
 *     band background slightly.
 *   • Body: three sections (Workshop Description, What You'll Do,
 *     What You'll Gain), each with a gold-gradient h3 and either a
 *     paragraph or a gold-check checklist. Inner 24px indent
 *     mirrors the Figma "About this event" frame.
 *   • Footer: wide gold "Apply Now" + small dark "Close".
 *
 * Sizes use fluid clamp() so the modal stays at the Figma 757px
 * intrinsic on standard laptops, shrinks on mobile, and scales up
 * (modestly) on huge displays. All colors come from CSS vars. */
export function WorkshopModal({
  open,
  onClose,
  onApply,
  title,
  body,
  chips,
}: Props) {
  const t = useTranslations("Home.workshops.modal");
  const titleId = useId();
  const descId = useId();

  const doItems = t.raw("doItems") as string[];
  const gainItems = t.raw("gainItems") as string[];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
        aria-label={t("close")}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--tott-panel-bg) 55%, transparent)",
        }}
      />

      <div
        className="relative mx-4 flex w-full flex-col items-stretch"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        style={{
          // Caps at Figma 757px on laptop; scales modestly on huge
          // screens. min() keeps it within the viewport on mobile.
          maxWidth: "min(95vw, clamp(640px, 50vw + 4rem, 1100px))",
          maxHeight: "calc(100vh - 32px)",
          backgroundColor: "var(--tott-home-surface)",
          border: "1px solid var(--tott-card-border)",
          borderRadius: "20px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* ── Header band ─────────────────────────────────────── */}
        <div
          className="flex flex-row items-center"
          style={{
            padding: "clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(16px, 1vw + 0.4rem, 32px)",
            borderBottom: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-home-surface)",
          }}
        >
          {/* "Trip Info" translucent-gradient wrapper per Figma —
              top-to-bottom fade of the page surface with backdrop
              blur, lifting the title block off the band slightly. */}
          <div
            className="flex flex-1 flex-col"
            style={{
              gap: "clamp(12px, 0.6vw + 0.4rem, 24px)",
              minWidth: 0,
              background:
                "linear-gradient(0deg, color-mix(in srgb, var(--tott-home-surface) 64%, transparent) 0%, color-mix(in srgb, var(--tott-home-surface) 0%, transparent) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <h2
              id={titleId}
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1rem, 0.45vw + 0.55rem, 1.75rem)",
                lineHeight: 1.5,
                margin: 0,
                textShadow:
                  "0px 1px 1px color-mix(in srgb, var(--tott-panel-bg) 24%, transparent)",
              }}
            >
              <FirstWordGold raw={`${title}...`} />
            </h2>
            <div
              className="flex flex-wrap items-center"
              style={{ gap: "clamp(4px, 0.2vw, 12px)" }}
            >
              {chips.map((c, i) => (
                <span
                  key={c}
                  className="inline-flex items-center"
                  style={{ gap: "clamp(4px, 0.2vw, 12px)" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "clamp(24px, 0.5vw + 0.9rem, 40px)",
                      padding:
                        "clamp(4px, 0.2vw, 12px) clamp(8px, 0.35vw + 0.3rem, 20px)",
                      borderRadius: "6px",
                      backgroundColor: "var(--tott-card-border)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      color: "var(--tott-home-text-strong)",
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "clamp(0.75rem, 0.25vw + 0.45rem, 1.125rem)",
                      lineHeight: 1.4,
                    }}
                  >
                    {c}
                  </span>
                  {i < chips.length - 1 ? (
                    <span
                      aria-hidden
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                        lineHeight: 1.4,
                        letterSpacing: "-0.005em",
                        color: "var(--tott-home-text-muted)",
                      }}
                    >
                      .
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 transition-opacity hover:opacity-80"
            style={{
              width: "clamp(24px, 0.4vw + 1rem, 40px)",
              height: "clamp(24px, 0.4vw + 1rem, 40px)",
              padding: "4px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              color: "var(--tott-home-text-strong)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="66%"
              height="66%"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* ── Body — scrollable when content overflows ──────── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            padding:
              "clamp(20px, 1vw + 0.6rem, 40px) clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(20px, 1vw + 0.6rem, 40px)",
            backgroundColor: "var(--tott-home-surface)",
            flex: "1 1 auto",
          }}
        >
          <Section heading={t("descriptionHeading")}>
            <p
              id={descId}
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                lineHeight: 1.45,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-strong)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {body}
            </p>
          </Section>

          <Section heading={t("doHeading")}>
            <Checklist items={doItems} />
          </Section>

          <Section heading={t("gainHeading")}>
            <Checklist items={gainItems} />
          </Section>
        </div>

        {/* ── Footer band ─────────────────────────────────────── */}
        <div
          className="flex flex-row items-center justify-end"
          style={{
            padding: "clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(12px, 0.4vw + 0.3rem, 20px)",
            borderTop: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-home-surface)",
          }}
        >
          <button
            type="button"
            onClick={onApply}
            className="flex-1 transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 0.7vw + 1.5rem, 64px)",
              padding:
                "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(16px, 0.5vw + 0.5rem, 32px)",
              borderRadius: "8px",
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow:
                "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
              color: "var(--tott-auth-btn-text)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("apply")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 0.7vw + 1.5rem, 64px)",
              padding:
                "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(16px, 0.5vw + 0.5rem, 32px)",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow:
                "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Helpers ──────────────────────────────────────────────────

/** One body section — gold-gradient h3 with the matching Figma
 * inner 24px indent. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col"
      style={{
        gap: "clamp(8px, 0.4vw + 0.3rem, 20px)",
        // Figma "About this event" frame has padding: 0 24px so
        // each section's content indents 24px from the body
        // padding edge. Scales gently.
        padding: "0 clamp(16px, 0.8vw + 0.4rem, 32px)",
      }}
    >
      <h3
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "clamp(1rem, 0.5vw + 0.6rem, 1.75rem)",
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        <FirstWordGold raw={heading} />
      </h3>
      {children}
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul
      className="flex flex-col"
      style={{
        gap: "clamp(12px, 0.6vw + 0.4rem, 24px)",
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {items.map((it) => (
        <li
          key={it}
          className="flex flex-row items-center"
          style={{ gap: "clamp(8px, 0.4vw + 0.2rem, 16px)" }}
        >
          <span
            aria-hidden
            className="inline-flex shrink-0 items-center justify-center"
            style={{
              width: "clamp(20px, 0.5vw + 0.85rem, 32px)",
              height: "clamp(20px, 0.5vw + 0.85rem, 32px)",
              color: "var(--tott-magazine-btn-bg)",
              filter:
                "drop-shadow(0px 1px 2px color-mix(in srgb, var(--tott-panel-bg) 32%, transparent))",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              // Figma list-item Label: 16px/20px Inter 400 with
              // -0.01em tracking. Scales fluidly up on big screens.
              fontSize: "clamp(0.9375rem, 0.4vw + 0.5rem, 1.5rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              textShadow:
                "0px 1px 2px color-mix(in srgb, var(--tott-panel-bg) 24%, transparent)",
            }}
          >
            {it}
          </span>
        </li>
      ))}
    </ul>
  );
}
