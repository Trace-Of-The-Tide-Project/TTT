type AuthCardFrameProps = {
  children: React.ReactNode;
  className?: string;
  /** Tailwind max-width class for the wrapper. */
  maxWidthClass?: string;
  /** Override the container's minimum height (px). */
  minHeightPx?: number;
  /** Size of the diagonal corner cut (px). */
  chamferPx?: number;
  /** Override the default inner padding classes. */
  bodyClassName?: string;
};

const DEFAULT_BODY_PADDING = "px-8 py-12 sm:px-12 sm:py-14 md:px-16";

/** Builds the 8-vertex polygon for a rectangle with chamfered (45°) corners. */
function buildChamferClipPath(chamfer: number) {
  return [
    `${chamfer}px 0`,
    `calc(100% - ${chamfer}px) 0`,
    `100% ${chamfer}px`,
    `100% calc(100% - ${chamfer}px)`,
    `calc(100% - ${chamfer}px) 100%`,
    `${chamfer}px 100%`,
    `0 calc(100% - ${chamfer}px)`,
    `0 ${chamfer}px`,
  ].join(", ");
}

/**
 * Rectangular auth card with **chamfered** (45°) corners.
 *
 * Implementation:
 *  - Outer layer is filled with the border colour (`white/10`) and clipped
 *    to the chamfered shape.
 *  - Inner layer is inset by 1px, filled with the page background `#1E1E1E`,
 *    and clipped to the same shape — which leaves a clean 1px ring along
 *    every edge, including the diagonal cuts.
 *  - Content sits in a relatively-positioned block above both layers.
 *
 * The interior visually matches the page surface; the only thing
 * distinguishing the card is the thin border ring and the corner cuts.
 */
export function AuthCardFrame({
  children,
  className,
  maxWidthClass = "max-w-xl",
  minHeightPx = 420,
  chamferPx = 18,
  bodyClassName,
}: AuthCardFrameProps) {
  const clipPath = `polygon(${buildChamferClipPath(chamferPx)})`;

  return (
    <div className={`relative mx-auto w-full ${maxWidthClass} ${className ?? ""}`}>
      <div className="relative" style={{ minHeight: minHeightPx }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-white/10"
          style={{ clipPath }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-px bg-[#1E1E1E]"
          style={{ clipPath }}
        />
        <div className={`relative ${bodyClassName ?? DEFAULT_BODY_PADDING}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
