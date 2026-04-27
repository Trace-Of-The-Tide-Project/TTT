import Image from "next/image";

type BrandLogoProps = {
  /** Rendered width in px. The SVG aspect ratio (57x28) is preserved. */
  width?: number;
  className?: string;
  /** Optional accessible label. Decorative by default (alt=""). */
  alt?: string;
  priority?: boolean;
};

/**
 * Trace of the Tide brand mark: three stacked gold strokes evoking a tidal trace.
 * Pulled from `public/auth/logo.svg` so the file is the single source of truth.
 */
export function BrandLogo({
  width = 57,
  className,
  alt = "",
  priority = false,
}: BrandLogoProps) {
  const height = Math.round((28 / 57) * width);
  return (
    <Image
      src="/auth/logo.svg"
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
