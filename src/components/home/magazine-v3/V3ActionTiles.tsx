import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";

export type ActionTile = {
  id: string;
  icon: ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
};

/**
 * The 3 CTA tiles (Join Collective / Send Gift / Share Story). Figma
 * `Inner Section Card`, 360×212 each, 3-up ≥1024px, stacked below (Figma is
 * desktop-only — this breakpoint is my derivation).
 */
export function V3ActionTiles({ tiles }: { tiles: ActionTile[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 sm:px-10 md:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.id} className="flex flex-col items-center gap-6 px-8 text-center">
          <div
            className="flex h-16 w-14 items-center justify-center text-[var(--tott-accent-gold-focus)]"
            style={{
              clipPath: TOTT_AUTH_HEX_CLIP_PATH,
              background: "rgba(255,255,255,0.04)",
              boxShadow: "inset 0 -2px 4px rgba(201,169,110,0.08)",
            }}
          >
            {tile.icon}
          </div>
          <div className="flex flex-col items-center gap-2">
            <p
              className="font-['IBM_Plex_Sans'] text-base font-medium text-[var(--tott-accent-gold-focus)]"
            >
              {tile.title}
            </p>
            <p className="text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]">
              {tile.body}
            </p>
          </div>
          <Link
            href={tile.href}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--tott-gold-chip-ink)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--tott-accent-gold-focus)" }}
          >
            {tile.ctaLabel}
          </Link>
        </div>
      ))}
    </div>
  );
}
