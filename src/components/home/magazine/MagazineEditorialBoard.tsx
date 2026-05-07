"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CalendarIcon,
  FolderIcon,
  BookIcon,
} from "@/components/ui/icons";

// Top-icon SVG for the writer cards (Icon-4.svg in the home folder).
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";

// Octagonal chamfer for label chips — 6px corner cuts. Same shape as
// the "Architecture / Art / Fashion ..." pills on the Latest Published
// row above so the page reads as one consistent system.
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

// Pre-rendered hex/mask shape (196×206, transparent outside the
// hex silhouette). Used as the background mask for category cards.
const CARD_MASK = "/images/home/Mask.png";

// Pre-rendered hex card image (276×291 with silk fill + transparent
// hex silhouette). The card "shape" comes from this PNG, not a CSS
// border — overlay text/icons sit inside the visible hex.
const WRITER_CARD = "/images/home/Image-2.png";

// Rounded-corner hexagon — used to clip the bottom darken-overlay so
// it follows the hex silhouette, not a rectangle.
const WRITER_HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

// Side filler — gradient strip used at the left/right edges of the
// writer carousel to suggest more cards beyond the visible row.
const FILLER = "/images/home/Content Grid Filler.png";

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

      {/* ─── Follow our Writers ───────────────────────────────────────
          Rectangular cards 276×294 (border-radius 16) per the Figma
          spec. Image fills the card; text + meta + Edition label sit
          on a bottom dark gradient overlay; top-icon floats above. */}
      <section aria-labelledby="follow-writers-heading">
        <header
          className="flex items-center"
          style={{ gap: "24px", padding: "0 24px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <h2
              id="follow-writers-heading"
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
              {t("writersHeading")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: "#A3A3A3",
                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
              }}
            >
              {t("writersSubtitle")}
            </p>
          </div>
        </header>

        {/* Carousel row — left filler + 4 cards + right filler in one
            flex row with a uniform 8px gap, so the half-hex on each
            side has the same spacing to the next card as the cards
            have between themselves. */}
        <div className="relative mt-8 overflow-hidden">
          <div
            className="mx-auto flex items-start justify-center"
            style={{ gap: "8px" }}
          >
            {/* Left filler (mirrored so its dark edge faces outward). */}
            <div
              aria-hidden
              className="hidden shrink-0 lg:block"
              style={{ width: "138px", height: "294px", position: "relative" }}
            >
              <Image
                src={FILLER}
                alt=""
                fill
                className="select-none object-cover"
                style={{ transform: "scaleX(-1)" }}
                sizes="138px"
                draggable={false}
              />
            </div>

            {/* Cards */}
            {[0, 1, 2, 3].map((i) => (
              <WriterCard key={i} />
            ))}

            {/* Right filler — dark edge faces outward (rightward). */}
            <div
              aria-hidden
              className="hidden shrink-0 lg:block"
              style={{ width: "138px", height: "294px", position: "relative" }}
            >
              <Image
                src={FILLER}
                alt=""
                fill
                className="select-none object-cover"
                sizes="138px"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Founder pull-quote — quote + author centered on the
          homepage-share-hex-pattern backdrop. Same mask technique as
          the home page's "Share your story" so the hex cells render
          at full size. The section is intentionally taller than the
          294px pattern so no hex gets cropped at top/bottom. */}
      <section
        className="relative overflow-hidden px-12 py-24 sm:py-28 md:py-32"
        style={{ minHeight: "420px" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-[min(140%,1232px)] max-w-none sm:w-[min(120%,1232px)] md:w-[min(100%,1232px)]"
            style={{
              aspectRatio: "1232 / 294",
              backgroundColor: "var(--tott-home-hex-stroke)",
              WebkitMaskImage:
                "url(/images/home/homepage-share-hex-pattern.svg)",
              maskImage:
                "url(/images/home/homepage-share-hex-pattern.svg)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </div>
        <blockquote
          className="relative mx-auto flex w-full max-w-[1232px] flex-col items-stretch"
          style={{ gap: "16px" }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "32px",
              lineHeight: "40px",
              color: "#FFFFFF",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("founderQuote")}
          </p>
          <footer
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              textAlign: "center",
            }}
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

/**
 * Writer card — hex-shaped per the comp. The Image-2.png provides both
 * the silhouette (transparent outside the hex) AND the silk fill, so
 * we don't need a CSS clip-path. Overlay elements sit inside the
 * visible hex area.
 */
function WriterCard() {
  const t = useTranslations("Home.magazine.editorialBoard");

  return (
    <article
      className="relative"
      style={{
        width: "276px",
        height: "294px",
      }}
    >
      {/* Hex-shaped image (Image-2.png has transparent corners — they
          stay transparent so the page background shows through, no
          black fill). */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />

      {/* Top icon — pre-rendered Icon-4.svg (48×48 with hex bg + glyph
          baked in). */}
      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: "48px",
          height: "48px",
          left: "calc(50% - 24px)",
          top: "8px",
        }}
      >
        <Image
          src={WRITER_TOP_ICON}
          alt=""
          fill
          sizes="48px"
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Bottom Text frame — 276×164. Gradient from transparent →
          near-black (matches the page surface), no backdrop-blur.
          Clipped to the hex silhouette so the dark fade follows the
          shape of the silk instead of bleeding into the corners. */}
      <div
        className="absolute bottom-0 left-0 z-10 flex flex-col items-center justify-end"
        style={{
          width: "276px",
          height: "164px",
          padding: "24px 24px 56px",
          gap: "8px",
          background:
            "linear-gradient(180deg, rgba(23, 23, 23, 0) 0%, #171717 100%)",
        }}
      >
        {/* Title */}
        <p
          className="text-center"
          style={{
            width: "228px",
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "#FFFFFF",
            textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
          }}
        >
          {t("writerCardTitle")}
        </p>

        {/* Author meta */}
        <div
          className="flex flex-wrap items-center justify-center"
          style={{ width: "228px", gap: "4px 8px" }}
        >
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
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "#D6D6D6",
                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
              }}
            >
              {t("writerAuthor")}
            </span>
          </span>
        </div>
      </div>

      {/* Edition label — chamfered chip (cut corners), same shape as
          the Latest Published category pills. Dark fill so it reads
          on the silk image. */}
      <span
        className="absolute z-20 inline-flex items-center justify-center"
        style={{
          width: "56px",
          height: "24px",
          left: "calc(50% - 28px)",
          bottom: "24px",
          backgroundColor: "rgba(23, 23, 23, 0.85)",
          color: "#FFFFFF",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "16px",
          clipPath: CHIP_CHAMFER,
          WebkitClipPath: CHIP_CHAMFER,
        }}
      >
        {t("writerEdition")}
      </span>
    </article>
  );
}
