"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Grid2x2Icon,
  CalendarIcon,
  FolderIcon,
  BookIcon,
} from "@/components/ui/icons";

// Pre-rendered hex/mask shape (196×206, transparent outside the
// hex silhouette). Used as the background mask for category cards.
const CARD_MASK = "/images/home/Mask.png";

// Rounded-corner hexagon — used by the "Follow our Writers" cards.
const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

const SILK = "/images/home/hero-silk.png";

type CategoryConfig = {
  key: "category1" | "category2" | "category3" | "category4" | "category5";
  /** Path to the pre-rendered 48×48 hex-wrapped icon SVG. */
  iconSrc: string;
};

const CATEGORIES: CategoryConfig[] = [
  { key: "category1", iconSrc: "/images/home/IconArt.svg" },          // Magic of Art (palette)
  { key: "category2", iconSrc: "/images/home/IconFilm.svg" },         // Film (filmstrip)
  { key: "category3", iconSrc: "/images/home/IconArchitecture.svg" }, // Architecture (temple)
  { key: "category4", iconSrc: "/images/home/IconMusic.svg" },        // Music (note)
  { key: "category5", iconSrc: "/images/home/IconSociety.svg" },      // Society (home)
];

/**
 * Editorial Board pane:
 *  - Explore Less Read Content: row of 5 hex category cards with icon +
 *    title + meta rows (Author / Date / Category / Edition).
 *  - Follow our Writers: 4 hex author cards with the silk image, title
 *    overlay, author chip and edition tag.
 *  - Founder pull-quote at the bottom over a soft hex pattern.
 */
export function MagazineEditorialBoard() {
  const t = useTranslations("Home.magazine.editorialBoard");

  return (
    <div className="grid gap-16 sm:gap-20">
      {/* ─── Explore Less Read Content ─────────────────────────────── */}
      <section aria-labelledby="less-read-heading">
        <h2
          id="less-read-heading"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            background:
              "radial-gradient(100% 100% at 0% 50%, #C9A96E 0%, rgba(201, 169, 110, 0) 50%), linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), #000000",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t("lessReadHeading")}
        </h2>

        {/* Cards row — gap 24px, wraps to 3 cols / 2 cols on smaller */}
        <ul
          className="mt-6 flex flex-wrap items-start justify-center"
          style={{ gap: "24px" }}
        >
          {CATEGORIES.map(({ key, iconSrc }) => (
            <li key={key} className="flex justify-center">
              <CategoryCard iconSrc={iconSrc} title={t(key)} />
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Follow our Writers ─────────────────────────────────────── */}
      <section aria-labelledby="follow-writers-heading">
        <div>
          <h2
            id="follow-writers-heading"
            className="text-lg font-medium tracking-tight sm:text-xl"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {t("writersHeading")}
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("writersSubtitle")}
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="relative">
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: "1 / 1.05",
                  clipPath: HEX_CLIP,
                  WebkitClipPath: HEX_CLIP,
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              >
                <Image
                  src={SILK}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 28vw, 45vw"
                />
                {/* Dark overlay so white text remains readable */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                {/* Top icon */}
                <div
                  className="absolute left-1/2 top-[18%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.45)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Grid2x2Icon />
                </div>
                {/* Title */}
                <p
                  className="absolute left-1/2 top-[55%] w-[80%] -translate-x-1/2 text-center text-sm font-medium leading-snug sm:text-[0.95rem]"
                  style={{ color: "#fff" }}
                >
                  {t("writerCardTitle")}
                </p>
                {/* Author chip */}
                <div className="absolute left-1/2 top-[68%] flex -translate-x-1/2 items-center gap-1.5">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: "var(--tott-accent-gold)",
                      color: "var(--tott-auth-btn-text)",
                    }}
                  >
                    A
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {t("writerAuthor")}
                  </span>
                </div>
                {/* Edition tag */}
                <span
                  className="absolute left-1/2 top-[80%] -translate-x-1/2 rounded-md px-2 py-0.5 text-[11px]"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.55)",
                    color: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {t("writerEdition")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Founder pull-quote over a faint hex pattern ───────────── */}
      <section className="relative overflow-hidden py-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "url('/images/home/homepage-share-hex-outline.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "180px",
          }}
        />
        <blockquote className="mx-auto max-w-3xl text-center">
          <p
            className="text-balance text-2xl font-medium leading-snug sm:text-3xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {t("founderQuote")}
          </p>
          <footer
            className="mt-6 text-sm sm:text-[0.95rem]"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("founderName")}
          </footer>
        </blockquote>
      </section>
    </div>
  );
}

/**
 * Category card — Mask.png hex background with a 48×48 SVG icon at the
 * top, gold-gradient title in the centre, and the Author/Date/Category/
 * Edition meta row underneath.
 */
function CategoryCard({
  iconSrc,
  title,
}: {
  iconSrc: string;
  title: string;
}) {
  const t = useTranslations("Home.magazine.editorialBoard");

  // Gold radial-gradient text effect from the Figma spec.
  const goldGradientTextStyle = {
    fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "20px",
    background:
      "radial-gradient(100% 100% at 0% 50%, #C9A96E 0%, rgba(201, 169, 110, 0) 50%), linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), #000000",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  } as React.CSSProperties;

  const metaTextStyle = {
    fontFamily: "'Inter', var(--font-sans, sans-serif)",
    fontWeight: 400,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#D6D6D6",
    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
  } as React.CSSProperties;

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        width: "196px",
        height: "206px",
        padding: "56px 24px",
      }}
    >
      {/* Pre-rendered hex mask as the card background. */}
      <Image
        src={CARD_MASK}
        alt=""
        fill
        className="pointer-events-none select-none"
        sizes="196px"
        draggable={false}
      />

      {/* Top icon — pre-rendered 48×48 SVG (hex background + glyph all
          baked in). Positioned absolutely at the top of the card. */}
      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: "48px",
          height: "48px",
          left: "calc(50% - 24px)",
          top: "12px",
        }}
      >
        <Image
          src={iconSrc}
          alt=""
          fill
          sizes="48px"
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Text block — title + meta, sits in the middle of the hex.
          z-10 so it renders above the Mask.png background. Margin-top
          pushes the block down past the absolute icon above. */}
      <div
        className="z-10 flex flex-col items-center"
        style={{ width: "148px", height: "64px", gap: "8px", marginTop: "8px" }}
      >
        {/* Title */}
        <p
          className="text-center"
          style={{ ...goldGradientTextStyle, width: "148px" }}
        >
          {title}
        </p>

        {/* Meta data — flex wrap with row gap 4 / col gap 8 */}
        <div
          className="flex flex-wrap items-center justify-center"
          style={{ width: "148px", gap: "4px 8px" }}
        >
          {/* Author */}
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: "16px",
                height: "16px",
                background: "#DBC99E",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: "999px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "8.5px",
                lineHeight: "10px",
                color: "#332217",
              }}
            >
              A
            </span>
            <span style={metaTextStyle}>{t("metaAuthor")}</span>
          </span>

          {/* Date */}
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.32))",
              }}
            >
              <CalendarIcon />
            </span>
            <span style={metaTextStyle}>{t("metaDate")}</span>
          </span>

          {/* Category */}
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.32))",
              }}
            >
              <FolderIcon />
            </span>
            <span style={metaTextStyle}>{t("metaCategory")}</span>
          </span>

          {/* Edition */}
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.32))",
              }}
            >
              <BookIcon />
            </span>
            <span style={metaTextStyle}>{t("metaEdition")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

