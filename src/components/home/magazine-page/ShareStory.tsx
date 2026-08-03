import HexBackground from "@/components/ui/HexBackground";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { PageButton } from "./InnerSectionCards";

/**
 * Closing CTA (Figma `Share your story`, restyled for the editorial pass):
 * hex icon, display heading, standfirst, gold button, decorative hex
 * lattice backdrop + soft radial glow so it reads as a deliberate closing
 * beat rather than a repeat of the mid-page action tiles it replaces.
 */
export function ShareStory({
  icon,
  heading,
  standfirst,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ReactNode;
  heading: string;
  standfirst: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div aria-hidden className="absolute inset-0 opacity-40">
        <HexBackground />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 40%, color-mix(in srgb, var(--tott-accent-gold) 10%, transparent), transparent 70%)",
        }}
      />
      <RevealOnScroll className="relative mx-auto flex max-w-[560px] flex-col items-center gap-6 px-6 text-center">
        <div
          className="flex h-[88px] w-20 items-center justify-center text-[var(--tott-accent-gold-focus)]"
          style={{
            clipPath: TOTT_AUTH_HEX_CLIP_PATH,
            background: "color-mix(in srgb, white 4%, transparent)",
            boxShadow: "inset 0 -2px 4px color-mix(in srgb, var(--tott-accent-gold) 8%, transparent)",
          }}
        >
          {icon}
        </div>
        <div>
          <h2
            className="font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-[36px]"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            {heading}
          </h2>
          <p className="mt-3 text-sm leading-5 text-[var(--tott-salt)] sm:text-base">
            {standfirst}
          </p>
        </div>
        <PageButton href={ctaHref}>{ctaLabel}</PageButton>
      </RevealOnScroll>
    </section>
  );
}
