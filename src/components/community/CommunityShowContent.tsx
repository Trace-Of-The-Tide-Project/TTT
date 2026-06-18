"use client";

import HexBackground from "@/components/ui/HexBackground";
import { theme } from "@/lib/theme";
import { type WriterProfile } from "@/services/writers.service";
import { type OpenCallListItem } from "@/services/open-calls.service";
import { CommunityHero } from "./CommunityHero";
import { CommunityStats } from "./CommunityStats";
import { CommunityWriters } from "./CommunityWriters";
import { CommunityOpenCalls } from "./CommunityOpenCalls";
import { CommunityGuidelines } from "./CommunityGuidelines";
import { CommunityCta } from "./CommunityCta";

export function CommunityShowContent({
  featuredWriters,
  openCalls,
  guidelines,
}: {
  featuredWriters: WriterProfile[];
  openCalls: OpenCallListItem[];
  guidelines: string[];
}) {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20 sm:px-10 sm:pt-28">
        <CommunityHero />

        <CommunityStats
          writers={featuredWriters.length}
          openCalls={openCalls.length}
          guidelines={guidelines.length}
        />

        {featuredWriters.length > 0 ? (
          <CommunityWriters writers={featuredWriters} />
        ) : null}

        {openCalls.length > 0 ? (
          <CommunityOpenCalls openCalls={openCalls} />
        ) : null}

        {guidelines.length > 0 ? (
          <CommunityGuidelines guidelines={guidelines} />
        ) : null}

        <CommunityCta />
      </div>
    </main>
  );
}
