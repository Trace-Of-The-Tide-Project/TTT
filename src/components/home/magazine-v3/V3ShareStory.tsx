import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";

/**
 * Bottom CTA (Figma `Share your story`): hex icon, heading, standfirst, gold
 * button, decorative hex lattice backdrop. Reuses `HexBackground` (stroked
 * lattice, no props) instead of the bespoke 1232×294 vector Figma exported.
 */
export function V3ShareStory({
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
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 opacity-40">
        <HexBackground />
      </div>
      <div className="relative mx-auto flex max-w-[560px] flex-col items-center gap-6 px-6 text-center">
        <div
          className="flex h-[88px] w-20 items-center justify-center text-[var(--tott-accent-gold-focus)]"
          style={{
            clipPath: TOTT_AUTH_HEX_CLIP_PATH,
            background: "rgba(255,255,255,0.04)",
            boxShadow: "inset 0 -2px 4px rgba(201,169,110,0.08)",
          }}
        >
          {icon}
        </div>
        <div>
          <h2 className="font-['IBM_Plex_Sans'] text-2xl font-medium text-[var(--tott-home-text-warm)] sm:text-[32px]">
            {heading}
          </h2>
          <p className="mt-3 text-sm leading-5 text-[var(--tott-salt)] sm:text-base">
            {standfirst}
          </p>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-medium text-[var(--tott-gold-chip-ink)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--tott-accent-gold-focus)" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
