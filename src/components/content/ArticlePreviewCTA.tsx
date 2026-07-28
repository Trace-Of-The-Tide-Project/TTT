"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

// Synthetic ghost paragraph bars — never real article content. Widths are
// fixed (not random) so server/client render identically.
const GHOST_LINE_WIDTHS = ["100%", "94%", "88%", "60%"];

/** Shown after the last visible block on a 'preview' article: a blurred
 *  ghost tail (no real hidden blocks are ever sent to the client) plus a
 *  "Continue Reading" CTA. Distinct from PremiumGate/ArticleBuyGate — a
 *  preview is readable, not walled out, so there is no subscription check
 *  here at all. */
export default function ArticlePreviewCTA() {
  const t = useTranslations("Content.previewCta");

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none space-y-3"
        style={{ maskImage: "linear-gradient(to bottom, black, transparent)" }}
      >
        {GHOST_LINE_WIDTHS.map((w, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded-full blur-sm"
            style={{ width: w, backgroundColor: "var(--tott-panel-bg)" }}
          />
        ))}
      </div>
      <div
        className="mt-2 flex flex-col items-center gap-3 rounded-xl px-6 py-8 text-center"
        style={{ backgroundColor: "var(--tott-home-surface)" }}
      >
        <p className="font-semibold text-foreground">{t("heading")}</p>
        <p className="max-w-md text-sm text-[var(--tott-home-text-muted)]">{t("body")}</p>
        <Link
          href="/subscribe"
          className="rounded-lg px-5 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          style={{ backgroundColor: theme.accentGold }}
        >
          {t("subscribe")}
        </Link>
      </div>
    </div>
  );
}
