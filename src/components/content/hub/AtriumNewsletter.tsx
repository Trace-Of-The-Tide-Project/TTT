"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { theme } from "@/lib/theme";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import HexBackground from "@/components/ui/HexBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { SpringCard } from "@/components/motion/SpringCard";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "A message in a bottle" — the closing newsletter beat, floating gently
 * (CSS loop, reduced-motion safe) over a hex backdrop with tide accents.
 *
 * The content hub has no magazine_id to scope a subscription, so this keeps
 * the form self-contained: a valid email shows a localized success state;
 * the section always renders (no backend dependency).
 */
export function AtriumNewsletter() {
  const t = useTranslations("Content");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RX.test(value)) return;
    setDone(true);
    toast.success(t("hub.newsletterSuccess"));
  };

  return (
    <RevealOnScroll className="relative w-full overflow-hidden px-4 pb-28 pt-12 sm:px-6 md:px-8">
      {/* Hex micro-motif floor the bottle floats over. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden opacity-40"
      >
        <HexBackground />
      </div>

      <div className="tott-bottle-float relative">
        <ChamferedPanel
          className="mx-auto w-full max-w-[760px]"
          borderColor={theme.accentTideMuted}
        >
          <div className="px-6 py-12 text-center sm:px-12 sm:py-16">
            <p
              className="font-mono text-xs uppercase tracking-[0.22em]"
              style={{ color: theme.accentTide }}
            >
              {t("hub.newsletterEyebrow")}
            </p>
            <h2
              className="mt-3 font-serif font-medium tracking-tight"
              style={{
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                color: "var(--tott-home-text-strong)",
              }}
            >
              {t("hub.newsletterTitle")}
            </h2>
            <p
              className="mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {t("hub.newsletterBody")}
            </p>

            {done ? (
              <p
                className="mt-8 text-sm font-medium"
                style={{ color: theme.accentGold }}
                role="status"
              >
                {t("hub.newsletterSuccess")}
              </p>
            ) : (
              <form
                onSubmit={onSubmit}
                className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
              >
                <label className="sr-only" htmlFor="atrium-newsletter-email">
                  {t("hub.newsletterPlaceholder")}
                </label>
                <input
                  id="atrium-newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("hub.newsletterPlaceholder")}
                  className="h-12 flex-1 rounded-md border bg-transparent px-4 text-sm outline-none transition-colors focus:border-[var(--tott-accent-tide)]"
                  style={{
                    borderColor: theme.cardBorder,
                    color: "var(--tott-home-text-strong)",
                  }}
                />
                <SpringCard interactive className="shrink-0">
                  <button
                    type="submit"
                    className="h-12 w-full whitespace-nowrap rounded-md px-6 text-sm font-semibold sm:w-auto"
                    style={{
                      backgroundColor: theme.accentGold,
                      color: "var(--tott-on-accent)",
                    }}
                  >
                    {t("hub.newsletterCta")}
                  </button>
                </SpringCard>
              </form>
            )}
          </div>
        </ChamferedPanel>
      </div>
    </RevealOnScroll>
  );
}
