"use client";

import { useState, type ReactNode } from "react";
import { RichContent } from "@/components/ui/rich-text/RichContent";

type TimelineEntry = {
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  /** Stop photo from API — if missing, no image block is shown */
  imageUrl?: string | null;
};

type TripTimelineProps = {
  entries: TimelineEntry[];
  /** When set, replaces the decorative map in the Route map tab (e.g. real Leaflet map). */
  mapSlot?: ReactNode;
};

function CalendarSmall() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockSmall() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PinSmall() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="10" r="3" />
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
    </svg>
  );
}

export function TripTimeline({ entries, mapSlot }: TripTimelineProps) {
  const [tab, setTab] = useState<"timeline" | "map">("timeline");

  return (
    <div>
      {/* Tabs */}
      <div
        className="mb-8 flex overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--tott-card-border)" }}
      >
        <button
          type="button"
          onClick={() => setTab("timeline")}
          className={`flex-1 cursor-pointer py-3 text-center text-sm font-medium transition-colors ${
            tab === "timeline"
              ? "bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]"
              : "bg-transparent text-[color:var(--tott-home-text-muted)] hover:text-foreground"
          }`}
        >
          Trip timeline
        </button>
        <button
          type="button"
          onClick={() => setTab("map")}
          className={`flex-1 cursor-pointer py-3 text-center text-sm font-medium transition-colors ${
            tab === "map"
              ? "bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]"
              : "bg-transparent text-[color:var(--tott-home-text-muted)] hover:text-foreground"
          }`}
        >
          Route map
        </button>
      </div>

      {tab === "timeline" && (
        <div>
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-5">
              {/* Left rail: line + number + line */}
              <div className="flex w-10 shrink-0 flex-col items-center">
                {/* Line above + gap (skip for first entry) */}
                {i > 0 && (
                  <>
                    <div
                      className="w-px border-l-2 border-dashed border-[color:var(--tott-card-border)]"
                      style={{ height: "3rem" }}
                      aria-hidden
                    />
                    <div className="h-3" aria-hidden />
                  </>
                )}
                {/* Number badge */}
                <div
                  className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--tott-card-border)] text-sm font-medium text-[color:var(--tott-panel-text)]"
                  style={{ backgroundColor: "var(--tott-well-bg)" }}
                >
                  {i + 1}
                </div>
                {/* Gap */}
                <div className="h-3" aria-hidden />
                {/* Line below — stretches to fill remaining height */}
                <div className="w-px flex-1 border-l-2 border-dashed border-[color:var(--tott-card-border)]" aria-hidden />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-4" style={{ paddingTop: i === 0 ? "0" : "3rem" }}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[color:var(--tott-home-text-muted)]">
                    <span className="flex items-center gap-1">
                      <CalendarSmall />
                      {entry.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockSmall />
                      {entry.time}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-[color:var(--tott-home-text-muted)]">
                  <RichContent html={entry.description} variant="inline" />
                </p>

                {entry.imageUrl?.trim() ? (
                  <div className="relative mt-4 h-40 w-full max-w-2xl overflow-hidden rounded-lg sm:h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element -- trip stop URLs from API */}
                    <img
                      src={entry.imageUrl.trim()}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                {entry.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[color:var(--tott-home-text-muted)]">
                    <PinSmall />
                    {entry.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "map" &&
        (mapSlot ?? (
          <div className="relative overflow-hidden rounded-xl border border-[color:var(--tott-card-border)]">
            <div
              className="relative h-72 w-full sm:h-80"
              style={{
                backgroundColor: "#2a2a2a",
                backgroundImage: `
                linear-gradient(rgba(60,60,60,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(60,60,60,0.3) 1px, transparent 1px),
                linear-gradient(rgba(60,60,60,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(60,60,60,0.15) 1px, transparent 1px)
              `,
                backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
              }}
            >
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 800 320"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
              >
                <path
                  d="M600 160 Q560 160 500 190 Q440 220 400 210 Q360 200 320 190 Q280 180 240 170 Q200 160 180 130"
                  stroke="#CBA158"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="600" cy="160" r="14" fill="#CBA158" />
                <text
                  x="600"
                  y="165"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  fontSize="14"
                  fontWeight="600"
                >
                  1
                </text>
                <circle cx="420" cy="205" r="14" fill="#CBA158" />
                <text
                  x="420"
                  y="210"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  fontSize="14"
                  fontWeight="600"
                >
                  2
                </text>
                <circle cx="280" cy="180" r="14" fill="#CBA158" />
                <text
                  x="280"
                  y="185"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  fontSize="14"
                  fontWeight="600"
                >
                  3
                </text>
                <circle cx="180" cy="130" r="14" fill="#CBA158" />
                <text
                  x="180"
                  y="135"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  fontSize="14"
                  fontWeight="600"
                >
                  4
                </text>
              </svg>
            </div>
          </div>
        ))}
    </div>
  );
}
