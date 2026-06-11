"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkOwnership, getLibrary } from "@/services/commerce.service";
import { useInvalidatePurchases } from "@/hooks/mutations/commerce";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 20; // ~40s

/**
 * Post-checkout confirmation. The page NEVER grants access itself — it polls
 * until the Stripe webhook has written the entitlement(s), then links through
 * to the library. Access comes only from the webhook, never from this page.
 */
export function CheckoutSuccessContent() {
  const t = useTranslations("Home.Commerce");
  const { status } = useAuth();
  const invalidate = useInvalidatePurchases();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The polled endpoints require a session; polling as a guest would 401
    // and the axios interceptor would hard-redirect to login.
    if (status !== "authenticated") return;

    let active = true;
    let polls = 0;
    let timer: ReturnType<typeof setTimeout>;

    // Read sessionStorage breadcrumb (set when checkout started) to know which
    // book to confirm; fall back to "library grew" when absent.
    const pendingId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("tott:lastCheckoutBookId")
        : null;

    const tick = async () => {
      polls += 1;
      let done = false;
      if (pendingId) {
        done = await checkOwnership(pendingId).catch(() => false);
      } else {
        const lib = await getLibrary().catch(() => []);
        done = lib.length > 0;
      }
      if (!active) return;
      if (done) {
        setReady(true);
        invalidate();
        if (pendingId) window.sessionStorage.removeItem("tott:lastCheckoutBookId");
        return;
      }
      if (polls < MAX_POLLS) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-[var(--tott-home-text-strong)]">
        {t("successTitle")}
      </h1>
      <p className="mb-8 text-[var(--tott-home-text-muted)]">
        {ready ? t("successReady") : t("successFinalizing")}
      </p>
      <Link
        href="/books/library"
        className="w-full rounded-lg py-3 text-center font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--tott-magazine-btn-bg)",
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {t("goToLibrary")}
      </Link>
    </main>
  );
}
