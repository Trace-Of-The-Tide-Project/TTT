"use client";

import { useTranslations } from "next-intl";

export function I18nDemoClient() {
  const tHome = useTranslations("Home");
  const tAuth = useTranslations("Auth");
  const tNav = useTranslations("Navbar");

  return (
    <div className="space-y-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Client</p>
      <p className="text-foreground">
        <code className="text-[#C9A96E]">useTranslations</code>: {tHome("title")} · {tAuth("login")} ·{" "}
        {tNav("home")}
      </p>
    </div>
  );
}
