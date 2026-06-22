"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";

const SHARE_HEX = "/images/home/Icon-5.svg";

export function BookDetailBanner() {
  const t = useTranslations("Home");
  return (
    <section
      aria-labelledby="book-detail-share-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <div aria-hidden className="relative" style={{ width: "80px", height: "88px" }}>
          <Image src={SHARE_HEX} alt="" fill sizes="80px" className="select-none" draggable={false} />
        </div>
        <div className="mt-6 flex w-full flex-col items-center" style={{ gap: "8px" }}>
          <h2
            id="book-detail-share-heading"
            className="min-[1600px]:text-[36px]! min-[1600px]:leading-[44px]!"
            style={{
              width: "100%",
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareTitle")}
          </h2>
          <p
            className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
            style={{
              width: "100%",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareBody")}
          </p>
        </div>
        <Link
          href="/contribute"
          className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--tott-magazine-btn-bg)", color: "var(--tott-auth-btn-text)" }}
        >
          {t("shareCta")}
        </Link>
      </div>
    </section>
  );
}
