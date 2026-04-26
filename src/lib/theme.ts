/**
 * Project-wide theme constants.
 * Import from '@/lib/theme' to keep colors and layout consistent.
 */

export const theme = {
  /** Primary gold for buttons, links, accents */
  accentGold: '#CBA158',
  /** Slightly lighter gold for focus rings, borders, checkboxes */
  accentGoldFocus: '#C9A96E',

  /**
   * Pure black — text on gold chips and other fixed “ink on gold” UI.
   * Do not use for full-page backgrounds; use {@link pageBackground}.
   */
  bgDark: '#000000',

  /** Full-page / section background — follows global light/dark (see globals.css). */
  pageBackground: "var(--background)",
  /** Default body text color for themed surfaces. */
  pageForeground: "var(--foreground)",

  /** Auth top band (behind HexBackground) — follows `html[data-theme]` in globals.css */
  authBandGradient: "var(--tott-auth-band-gradient)",

  /** Input and checkbox border */
  inputBorder: '#525252',

  /** Borders and neutral chrome — follows global theme. */
  cardBorder: "var(--tott-card-border)",

  /** Elevated panels (forms, side cards) — background + primary text on that panel. */
  panelBackground: "var(--tott-panel-bg)",
  panelForeground: "var(--tott-panel-text)",
  /** Nested wells inside a panel (e.g. price row). */
  panelWellBackground: "var(--tott-well-bg)",

  /**
   * @deprecated Auth hex card uses CSS vars `--tott-auth-hex-inner` / `--tott-auth-hex-inset-ring`.
   * Kept for any legacy imports.
   */
  cardBg: "#000000",
  cardInnerGlow: "rgba(203,161,88,0.15)",

  /** Motion durations — mirrors the CSS custom properties defined in globals.css. */
  motion: {
    hover: "var(--tott-motion-duration-hover)",
    enter: "var(--tott-motion-duration-enter)",
    page: "var(--tott-motion-duration-page)",
    ease: "var(--tott-motion-ease)",
  },
} as const

export type Theme = typeof theme
