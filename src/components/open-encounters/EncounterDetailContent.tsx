"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";

// Brand-exported encounter hero (Thumbnail-5, 1440×360). The SVG
// bakes in the silk photograph + the chamfered/diagonal-cut shape
// so we drop it in as-is; the Trip Info overlay sits on top.
const HERO_BG = "/images/open-encounters/encounter-hero.svg";

export function EncounterDetailContent() {
  const t = useTranslations("Home.openEncounters.encounter");
  const tParent = useTranslations("Home.openEncounters");
  const highlights = t.raw("highlights") as string[];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // No backend yet — stub submit until the encounter-booking
    // endpoint is wired up.
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto w-full px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(90vw, 4500px)" }}
      >
        {/* ── Hero banner ─────────────────────────────────────
            Silk-image header (Figma 1440×440 ≈ 3.27:1). The
            bottom ~45% is a "Trip Info" overlay — a blurred,
            bottom-heavy dark gradient that holds the chips +
            gradient title + location text, matching the Figma
            "Trip Info" frame. */}
        <section
          aria-label={t("title")}
          // Aspect ratio steps with the viewport: a near-square
          // 4:3 on mobile so the Trip Info overlay has room to
          // breathe, a wider 3:1 at sm, then the SVG's native
          // 4:1 at md+ so the brand shape renders 1:1 on desktop.
          className="relative w-full aspect-[4/3] sm:aspect-[3/1] md:aspect-[1440/360]"
        >
          <Image
            src={HERO_BG}
            alt=""
            fill
            sizes="(min-width: 1280px) 1440px, 95vw"
            // object-cover crops on mobile (where the aspect is
            // taller than the SVG), object-contain on md+ where
            // the aspect matches the SVG so the chamfered shape
            // renders 1:1.
            className="select-none object-cover md:object-contain"
            priority
          />

          {/* Trip Info overlay panel — covers the bottom 55% on
              mobile/sm (where the hero is taller), and the bottom
              45% on md+ where the hero is the Figma 4:1 ratio. */}
          <div
            className="absolute bottom-0 left-0 flex w-full flex-col justify-center h-[60%] sm:h-[55%] md:h-[45%]"
            style={{
              padding:
                "clamp(16px, 2.5vw + 0.5rem, 80px) clamp(16px, 6vw + 0.5rem, 220px)",
              gap: "clamp(10px, 0.6vw + 0.3rem, 24px)",
              background:
                "linear-gradient(0deg, color-mix(in srgb, var(--tott-home-surface) 64%, transparent) 0%, color-mix(in srgb, var(--tott-home-surface) 0%, transparent) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div
              className="flex flex-row flex-wrap items-center"
              style={{ gap: "clamp(6px, 0.3vw + 0.2rem, 16px)" }}
            >
              <Chip label={t("chipTalk")} variant="gold" />
              <Chip label={t("chipWorkshops")} />
            </div>
            <h1
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 1.6vw + 0.6rem, 5rem)",
                lineHeight: 1.25,
                margin: 0,
                textShadow:
                  "0px 1px 1px color-mix(in srgb, var(--tott-panel-bg) 24%, transparent)",
              }}
            >
              <FirstWordGold raw={t("title")} />
            </h1>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 0.3vw + 0.5rem, 1.5rem)",
                lineHeight: 1.45,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-strong)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("location")}
            </p>
          </div>
        </section>

        {/* ── Two-column main ──────────────────────────────────
            Left (flex-1): quick-info card → About → Trip
            highlights → Schedule → Map. Right (shrink-0): the
            "Join this Encounter" form. Stacks on lg breakpoint. */}
        <div
          className="flex flex-col lg:flex-row"
          style={{
            marginTop: "clamp(24px, 2vw + 0.5rem, 80px)",
            gap: "clamp(20px, 1.5vw + 0.5rem, 56px)",
          }}
        >
          <div
            className="flex min-w-0 flex-1 flex-col"
            style={{ gap: "clamp(20px, 1.5vw + 0.5rem, 56px)" }}
          >
            <StatsRow
              items={[
                {
                  icon: "calendar",
                  label: t("stats.dateLabel"),
                  value: t("stats.dateValue"),
                },
                {
                  icon: "clock",
                  label: t("stats.durationLabel"),
                  value: t("stats.durationValue"),
                },
                {
                  icon: "users",
                  label: t("stats.groupLabel"),
                  value: t("stats.groupValue"),
                },
                {
                  icon: "globe",
                  label: t("stats.languagesLabel"),
                  value: t("stats.languagesValue"),
                },
                {
                  icon: "pin",
                  label: t("stats.locationLabel"),
                  value: t("stats.locationValue"),
                },
              ]}
            />

            <Section heading={t("aboutHeading")}>
              <p
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  // Figma 16px/24px Inter 400, -0.01em tracking,
                  // color #F7F7F7 (near-white), text-shadow
                  // 0px 1px 2px rgba(0,0,0,0.24).
                  fontSize: "clamp(0.875rem, 0.45vw + 0.65rem, 1.75rem)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                  color: "var(--tott-home-text-strong)",
                  textShadow: "var(--tott-home-text-shadow)",
                  margin: 0,
                }}
              >
                {t("aboutBody")}
              </p>
            </Section>

            <Section heading={t("highlightsHeading")}>
              <ul
                className="grid grid-cols-1 sm:grid-cols-2"
                style={{
                  // Figma row gap 16, column gap 40.
                  gap: "clamp(12px, 0.4vw + 0.7rem, 32px) clamp(20px, 1.3vw + 1.4rem, 64px)",
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                }}
              >
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="flex flex-row items-center"
                    style={{ gap: "clamp(8px, 0.4vw + 0.2rem, 16px)" }}
                  >
                    <span
                      aria-hidden
                      className="inline-flex shrink-0 items-center justify-center"
                      style={{
                        // Figma 20×20 at laptop.
                        width: "clamp(18px, 0.15vw + 1.15rem, 32px)",
                        height: "clamp(18px, 0.15vw + 1.15rem, 32px)",
                        color: "var(--tott-magazine-btn-bg)",
                        // Figma check drop-shadow rgba(0,0,0,0.32).
                        filter:
                          "drop-shadow(0px 1px 2px color-mix(in srgb, var(--tott-panel-bg) 32%, transparent))",
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        // Figma 16px/20px Inter 400, -0.01em tracking,
                        // color #F7F7F7 (≈ var(--tott-home-text-strong)),
                        // text-shadow 0px 1px 2px rgba(0,0,0,0.24).
                        fontSize: "clamp(0.875rem, 0.45vw + 0.65rem, 1.5rem)",
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                        color: "var(--tott-home-text-strong)",
                        textShadow: "var(--tott-home-text-shadow)",
                      }}
                    >
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <ScheduleCard
              title={t("scheduleHeading")}
              start={t("scheduleStart")}
              end={t("scheduleEnd")}
              body={t("scheduleBody")}
              locationLabel={t("scheduleLocation")}
            />
          </div>

          {/* Right column — Book this Encounter form. Full-width
              on small screens (when stacked below the main
              content) and capped at ~480px on lg+ where it sits
              beside the content. Wrapped in a ChamferedFrame
              per Figma. */}
          <aside className="w-full shrink-0 lg:max-w-[clamp(320px,28vw,480px)]">
            <form
              onSubmit={submit}
              className="relative flex flex-col"
              style={{
                gap: "clamp(16px, 0.8vw + 0.3rem, 32px)",
                padding: "clamp(20px, 1vw + 0.5rem, 40px)",
              }}
            >
              <ChamferedFrame
                size={20}
                borderColor="var(--tott-card-border)"
              />
              <div
                className="flex flex-col"
                style={{ gap: "clamp(6px, 0.3vw + 0.2rem, 12px)" }}
              >
                <h2
                  style={{
                    fontFamily:
                      "'IBM Plex Sans', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "clamp(1.125rem, 0.5vw + 0.6rem, 1.75rem)",
                    lineHeight: 1.3,
                    color: "var(--tott-home-text-strong)",
                    margin: 0,
                  }}
                >
                  <FirstWordGold raw={t("joinFormTitle")} />
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    // Figma 12px/16px line-height, color #D6D6D6,
                    // text-shadow 0px 1px 2px rgba(0,0,0,0.24).
                    fontSize: "clamp(0.75rem, 0.2vw + 0.4rem, 1rem)",
                    lineHeight: 1.33,
                    color:
                      "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
                    textShadow: "var(--tott-home-text-shadow)",
                    margin: 0,
                  }}
                >
                  {t("joinFormSubtitle")}
                </p>
              </div>

              <FormField label={t("joinFullNameLabel")} required>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("joinFullNamePlaceholder")}
                  required
                  maxLength={120}
                  style={inputStyle}
                />
              </FormField>

              <FormField label={t("joinEmailLabel")} required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("joinEmailPlaceholder")}
                  required
                  maxLength={200}
                  style={inputStyle}
                />
              </FormField>

              <FormField
                label={t("joinMessageLabel")}
                hint={t("joinMessageOptional")}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("joinMessagePlaceholder")}
                  maxLength={1000}
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "clamp(72px, 4vw + 1.5rem, 120px)",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    resize: "vertical",
                    lineHeight: 1.45,
                  }}
                />
              </FormField>

              {/* Trip price row — Figma "Price" frame: 52px tall
                  inset card with the label on the left and the
                  free/total value on the right in gold. */}
              <div
                className="flex flex-row items-center justify-between"
                style={{
                  gap: "clamp(8px, 0.4vw, 16px)",
                  padding:
                    "clamp(12px, 0.6vw + 0.3rem, 24px) clamp(14px, 0.7vw + 0.3rem, 28px)",
                  backgroundColor: "var(--tott-elevated)",
                  border: "1px solid var(--tott-card-border)",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                    lineHeight: 1.4,
                    letterSpacing: "-0.005em",
                    color: "var(--tott-home-text-muted)",
                    textShadow: "var(--tott-home-text-shadow)",
                  }}
                >
                  {t("joinTipLabel")}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                    lineHeight: 1.4,
                    letterSpacing: "-0.005em",
                    color: "var(--tott-magazine-btn-bg)",
                  }}
                >
                  {t("joinTipFree")}
                </span>
              </div>

              <button
                type="submit"
                className="w-full transition-opacity hover:opacity-90"
                style={{
                  // Figma: full content-width gold pill, 40px tall
                  // at laptop, padding 8px, 8px radius, inset
                  // highlight at the top.
                  height: "clamp(40px, 0.4vw + 1.85rem, 64px)",
                  padding: "clamp(6px, 0.3vw, 14px) clamp(8px, 0.4vw, 16px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-magazine-btn-bg)",
                  boxShadow:
                    "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
                  color: "var(--tott-auth-btn-text)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.25vw + 0.5rem, 1.25rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                  textAlign: "center",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("joinSubmit")}
              </button>

              <p
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  // Figma 12px/16px Inter 400 color #7B7B7B.
                  fontSize: "clamp(0.75rem, 0.2vw + 0.4rem, 1rem)",
                  lineHeight: 1.33,
                  color: "var(--tott-home-text-muted)",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {t("joinDisclaimer")}
              </p>
            </form>
          </aside>
        </div>

        {/* ── Back to Writing Room ───────────────────────────── */}
        <div
          className="flex justify-center"
          style={{ marginTop: "clamp(40px, 3vw + 0.5rem, 144px)" }}
        >
          <Link
            href="/writing-room"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 2vw + 1rem, 96px)",
              padding:
                "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
              gap: "clamp(8px, 0.4vw, 18px)",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 1.5rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            <span
              aria-hidden
              className="inline-flex items-center justify-center"
              style={{
                width: "clamp(20px, 1vw + 0.3rem, 48px)",
                height: "clamp(20px, 1vw + 0.3rem, 48px)",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 6 5 12 11 18" />
              </svg>
            </span>
            {t("backToWritingRoom")}
          </Link>
        </div>

        {/* ── Join the Room ─────────────────────────────────── */}
        <section
          aria-labelledby="join-room-heading"
          className="relative overflow-hidden"
          style={{
            marginTop: "clamp(64px, 5vw + 0.5rem, 240px)",
            padding: "clamp(32px, 2vw + 0.5rem, 120px) clamp(16px, 1.2vw, 64px)",
            minHeight: "clamp(280px, 18vw + 4rem, 480px)",
          }}
        >
          <HexPatternBackdrop />

          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={{ gap: "clamp(18px, 1.4vw + 0.4rem, 64px)" }}
          >
            <h2
              id="join-room-heading"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.125rem, 2.15vw - 0.2rem, 6.5rem)",
                lineHeight: 1.2,
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {tParent("joinHeading")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 2.75rem)",
                lineHeight: 1.55,
                color: "var(--tott-home-text-muted)",
                maxWidth: "clamp(320px, 36vw, 1200px)",
                margin: 0,
              }}
            >
              {tParent("joinBody")}
            </p>
            <div
              className="mt-2 flex flex-wrap items-center justify-center"
              style={{ gap: "clamp(12px, 0.4vw + 0.3rem, 20px)" }}
            >
              <Link
                href="/writing-room/residency"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding:
                    "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-magazine-btn-bg)",
                  boxShadow:
                    "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
                  color: "var(--tott-auth-btn-text)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                {tParent("applyResidency")}
              </Link>
              <Link
                href="/writing-room/workshops"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding:
                    "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-card-border)",
                  boxShadow:
                    "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
                  color: "var(--tott-home-text-strong)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                {tParent("joinWorkshop")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function Chip({
  label,
  variant = "dark",
}: {
  label: string;
  variant?: "dark" | "gold";
}) {
  const isGold = variant === "gold";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // Figma 24px tall, 12/16 Inter 500 — clamp tunes the
        // two-anchor slope to hit those at laptop and grow up.
        height: "clamp(20px, 0.3vw + 1.3rem, 40px)",
        padding: "clamp(4px, 0.2vw, 12px) clamp(8px, 0.4vw + 0.2rem, 20px)",
        borderRadius: "6px",
        // Gold variant: brand gold fill (--tott-dash-gold-text =
        // #DBC99E) with dark-brown text + inset highlight, NO
        // backdrop blur per Figma. Dark variant: card-border fill
        // with strong-white text AND backdrop blur for legibility
        // off the silk image.
        backgroundColor: isGold
          ? "var(--tott-dash-gold-text)"
          : "var(--tott-card-border)",
        boxShadow: isGold
          ? "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 4%, transparent)"
          : undefined,
        backdropFilter: isGold ? undefined : "blur(4px)",
        WebkitBackdropFilter: isGold ? undefined : "blur(4px)",
        color: isGold
          ? "var(--tott-auth-btn-text)"
          : "var(--tott-home-text-strong)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "clamp(11px, 0.15vw + 0.65rem, 1.125rem)",
        lineHeight: 1.33,
      }}
    >
      {label}
    </span>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col"
      // Figma `gap: 8px` between section heading and body —
      // routes through 8px at laptop and grows slightly.
      style={{ gap: "clamp(8px, 0.3vw + 0.3rem, 24px)" }}
    >
      <h2
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          // Figma Title/H5: 18px/24px IBM Plex 500.
          fontSize: "clamp(1rem, 0.48vw + 0.74rem, 2.5rem)",
          lineHeight: 1.33,
          margin: 0,
        }}
      >
        <FirstWordGold raw={heading} />
      </h2>
      {children}
    </section>
  );
}

type StatIcon = "calendar" | "clock" | "users" | "globe" | "pin";

function StatIconGlyph({ kind }: { kind: StatIcon }) {
  const common = {
    width: "100%",
    height: "100%",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
  }
}

// Octagon clip-path with 24px chamfered corners — matches the
// Figma stats-row shape (rounded rectangle with 45° diagonal cuts
// at each corner, not a corner-bracket ChamferedFrame outline).
const STATS_CLIP =
  "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)";

// Same chamfered-octagon shape as STATS_CLIP but tuned to a 16px
// corner for the schedule map placeholder so its chamfers feel
// proportional to its smaller footprint.
const MAP_CLIP =
  "polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)";

function StatsRow({
  items,
}: {
  items: { icon: StatIcon; label: string; value: string }[];
}) {
  return (
    <div
      className="relative"
      style={{
        padding:
          "clamp(20px, 1vw + 0.5rem, 48px) clamp(20px, 1.5vw + 0.5rem, 80px)",
        backgroundColor: "var(--tott-elevated)",
        clipPath: STATS_CLIP,
        WebkitClipPath: STATS_CLIP,
      }}
    >
      <ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        style={{
          gap: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {items.map((it, i) => (
          <li
            key={it.label}
            // Dividers only render at md+ where the 5-column row
            // actually fits without wrapping; below md the grid
            // is 2 or 3 columns and per-row left borders would
            // look wrong on the wrapped items.
            className={
              i === 0
                ? "flex flex-col items-center text-center"
                : "flex flex-col items-center text-center md:[border-left:1px_solid_color-mix(in_srgb,var(--tott-home-text-strong)_8%,transparent)]"
            }
            style={{
              gap: "clamp(6px, 0.3vw + 0.2rem, 16px)",
              padding:
                "clamp(4px, 0.2vw, 12px) clamp(8px, 0.4vw + 0.2rem, 24px)",
            }}
          >
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              width: "clamp(20px, 0.3vw + 1.1rem, 36px)",
              height: "clamp(20px, 0.3vw + 1.1rem, 36px)",
              color: "var(--tott-home-text-strong)",
              filter:
                "drop-shadow(0px 1px 2px color-mix(in srgb, var(--tott-panel-bg) 32%, transparent))",
            }}
          >
            <StatIconGlyph kind={it.icon} />
          </span>
          <div
            className="flex flex-col items-center"
            style={{ gap: "clamp(2px, 0.15vw, 8px)" }}
          >
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                // Figma 12px/16px label.
                fontSize: "clamp(0.75rem, 0.15vw + 0.65rem, 1rem)",
                lineHeight: 1.33,
                color:
                  "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {it.label}
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                // Figma 12px/20px value.
                fontSize: "clamp(0.75rem, 0.15vw + 0.65rem, 1rem)",
                lineHeight: 1.67,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-strong)",
                textShadow:
                  "0px 1px 1px color-mix(in srgb, var(--tott-panel-bg) 24%, transparent)",
              }}
            >
              {it.value}
            </span>
          </div>
        </li>
        ))}
      </ul>
    </div>
  );
}

function ScheduleCard({
  title,
  start,
  end,
  body,
  locationLabel,
}: {
  title: string;
  start: string;
  end: string;
  body: string;
  locationLabel: string;
}) {
  return (
    <section
      className="flex flex-row items-stretch"
      style={{
        gap: "clamp(16px, 1vw + 0.5rem, 40px)",
        // Extra top spacing so the schedule breathes away from
        // the Trip highlights checklist above it.
        marginTop: "clamp(24px, 1.5vw + 0.5rem, 64px)",
      }}
    >
      {/* Left timeline — numbered stop circle on top, dashed
          vertical line below filling the remaining height. The
          column has zero gap so the line flush-connects to the
          circle, and the line itself uses a repeating linear
          gradient (8px dash + 4px gap) so the dashes are crisp,
          evenly spaced, and don't break visually mid-pattern. */}
      <div className="flex shrink-0 flex-col items-center">
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center justify-center"
          style={{
            width: "clamp(32px, 0.3vw + 1.75rem, 56px)",
            height: "clamp(32px, 0.3vw + 1.75rem, 56px)",
            borderRadius: "999px",
            backgroundColor: "var(--tott-elevated)",
            boxShadow:
              "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent), inset 0px -1.5px 0px color-mix(in srgb, var(--tott-panel-bg) 32%, transparent)",
            color: "var(--tott-home-text-strong)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(0.875rem, 0.2vw + 0.55rem, 1.25rem)",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
          }}
        >
          1
        </span>
        <span
          aria-hidden
          className="flex-1"
          style={{
            width: "1.5px",
            backgroundImage:
              "linear-gradient(to bottom, var(--tott-card-border) 50%, transparent 50%)",
            backgroundSize: "1.5px 12px",
            backgroundRepeat: "repeat-y",
          }}
        />
      </div>

      {/* Right content — header row (title + date + time),
          description, map placeholder, location coordinates. */}
      <div
        className="flex min-w-0 flex-1 flex-col"
        style={{ gap: "clamp(8px, 0.4vw + 0.3rem, 20px)" }}
      >
        <header
          className="flex flex-row flex-wrap items-center justify-between"
          style={{ gap: "clamp(12px, 0.6vw + 0.3rem, 24px)" }}
        >
          <h3
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              // Figma 16px/24px Inter 500.
              fontSize: "clamp(0.9375rem, 0.3vw + 0.55rem, 1.5rem)",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              textShadow: "var(--tott-home-text-shadow)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <div
            className="flex flex-row flex-wrap items-center"
            style={{ gap: "clamp(8px, 0.4vw + 0.3rem, 24px)" }}
          >
            <ScheduleMeta icon="calendar" label={start} />
            <ScheduleMeta icon="clock" label={end} />
          </div>
        </header>

        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 0.3vw + 0.45rem, 1.25rem)",
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
            color:
              "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
            textShadow: "var(--tott-home-text-shadow)",
            margin: 0,
          }}
        >
          {body}
        </p>

        {/* Map placeholder — Figma #121212 inset card with the
            same chamfered-octagon shape as the stats row above
            so the two surfaces read as one family. Holds the
            real map once it's wired up. */}
        <div
          aria-hidden
          style={{
            width: "100%",
            height: "clamp(120px, 8vw + 2rem, 240px)",
            backgroundColor: "var(--tott-panel-bg)",
            clipPath: MAP_CLIP,
            WebkitClipPath: MAP_CLIP,
          }}
        />

        <span
          className="inline-flex items-center"
          style={{
            gap: "clamp(6px, 0.3vw, 12px)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 0.3vw + 0.45rem, 1.25rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.005em",
            color:
              "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
            textShadow: "var(--tott-home-text-shadow)",
          }}
        >
          <svg
            aria-hidden
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {locationLabel}
        </span>
      </div>
    </section>
  );
}

function ScheduleMeta({
  icon,
  label,
}: {
  icon: "calendar" | "clock";
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: "clamp(6px, 0.3vw, 12px)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: "clamp(0.8125rem, 0.3vw + 0.45rem, 1.25rem)",
        lineHeight: 1.4,
        letterSpacing: "-0.005em",
        color:
          "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
        textShadow: "var(--tott-home-text-shadow)",
      }}
    >
      <svg
        aria-hidden
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "calendar" ? (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </>
        )}
      </svg>
      {label}
    </span>
  );
}

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex flex-col"
      style={{ gap: "clamp(6px, 0.3vw + 0.2rem, 12px)" }}
    >
      <span className="flex flex-row items-center" style={{ gap: "6px" }}>
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(0.8125rem, 0.25vw + 0.45rem, 1.125rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
          }}
        >
          {label}
        </span>
        {hint ? (
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(0.75rem, 0.2vw + 0.4rem, 1rem)",
              lineHeight: 1.4,
              color: "var(--tott-home-text-muted)",
            }}
          >
            {hint}
          </span>
        ) : null}
        {required ? (
          <span
            aria-label="required"
            style={{
              // Required-field marker per Figma — a red asterisk
              // beside the label, color from the brand negative
              // token (same hue family as Figma `#E93544`).
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 0.25vw + 0.45rem, 1.25rem)",
              lineHeight: 1,
              color: "var(--tott-dash-negative)",
            }}
          >
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "clamp(40px, 0.7vw + 1.5rem, 56px)",
  padding: "8px 12px",
  backgroundColor: "var(--tott-elevated)",
  border: "1px solid var(--tott-card-border)",
  borderRadius: "8px",
  boxSizing: "border-box",
  color: "var(--tott-home-text-strong)",
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: "-0.005em",
  outline: "none",
};
