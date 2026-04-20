"use client";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { DashboardConfig } from "@/lib/dashboard/types";
import { DashboardSidebar } from "./DashboardSidebar";
import HexBackground from "@/components/ui/HexBackground";

type DashboardLayoutProps = {
  config: DashboardConfig;
  header?: React.ReactNode;
  commandCenter?: React.ReactNode;
  /** Shown next to the menu button on small screens (defaults to translated “Dashboard”). */
  mobileBarTitle?: string;
  children: React.ReactNode;
};

export function DashboardLayout({
  config,
  header,
  commandCenter,
  mobileBarTitle,
  children,
}: DashboardLayoutProps) {
  const t = useTranslations("Dashboard.layout");
  const resolvedMobileTitle = mobileBarTitle ?? t("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useTheme();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const panelClass = "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)]";
  const mobileMenuBtn = isDark
    ? "rounded-lg p-2 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
    : "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";
  const mobileTitle = isDark
    ? "text-sm font-medium text-foreground"
    : "text-sm font-medium text-gray-900";

  return (
    <div className={`relative min-h-[calc(100dvh-72px)] ${isDark ? "bg-black" : "bg-background"}`}>
      {/* Hex background — only behind the topbar area (dark mode) */}
      {isDark && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden">
          <HexBackground />
        </div>
      )}

      <div className="relative">
        {/* Mobile topbar */}
        <div className="flex h-14 shrink-0 items-center gap-4 px-10 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={mobileMenuBtn}
            aria-label={t("openSidebar")}
          >
            <MenuIcon />
          </button>
          <span className={mobileTitle}>{resolvedMobileTitle}</span>
        </div>

        <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 md:px-16 lg:px-24 xl:px-40 xl:py-12">
          {/* Header area */}
          {header && <div>{header}</div>}

          {/* Command center / page-specific header - above sidebar and content */}
          {commandCenter && <div>{commandCenter}</div>}

          {/* Sidebar + content row */}
          <div className="flex items-stretch gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className={`flex h-full flex-col ${panelClass}`}>
                <DashboardSidebar config={config} />
              </div>
            </aside>

            {/* Main content */}
            <main className={`min-w-0 flex-1 p-6 ${panelClass}`}>{children}</main>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "visible" : "invisible"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={closeMobile}
          className={`absolute inset-0 transition-opacity duration-300 ${
            mobileOpen ? "bg-black/60 opacity-100" : "opacity-0"
          }`}
          aria-label={t("closeSidebar")}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 border-r border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar config={config} onItemClick={closeMobile} />
        </div>
      </div>
    </div>
  );
}
