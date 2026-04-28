"use client";

import { Link } from "@/i18n/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ShareYourStory() {
  const { isDark } = useTheme();

  return (
    <section className="flex flex-col items-center px-6 py-20 text-center">
      <div
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--tott-card-border)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>

      <h2 className="mb-4 text-2xl font-semibold text-foreground">Share your story</h2>

      <p
        className="mb-8 max-w-md text-sm leading-relaxed"
        style={{ color: isDark ? "#9ca3af" : "#6b5b47" }}
      >
        Every story matters. Help us preserve the collective memory by contributing your personal
        experiences, testimonies, or knowledge of historical events.
      </p>

      <Link
        href="/contribute"
        className="inline-flex items-center rounded-md px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#C9A96E", color: "#1a1a1a" }}
      >
        Contribute Now!
      </Link>
    </section>
  );
}
