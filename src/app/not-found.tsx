/**
 * Root fallback 404 — fires when no [locale] segment matches.
 * No next-intl context here, so hardcoded English + plain anchors only.
 */
import Link from "next/link";
import HexBackground404 from "@/components/ui/HexBackground404";
import { HeadsetIcon } from "@/components/ui/icons";

export default function RootNotFound() {
  return (
    <div
      className="relative h-screen w-full select-none overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="absolute inset-0">
        <HexBackground404 />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col items-center text-center">

          <p
            className="text-base font-medium tracking-wide sm:text-lg"
            style={{ color: "var(--tott-muted)" }}
          >
            Page Not Found
          </p>

          <p
            aria-hidden
            className="select-none font-black leading-none"
            style={{
              fontSize: "clamp(5rem, 22vw, 20rem)",
              letterSpacing: "-0.03em",
              color: "var(--tott-card-border)",
              marginTop: "0.15rem",
            }}
          >
            404
          </p>

          <h1
            className="mt-4 text-lg font-bold sm:text-2xl"
            style={{ color: "var(--foreground)" }}
          >
            Oops! This page seems lost to history.
          </h1>

          <p
            className="mt-2 max-w-md text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--tott-muted)" }}
          >
            We couldn&apos;t find the page you were looking for. It may have been moved, renamed, or never existed.
          </p>

          <Link
            href="/en"
            className="mt-5 inline-block rounded-xl px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            Go back to Homepage
          </Link>

          <p
            className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            <span>If you believe this is an error,</span>
            <span
              className="inline-flex shrink-0 items-center"
              style={{ color: "var(--tott-dash-gold-label)" }}
              aria-hidden
            >
              <HeadsetIcon />
            </span>
            <Link
              href="/en/contact"
              className="font-medium hover:underline"
              style={{ color: "var(--tott-dash-gold-label)" }}
            >
              Contact us
            </Link>
            <span>and we&apos;ll help you find your way.</span>
          </p>

        </div>
      </div>
    </div>
  );
}
