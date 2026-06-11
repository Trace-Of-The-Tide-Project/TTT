/**
 * Project-wide theme constants.
 * Import from '@/lib/theme' to keep colors and layout consistent.
 */

export const theme = {
  /**
   * Primary accent for buttons, links, accents. Token-backed so each theme
   * supplies its own: gold (#cba158) on light/dark, Wave Blue (#5caec1) on tide.
   * Safe in solid color contexts (`backgroundColor`, `color`, `border` shorthand);
   * for alpha washes use `color-mix(in srgb, var(--tott-accent-gold) N%, transparent)`
   * rather than hex-suffix concatenation.
   */
  accentGold: 'var(--tott-accent-gold)',
  /** Slightly lighter accent for focus rings, borders, checkboxes (token-backed). */
  accentGoldFocus: 'var(--tott-accent-gold-focus)',

  /**
   * Secondary “tide” accent — muted teal; use for hovers, rules, subtle UI.
   * Prefer CSS `var(--tott-accent-tide)` when possible so light/dark tokens apply.
   */
  accentTide: "var(--tott-accent-tide)",
  accentTideMuted: "var(--tott-accent-tide-muted)",

  /**
   * Ink placed on top of filled accent surfaces (gold/blue buttons, avatars,
   * chips). Token-backed: black on light/dark, sand (#fbe9d2) on tide so the
   * deep-sea accent stays legible. Do not use for full-page backgrounds; use
   * {@link pageBackground}.
   */
  bgDark: 'var(--tott-on-accent)',

  /** Full-page / section background — follows global light/dark (see globals.css). */
  pageBackground: "var(--background)",
  /**
   * Primary page surface used by the home, writing-room, residency,
   * start-an-issue and content pages (#171717 dark / #faf9f5 light).
   * Slightly darker than {@link pageBackground}; use it so a page reads
   * as the same surface as the rest of the site.
   */
  homeSurface: "var(--tott-home-surface)",
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
