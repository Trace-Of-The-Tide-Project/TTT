/**
 * Per-placement image framing: how an image sits inside its frame, as opposed
 * to which image it is. Stored alongside the image reference in whatever
 * config the placement already has, and applied as pure CSS — assets are
 * private GCS objects served through signed URLs, so there is no server-side
 * or CDN transform available even in principle.
 *
 * Pan is a percentage `object-position`, not a translate. Percentages resolve
 * against the overflow rather than pixels, so one stored value produces the
 * identical crop in a 1920px hero and in a 480px admin preview — no
 * measurement, no reference width, and it works in server components.
 */
import type { CSSProperties } from "react";

export type ImageFit = "cover" | "contain";

export type ImageFraming = {
  /** Horizontal focus, 0–100 → object-position X. */
  x: number;
  /** Vertical focus, 0–100 → object-position Y. */
  y: number;
  /** 1 = untouched. Scales about (x, y) so panning stays meaningful zoomed in. */
  zoom: number;
  fit: ImageFit;
  flipH?: boolean;
  flipV?: boolean;
  rotate?: 0 | 90 | 180 | 270;
};

/** Reproduces today's rendering exactly: object-cover, centred, no transform.
 * Framed-by-default and unframed must be pixel-identical, or enabling framing
 * on a surface would silently restyle every existing image on it. */
export const DEFAULT_FRAMING: ImageFraming = { x: 50, y: 50, zoom: 1, fit: "cover" };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

function clampNumber(value: unknown, lo: number, hi: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(hi, Math.max(lo, value))
    : fallback;
}

/**
 * Read framing out of untrusted stored JSON. Returns undefined when absent or
 * unusable so callers fall through to the default rendering, and clamps rather
 * than rejects when a field is merely out of range.
 */
export function clampFraming(value: unknown): ImageFraming | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const v = value as Record<string, unknown>;
  const rotate =
    v.rotate === 90 || v.rotate === 180 || v.rotate === 270 ? v.rotate : 0;
  return {
    x: clampNumber(v.x, 0, 100, DEFAULT_FRAMING.x),
    y: clampNumber(v.y, 0, 100, DEFAULT_FRAMING.y),
    zoom: clampNumber(v.zoom, MIN_ZOOM, MAX_ZOOM, DEFAULT_FRAMING.zoom),
    fit: v.fit === "contain" ? "contain" : "cover",
    flipH: v.flipH === true,
    flipV: v.flipV === true,
    rotate,
  };
}

/** True when framing changes nothing. Editors store `undefined` in that case
 * so a no-op adjustment never persists a key. */
export function isDefaultFraming(f: ImageFraming): boolean {
  return (
    f.x === DEFAULT_FRAMING.x &&
    f.y === DEFAULT_FRAMING.y &&
    f.zoom === DEFAULT_FRAMING.zoom &&
    f.fit === DEFAULT_FRAMING.fit &&
    !f.flipH &&
    !f.flipV &&
    !f.rotate
  );
}

/**
 * CSS for a framed image. Merge onto whatever `style` the call site already
 * has; inline style beats Tailwind's `object-cover` class, so no consumer has
 * to drop its existing classes.
 *
 * Emits no `transform` at all when zoom is 1 with no flip or rotation — that
 * keeps the `group-hover:scale-[1.03]` hover zooms used across the card
 * surfaces working on unframed and pan-only images.
 */
export function framingStyle(f?: ImageFraming): CSSProperties {
  if (!f) return {};
  const quarterTurn = f.rotate === 90 || f.rotate === 270;
  // Right-to-left: flips apply in image space, then zoom, then rotation.
  const transform = [
    f.rotate ? `rotate(${f.rotate}deg)` : "",
    f.zoom !== 1 ? `scale(${f.zoom})` : "",
    f.flipH ? "scaleX(-1)" : "",
    f.flipV ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    // ponytail: quarter turns fall back to contain. Cropping correctly after a
    // 90° turn needs the frame's live aspect ratio, i.e. a measurement, i.e.
    // every framed image becomes a client component. Letterboxing is
    // predictable and the admin can zoom back to coverage.
    objectFit: quarterTurn ? "contain" : f.fit,
    objectPosition: `${f.x}% ${f.y}%`,
    ...(transform ? { transform, transformOrigin: `${f.x}% ${f.y}%` } : {}),
  };
}
