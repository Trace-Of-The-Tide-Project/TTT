import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { dirFor } from "@/i18n/dir";
import { V3HeroSlider } from "./V3Hero";
import type { HeroSlide } from "./V3Hero";

export type PhilosophyBeat = { title: string; body: string };

/**
 * Storytelling section describing the publication: alternating image/text
 * beats (timeline feel via a vertical gold spine on wide screens), ending
 * with the editorial board strip (moved here from its own top-level
 * section — the board is part of the magazine's identity/philosophy, not a
 * separate content feed). Each beat reveals independently on scroll.
 */
export function V3Philosophy({
  title,
  beats,
  boardHeading,
  boardSlides,
  carouselPrevLabel,
  carouselNextLabel,
  locale,
}: {
  title: string;
  beats: PhilosophyBeat[];
  boardHeading?: string;
  boardSlides: HeroSlide[];
  carouselPrevLabel: string;
  carouselNextLabel: string;
  locale: string;
}) {
  return (
    <section id="philosophy" aria-labelledby="philosophy-heading" className="py-16">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <h2
          id="philosophy-heading"
          className="font-display text-center text-3xl text-[var(--tott-home-text-strong)] sm:text-4xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {title}
        </h2>

        <div className="relative mt-14 flex flex-col gap-14 ps-8 sm:ps-10">
          <span
            aria-hidden
            className="absolute bottom-4 top-2 start-0 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--tott-card-border) 10%, var(--tott-card-border) 90%, transparent)",
            }}
          />
          {beats.map((beat, i) => (
            <RevealOnScroll key={i} className="relative">
              <span
                aria-hidden
                className="absolute top-2 -start-8 h-2 w-2 rounded-full sm:-start-10"
                style={{ backgroundColor: "var(--tott-gold-muted)" }}
              />
              <h3 className="font-display text-xl text-[var(--tott-home-text-warm)]">{beat.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-[var(--tott-text-secondary-soft)]">
                {beat.body}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {boardSlides.length > 0 ? (
        <div className="mt-16">
          <V3HeroSlider
            heading={boardHeading}
            slides={boardSlides}
            prevLabel={carouselPrevLabel}
            nextLabel={carouselNextLabel}
            isRtl={dirFor(locale) === "rtl"}
          />
        </div>
      ) : null}
    </section>
  );
}
