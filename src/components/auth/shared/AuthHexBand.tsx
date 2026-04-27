import Image from "next/image";

type AuthHexBandProps = {
  /** Override the band height. Default mirrors the SVG's natural ratio at 1440 wide. */
  heightPx?: number;
  className?: string;
};

/**
 * Decorative hex-grid band that anchors the top of every auth page.
 * Backed by `public/auth/hex-band.svg` (a horizontally-tiled hex pattern with a
 * gold radial highlight over a dark grey gradient).
 *
 * Sized to span the viewport width and fade against the page background. Pure
 * CSS — no JS — so it can render statically inside server components.
 */
export function AuthHexBand({ heightPx = 220, className }: AuthHexBandProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden ${className ?? ""}`}
      style={{ height: heightPx }}
    >
      <Image
        src="/auth/hex-band.svg"
        alt=""
        width={1440}
        height={190}
        priority
        className="block h-full w-full select-none object-cover"
      />
    </div>
  );
}
