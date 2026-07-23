/**
 * Draws a 1080×1920 Instagram-story card for a piece of content.
 *
 * Canvas (not `next/og`) on purpose: the browser's text engine shapes and
 * bidi-orders Arabic correctly, while satori renders Arabic letters unjoined.
 * Colours and fonts are read back from the live design tokens so the card
 * follows the active theme instead of duplicating brand values here.
 */

const WIDTH = 1080;
const HEIGHT = 1920;
const PAD = 96;

/** Brand fallbacks, used only when a token can't be resolved (SSR-less canvas, odd theme). */
const FALLBACK = {
  surface: "#0e1113",
  surfaceDeep: "#07090a",
  gold: "#cba158",
  text: "#f3ede2",
  muted: "#9aa3a6",
};

export type StoryCardInput = {
  title: string;
  author?: string;
  /** Short link printed at the bottom of the card. */
  url: string;
  /** Content locale — drives text direction. */
  locale: string;
  /** Brand wordmark, localized. */
  brand: string;
  /** e.g. "by" / "بقلم". */
  byLabel: string;
};

function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // Tokens can resolve to another `var(...)` chain, which canvas can't parse.
  return /^(#|rgb|hsl)/i.test(raw) ? raw : fallback;
}

/** Resolves a Tailwind/utility font stack to concrete family names canvas can use. */
function resolveFontFamily(className: string, fallback: string): string {
  const el = document.createElement("span");
  el.className = className;
  el.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(el);
  const family = getComputedStyle(el).fontFamily;
  el.remove();
  return family || fallback;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export async function renderStoryCard(input: StoryCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  await document.fonts?.ready;

  const gold = cssColor("--tott-accent-gold", FALLBACK.gold);
  const text = cssColor("--tott-home-text-warm", FALLBACK.text);
  const muted = cssColor("--tott-home-text-muted", FALLBACK.muted);
  const surface = cssColor("--tott-home-surface", FALLBACK.surface);
  const displayFont = resolveFontFamily("font-display", "Georgia, serif");
  const bodyFont = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  const rtl = input.locale === "ar";
  const startX = rtl ? WIDTH - PAD : PAD;
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";

  // Background: deep vertical wash with a warm gold bloom behind the title.
  const wash = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  wash.addColorStop(0, surface);
  wash.addColorStop(1, FALLBACK.surfaceDeep);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const bloom = ctx.createRadialGradient(
    rtl ? WIDTH * 0.75 : WIDTH * 0.25,
    HEIGHT * 0.42,
    0,
    rtl ? WIDTH * 0.75 : WIDTH * 0.25,
    HEIGHT * 0.42,
    WIDTH * 0.9,
  );
  bloom.addColorStop(0, gold);
  bloom.addColorStop(1, "transparent");
  // Alpha via globalAlpha, not a hex suffix — tokens may resolve to rgb()/hsl().
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();

  // Hex motif — the site's geometric language, kept faint.
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.globalAlpha = 0.14;
  ctx.lineWidth = 3;
  for (const [cx, cy, r] of [
    [WIDTH - 40, 250, 260],
    [WIDTH - 150, 520, 130],
    [70, HEIGHT - 260, 300],
    [250, HEIGHT - 120, 140],
  ]) {
    hexPath(ctx, cx, cy, r);
    ctx.stroke();
  }
  ctx.restore();

  // Eyebrow: brand wordmark.
  ctx.fillStyle = gold;
  ctx.font = `600 34px ${bodyFont}`;
  ctx.fillText(input.brand.toUpperCase(), startX, 300);

  ctx.fillStyle = gold;
  ctx.fillRect(rtl ? WIDTH - PAD - 120 : PAD, 340, 120, 4);

  // Title — shrink until it fits the available band.
  const maxWidth = WIDTH - PAD * 2;
  let fontSize = 92;
  let lines: string[] = [];
  for (; fontSize >= 52; fontSize -= 6) {
    ctx.font = `600 ${fontSize}px ${displayFont}`;
    lines = wrapLines(ctx, input.title, maxWidth);
    if (lines.length <= 8) break;
  }
  // Arabic letterforms join — leading is looser and never letter-spaced.
  const lineHeight = Math.round(fontSize * (rtl ? 1.6 : 1.35));
  ctx.fillStyle = text;
  let y = 480 + lineHeight;
  for (const line of lines.slice(0, 8)) {
    ctx.fillText(line, startX, y);
    y += lineHeight;
  }

  if (input.author) {
    ctx.fillStyle = gold;
    ctx.font = `500 40px ${bodyFont}`;
    ctx.fillText(`${input.byLabel} ${input.author}`, startX, y + 40);
  }

  // Footer: rule, wordmark, short link.
  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(PAD, HEIGHT - 300, WIDTH - PAD * 2, 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = text;
  ctx.font = `600 40px ${displayFont}`;
  ctx.fillText(input.brand, startX, HEIGHT - 220);

  ctx.fillStyle = muted;
  ctx.font = `400 32px ${bodyFont}`;
  ctx.direction = "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  ctx.fillText(input.url.replace(/^https?:\/\//, ""), startX, HEIGHT - 160);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not render the story image"))),
      "image/png",
    );
  });
}
