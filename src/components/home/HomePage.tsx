import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { ArchiveFeed } from "./ArchiveFeed";
import { Voices } from "./Voices";
import { Editions } from "./Editions";

/**
 * Homepage-rebuild composition (Sessions 0–6). One import line per section;
 * sessions replace the CONTENTS of their section directory, never this file.
 * Lenis smooth scroll is scoped here so other routes keep native scroll.
 * NOTE: no CSS scroll-snap anywhere on this page — it conflicts with Lenis.
 */
export function HomePage() {
  return (
    <SmoothScroll>
      <main className="bg-[var(--tott-home-surface)]">
        <Hero />
        <Pillars />
        <ArchiveFeed />
        <Voices />
        <Editions />
      </main>
    </SmoothScroll>
  );
}
