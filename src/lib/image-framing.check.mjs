/**
 * Self-check for the image-framing model. Run: node src/lib/image-framing.check.mjs
 *
 * The frontend has no test runner, so this is a plain assert script rather than
 * invented test scaffolding. It guards the two properties the whole rollout
 * rests on: unframed and default-framed images must render identically, and
 * untrusted stored JSON must never produce broken CSS.
 *
 * Kept in sync by hand with image-framing.ts (a .mjs file cannot import TS).
 */
import assert from "node:assert/strict";

const DEFAULT_FRAMING = { x: 50, y: 50, zoom: 1, fit: "cover" };
const clampNumber = (v, lo, hi, f) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : f;

function clampFraming(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const v = value;
  const rotate = v.rotate === 90 || v.rotate === 180 || v.rotate === 270 ? v.rotate : 0;
  return {
    x: clampNumber(v.x, 0, 100, 50),
    y: clampNumber(v.y, 0, 100, 50),
    zoom: clampNumber(v.zoom, 1, 4, 1),
    fit: v.fit === "contain" ? "contain" : "cover",
    flipH: v.flipH === true,
    flipV: v.flipV === true,
    rotate,
  };
}

function framingStyle(f) {
  if (!f) return {};
  const quarterTurn = f.rotate === 90 || f.rotate === 270;
  const transform = [
    f.rotate ? `rotate(${f.rotate}deg)` : "",
    f.zoom !== 1 ? `scale(${f.zoom})` : "",
    f.flipH ? "scaleX(-1)" : "",
    f.flipV ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    objectFit: quarterTurn ? "contain" : f.fit,
    objectPosition: `${f.x}% ${f.y}%`,
    ...(transform ? { transform, transformOrigin: `${f.x}% ${f.y}%` } : {}),
  };
}

// Garbage in → undefined out, so callers fall through to default rendering.
for (const bad of [null, undefined, 0, "", "x", [], [1, 2]]) {
  assert.equal(clampFraming(bad), undefined, `expected undefined for ${JSON.stringify(bad)}`);
}

// Out-of-range values clamp rather than reject.
assert.equal(clampFraming({ x: -20 }).x, 0);
assert.equal(clampFraming({ x: 999 }).x, 100);
assert.equal(clampFraming({ zoom: 99 }).zoom, 4);
assert.equal(clampFraming({ zoom: 0.1 }).zoom, 1);
assert.equal(clampFraming({ zoom: "2" }).zoom, 1, "non-numeric zoom falls back");
assert.equal(clampFraming({ rotate: 45 }).rotate, 0, "unsupported angle falls back to 0");
assert.equal(clampFraming({ fit: "nonsense" }).fit, "cover");

// THE load-bearing one: default framing must emit no transform, so existing
// group-hover:scale-* zooms keep working on unframed and pan-only images.
const base = framingStyle(DEFAULT_FRAMING);
assert.equal(base.transform, undefined, "default framing must not emit a transform");
assert.equal(base.transformOrigin, undefined);
assert.equal(base.objectFit, "cover");
assert.equal(base.objectPosition, "50% 50%");
assert.equal(framingStyle({ ...DEFAULT_FRAMING, x: 20, y: 80 }).transform, undefined,
  "pan alone must not emit a transform either");

// Quarter turns letterbox instead of cropping wrongly; 180 keeps cover.
assert.equal(framingStyle({ ...DEFAULT_FRAMING, rotate: 90 }).objectFit, "contain");
assert.equal(framingStyle({ ...DEFAULT_FRAMING, rotate: 270 }).objectFit, "contain");
assert.equal(framingStyle({ ...DEFAULT_FRAMING, rotate: 180 }).objectFit, "cover");

// Transform composition order: rotate, then zoom, then flips (applied
// right-to-left, so flips act in image space).
assert.equal(
  framingStyle({ x: 30, y: 40, zoom: 2, fit: "cover", flipH: true, rotate: 90 }).transform,
  "rotate(90deg) scale(2) scaleX(-1)",
);
// Zoom scales about the panned point, not the centre.
assert.equal(
  framingStyle({ ...DEFAULT_FRAMING, x: 30, y: 40, zoom: 2 }).transformOrigin,
  "30% 40%",
);

console.log("image-framing: all checks pass");
