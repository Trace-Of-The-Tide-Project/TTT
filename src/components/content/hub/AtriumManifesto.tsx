"use client";

import { useLocale, useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

/**
 * A single editorial "breath" line between the hero and the gateways,
 * flanked by an accentGold→transparent hairline on each logical side.
 * Reinforces the "one house, many rooms" framing. Static — no fetch.
 */
export function AtriumManifesto() {
  const t = useTranslations("Content");
  // CSS gradients use physical directions and don't auto-mirror, so flip them
  // for RTL: each rule should fade toward the text from its own page edge.
  const isRtl = useLocale() === "ar";
  const fade = `color-mix(in srgb, ${theme.accentGold} 55%, transparent)`;
  const leadingRule = `linear-gradient(${isRtl ? "to left" : "to right"}, transparent, ${fade})`;
  const trailingRule = `linear-gradient(${isRtl ? "to right" : "to left"}, transparent, ${fade})`;

  return (
    <RevealOnScroll className="relative w-full px-4 py-16 sm:px-6 sm:py-20 md:px-8">
      <div className="mx-auto flex w-full max-w-[1100px] items-center gap-4 sm:gap-6">
        {/* Leading rule — fades from the page edge toward the text (logical start). */}
        <span
          aria-hidden
          className="hidden h-px flex-1 sm:block"
          style={{ background: leadingRule }}
        />
        <p
          className="text-center text-balance text-xl font-medium tracking-tight sm:text-2xl md:text-[1.75rem]"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("hub.manifesto")}
        </p>
        {/* Trailing rule — fades from the page edge toward the text (logical end). */}
        <span
          aria-hidden
          className="hidden h-px flex-1 sm:block"
          style={{ background: trailingRule }}
        />
      </div>
    </RevealOnScroll>
  );
}
