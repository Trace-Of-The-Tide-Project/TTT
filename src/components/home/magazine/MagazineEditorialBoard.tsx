"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  PaletteIcon,
  FilmIcon,
  HomeIcon,
  MusicIcon,
  Grid2x2Icon,
  CalendarIcon,
  FolderIcon,
  BookIcon,
} from "@/components/ui/icons";

const HEX_CLIP =
  "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

const SILK = "/images/home/hero-silk.png";

type CategoryConfig = {
  key: "category1" | "category2" | "category3" | "category4" | "category5";
  Icon: () => React.ReactNode;
};

const CATEGORIES: CategoryConfig[] = [
  { key: "category1", Icon: PaletteIcon },
  { key: "category2", Icon: FilmIcon },
  { key: "category3", Icon: HomeIcon },
  { key: "category4", Icon: MusicIcon },
  { key: "category5", Icon: Grid2x2Icon },
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
          className="text-lg font-medium tracking-tight sm:text-xl"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("lessReadHeading")}
        </h2>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {CATEGORIES.map(({ key, Icon }) => (
            <li key={key} className="flex justify-center">
              <CategoryHex Icon={Icon} title={t(key)} />
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

function CategoryHex({
  Icon,
  title,
}: {
  Icon: () => React.ReactNode;
  title: string;
}) {
  const t = useTranslations("Home.magazine.editorialBoard");
  return (
    <div
      className="relative w-full max-w-[230px]"
      style={{ aspectRatio: "1 / 1.05" }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{
          clipPath: HEX_CLIP,
          WebkitClipPath: HEX_CLIP,
          backgroundColor: "var(--tott-panel-bg)",
        }}
      >
        <div
          className="mb-2 flex h-7 w-7 items-center justify-center"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <Icon />
        </div>
        <p
          className="text-sm font-medium sm:text-[0.95rem]"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {title}
        </p>
        <ul
          className="mt-3 space-y-1 text-[11px]"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          <li className="flex items-center justify-center gap-1.5">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full" style={{ backgroundColor: "var(--tott-accent-gold)", color: "var(--tott-auth-btn-text)" }}>
              <span className="text-[8px] font-semibold">A</span>
            </span>
            <span>{t("metaAuthor")}</span>
            <span aria-hidden style={{ opacity: 0.6 }}>
              <CalendarIcon />
            </span>
            <span>{t("metaDate")}</span>
          </li>
          <li className="flex items-center justify-center gap-1.5">
            <span aria-hidden style={{ opacity: 0.7 }}>
              <FolderIcon />
            </span>
            <span>{t("metaCategory")}</span>
            <span aria-hidden style={{ opacity: 0.7 }}>
              <BookIcon />
            </span>
            <span>{t("metaEdition")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

