"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { HeartHandshakeIcon, ClockIcon } from "@/components/ui/icons";

const HEX_CLIP =
  "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

const SILK = "/images/home/hero-silk.png";

/**
 * Support pane — "Recent Collaporations" (typo intentional, mirrors Figma).
 *
 *  Faint hex-pattern backdrop. A chamfered card holds the heading, subhead,
 *  and a row of "twin-hex" collab cards (author hex + handshake glyph +
 *  contributor hex) with title / type chip / timeline / description /
 *  status. Two circular gold-ringed nav buttons sit at the bottom.
 */
export function MagazineSupport() {
  const t = useTranslations("Home.magazine.support");

  return (
    <section
      className="relative overflow-hidden py-2"
      aria-labelledby="recent-collabs-heading"
    >
      {/* Faint hex pattern */}
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

      <ChamferedSurface
        chamfer={20}
        borderColor="var(--tott-card-border)"
        innerFill="var(--tott-home-surface)"
        className="relative w-full"
      >
        <div className="relative px-6 pb-12 pt-10 sm:px-10 sm:pb-14 sm:pt-12">
          <header className="text-center">
            <h2
              id="recent-collabs-heading"
              className="text-2xl font-medium tracking-tight sm:text-3xl"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              {t("heading")}
            </h2>
            <p
              className="mt-2 text-sm sm:text-base"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {t("subheading")}
            </p>
          </header>

          {/* Carousel-like row */}
          <div
            className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label={t("heading")}
          >
            {[0, 1, 2].map((i) => (
              <CollabCard key={i} />
            ))}
          </div>

          {/* Carousel nav */}
          <div className="mt-2 flex items-center justify-center gap-3">
            <NavRoundBtn label={t("previousCollab")}>
              <span aria-hidden className="text-xl">‹</span>
            </NavRoundBtn>
            <NavRoundBtn label={t("nextCollab")}>
              <span aria-hidden className="text-xl">›</span>
            </NavRoundBtn>
          </div>
        </div>
      </ChamferedSurface>
    </section>
  );
}

function CollabCard() {
  const t = useTranslations("Home.magazine.support");
  return (
    <article
      className="snap-start shrink-0 basis-[88%] sm:basis-[60%] lg:basis-[32%]"
    >
      <div className="text-center">
        {/* Twin-hex pair with handshake glyph */}
        <div className="relative mx-auto flex w-full items-center justify-center">
          <TwinHex />
        </div>

        {/* Roles */}
        <div
          className="mt-2 flex items-center justify-center gap-12 text-xs sm:text-sm"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          <span>{t("roleAuthor")}</span>
          <span>{t("roleContributor")}</span>
        </div>

        {/* Title */}
        <h3
          className="mt-4 text-lg font-medium tracking-tight sm:text-xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("collabTitle")}
        </h3>

        {/* Type + timeline */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <span style={{ color: "var(--tott-accent-gold)" }}>
            {t("collabType")}
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            <ClockIcon />
            <span>
              {t("collabTimelineLabel")} {t("collabTimeline")}
            </span>
          </span>
        </div>

        <p
          className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("collabBody")}
        </p>

        <div className="mt-4">
          <span
            className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              color: "var(--tott-home-text-strong)",
              border: "1px solid var(--tott-card-border)",
            }}
          >
            {t("collabStatus")}
          </span>
        </div>
      </div>
    </article>
  );
}

function TwinHex() {
  return (
    <div className="relative flex items-center" style={{ gap: "-12px" }}>
      <HexCell />
      <div
        aria-hidden
        className="z-10 -mx-3 flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--tott-home-surface)",
          color: "var(--tott-accent-gold)",
        }}
      >
        <HeartHandshakeIcon />
      </div>
      <HexCell />
    </div>
  );
}

function HexCell() {
  return (
    <div
      className="relative h-[120px] w-[120px] overflow-hidden sm:h-[140px] sm:w-[140px]"
      style={{
        clipPath: HEX_CLIP,
        WebkitClipPath: HEX_CLIP,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    >
      <Image src={SILK} alt="" fill className="object-cover" sizes="140px" />
      {/* Bottom gold gradient — matches the "warm under-glow" from the design */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(203,161,88,0.45) 100%)",
        }}
      />
    </div>
  );
}

function NavRoundBtn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/5"
      style={{
        border: "1px solid var(--tott-accent-gold)",
        color: "var(--tott-accent-gold)",
      }}
    >
      {children}
    </button>
  );
}
