"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

// Pre-rendered hex card image (193×288, transparent background outside
// the hex). Already has the silk fill and border baked in, so we drop
// the clip-path and use it as a regular image.
const CARD_IMAGE = "/images/home/Book Cover.png";

// Octagonal chamfer for small label chips — 6px corner cuts.
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

/**
 * "Latest Published" — horizontal row of 5 vertical-hex cards (silk image
 * + category chip + title + author/read-time). Lives between the
 * Manifesto pane (Explore Our Spaces) and the Publications pane.
 *
 * Header layout: gold heading + muted subtitle on the left, gold "View
 * more →" link on the right.
 */
export function MagazineLatestPublished() {
  const t = useTranslations("Home.magazine.publications");

  const latest = [
    { key: "categoryArchitecture" as const },
    { key: "categoryArt" as const },
    { key: "categoryFashion" as const },
    { key: "categoryFilm" as const },
    { key: "categoryFilm" as const },
  ];

  return (
    <section
      aria-labelledby="latest-published-heading"
      className="px-4 sm:px-6 md:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="latest-published-heading"
            className="text-lg font-medium tracking-tight sm:text-xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            <LatestPublishedHeading raw={t("latestHeading")} />
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("latestSubtitle")}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("viewMore")}
          <span aria-hidden>→</span>
        </button>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
        {latest.map((item, i) => (
          <li
            key={i}
            className="mx-auto flex w-full max-w-[192px] flex-col items-stretch"
          >
            {/* Pre-rendered hex card image (Book Cover.png) — natural
                aspect 193×288, hex shape and border baked in. */}
            <div
              className="relative w-full"
              style={{ aspectRatio: "193 / 288" }}
            >
              <Image
                src={CARD_IMAGE}
                alt=""
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 192px, (min-width: 640px) 25vw, 45vw"
              />
            </div>
            <div className="mt-3 flex flex-col items-center text-center">
              {/* Author/Label chip — chamfered (cut corners ~6px) with
                  gold fill. Figma spec: 88×24. */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "88px",
                  height: "24px",
                  backgroundColor: "var(--tott-accent-gold)",
                  color: "var(--tott-auth-btn-text)",
                  fontSize: "11px",
                  fontWeight: 500,
                  clipPath: CHIP_CHAMFER,
                  WebkitClipPath: CHIP_CHAMFER,
                }}
              >
                {t(item.key)}
              </span>
              <p
                className="mt-2 text-sm font-medium leading-snug sm:text-[0.95rem]"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {t("cardTitle")}
              </p>
              <p
                className="mt-1 text-xs sm:text-sm"
                style={{ color: "var(--tott-home-text-muted)" }}
              >
                {t("cardAuthor")} · {t("cardReadTime", { minutes: 8 })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Splits the heading into "first word (gold) + rest (default)" so only
 * the lead word is accented. Works for any locale that uses spaces —
 * matches the comp's two-tone "Latest Published" treatment.
 */
function LatestPublishedHeading({ raw }: { raw: string }) {
  const trimmed = raw.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) {
    return <span style={{ color: "var(--tott-accent-gold)" }}>{trimmed}</span>;
  }
  const first = trimmed.slice(0, firstSpace);
  const rest = trimmed.slice(firstSpace);
  return (
    <>
      <span style={{ color: "var(--tott-accent-gold)" }}>{first}</span>
      <span>{rest}</span>
    </>
  );
}
