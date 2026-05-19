"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useSubscribeNewsletter } from "@/hooks/mutations/newsletter";
import { formatApiError } from "@/lib/api/error-message";
import { FirstWordGold } from "./FirstWordGold";
import { HexPatternBackdrop } from "./HexPatternBackdrop";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type MagazineNewsletterProps = {
  /** Magazine the subscription is scoped to. When missing the form
   * still renders, but submit short-circuits with an error toast —
   * the backend rejects requests without a real magazine_id. */
  magazineId?: string | null;
  /** Locale tag forwarded to the backend so confirmation emails pick
   * the right language. */
  locale?: string;
  /** Optional copy override — when supplied, replaces the default
   *  "Join our cultural circle" heading + body. Used by the parent
   *  page wrapper to swap content per active tab (e.g. show an
   *  Editorial Board contribution prompt). */
  titleOverride?: string;
  bodyOverride?: string;
  /** Optional CTA button — when supplied, replaces the email
   *  subscribe form with a single gold button (Figma "Apply to Join"
   *  spec). Currently used by the Editorial Board tab. */
  ctaButton?: { label: string; href: string };
};

/**
 * Newsletter band — pen-icon hex, headline, body copy, and an inline
 * email field wired to POST /newsletter-subscribers/subscribe via the
 * shared TanStack mutation.
 */
export function MagazineNewsletter({
  magazineId,
  locale,
  titleOverride,
  bodyOverride,
  ctaButton,
}: MagazineNewsletterProps = {}) {
  const t = useTranslations("Home.magazine.newsletter");
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RX.test(value)) {
      toast.error(t("invalidEmail"));
      return;
    }
    if (!magazineId) {
      // Backend requires magazine_id; without one the API would
      // return a 500. Give the user a clean message instead of
      // letting the request hit the API.
      toast.error(t("errorTitle"), { description: t("errorBody") });
      return;
    }
    subscribe.mutate(
      {
        email: value,
        magazine_id: magazineId,
        ...(locale ? { locale } : {}),
      },
      {
        onSuccess: () => {
          toast.success(t("successTitle"), { description: t("successBody") });
          setEmail("");
        },
        onError: (err) => {
          toast.error(t("errorTitle"), {
            description: formatApiError(err, t("errorBody")),
          });
        },
      },
    );
  };

  const submitting = subscribe.isPending;

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Hex with pen icon — pre-rendered Icon-5.svg (80×88). */}
        <div
          aria-hidden
          className="relative"
          style={{ width: "80px", height: "88px" }}
        >
          <Image
            src="/images/home/Icon-5.svg"
            alt=""
            fill
            sizes="80px"
            className="select-none"
            draggable={false}
          />
        </div>

        <p
          className="mt-4 text-sm"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("label")}
        </p>
        <h2
          id="newsletter-heading"
          className="mt-1 font-medium tracking-tight"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            // Figma Title/H4 — 24/32 white centred. We let the default
            // `Join our cultural circle` keep its gold first-word
            // accent; override copy renders flat white per the spec.
            fontSize: 24,
            lineHeight: "32px",
            color: titleOverride
              ? "#FFFFFF"
              : "var(--tott-home-text-strong)",
            maxWidth: 529,
            margin: "4px 0 0",
          }}
        >
          {titleOverride ? titleOverride : <FirstWordGold raw={t("title")} />}
        </h2>
        <p
          className="mt-3"
          style={{
            // Figma Paragraph/Small — Inter 400 14/20, ‑0.005em, #A3A3A3.
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: bodyOverride
              ? "#A3A3A3"
              : "var(--tott-home-text-muted)",
            maxWidth: 529,
          }}
        >
          {bodyOverride ?? t("body")}
        </p>

        {ctaButton ? (
          // Figma Button — 116×40, #C9A96E with inset 1px white-40%
          // top highlight, label Inter 500 14/20 ‑0.005em #332217.
          <Link
            href={ctaButton.href}
            className="mt-6 inline-flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{
              minWidth: 116,
              height: 40,
              padding: "8px 16px",
              backgroundColor: "#C9A96E",
              boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
              borderRadius: 8,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "#332217",
              textDecoration: "none",
            }}
          >
            {ctaButton.label}
          </Link>
        ) : (
          <form
            className="mt-6 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row"
            onSubmit={onSubmit}
            noValidate
          >
            <label className="sr-only" htmlFor="magazine-newsletter-email">
              {t("emailPlaceholder")}
            </label>
            <input
              id="magazine-newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={submitting}
              required
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none placeholder:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] disabled:opacity-60"
              style={{
                backgroundColor: "var(--tott-panel-bg)",
                border: "1px solid var(--tott-card-border)",
                color: "var(--tott-home-text-strong)",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)] disabled:opacity-60"
              style={{
                backgroundColor: "var(--tott-magazine-btn-bg)",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
