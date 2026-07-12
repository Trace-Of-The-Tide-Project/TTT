import { ImageResponse } from "next/og";

/**
 * Social share card, auto-attached as og:image to every page under
 * `/[locale]`. Lives inside the [locale] segment on purpose: the middleware
 * matcher intercepts extensionless root paths, so a root-level
 * `app/opengraph-image.tsx` would get locale-redirected to a 404.
 *
 * ponytail: single EN card for all locales; a per-locale card needs an
 * Amiri font buffer + RTL layout in satori — add if OG CTR ever matters.
 */
export const alt = "Trace of the Tide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori can't read CSS custom properties — these mirror the globals.css
// tokens --tott-home-surface (#171717), --tott-gold-muted (#af7e47),
// --tott-home-text-warm (#f4eee1) and --tott-salt (#b8b3a9).
const SURFACE = "#171717";
const GOLD = "#af7e47";
const TEXT_WARM = "#f4eee1";
const SALT = "#b8b3a9";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          backgroundColor: SURFACE,
        }}
      >
        <div style={{ width: 96, height: 4, backgroundColor: GOLD }} />
        <div
          style={{
            marginTop: 48,
            fontSize: 84,
            fontWeight: 700,
            color: TEXT_WARM,
            letterSpacing: "-0.015em",
          }}
        >
          Trace of the Tide
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.4,
            color: SALT,
            maxWidth: 900,
          }}
        >
          Preserving our collective memory through stories, testimonies, and
          cultural artifacts.
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 26,
            color: GOLD,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          traceofthetide.org
        </div>
      </div>
    ),
    size,
  );
}
