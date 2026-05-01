"use client";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MenuIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { DashboardConfig } from "@/lib/dashboard/types";
import { DashboardSidebar } from "./DashboardSidebar";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

type DashboardLayoutProps = {
  config: DashboardConfig;
  header?: React.ReactNode;
  commandCenter?: React.ReactNode;
  /** Shown next to the menu button on small screens (defaults to translated “Dashboard”). */
  mobileBarTitle?: string;
  children: React.ReactNode;
  badgeOverrides?: Record<string, string>;
};

export function DashboardLayout({
  config,
  header,
  commandCenter,
  mobileBarTitle,
  children,
  badgeOverrides,
}: DashboardLayoutProps) {
  const t = useTranslations("Dashboard.layout");
  const resolvedMobileTitle = mobileBarTitle ?? t("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const panelClass = "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)]";

  return (
    <div className="relative min-h-[calc(100dvh-72px)] bg-[var(--tott-dash-surface)]">
      {/* Hex background — decorative accent at the top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative">
        {/* Mobile topbar */}
        <div className="flex h-14 shrink-0 items-center gap-4 px-4 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label={t("openSidebar")}
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-medium text-foreground">{resolvedMobileTitle}</span>
        </div>

        <div className="flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 md:px-10 lg:px-16 xl:px-24 xl:py-10">
          {/* Header area */}
          {header && <div>{header}</div>}

          {/* Command center / page-specific header - above sidebar and content */}
          {commandCenter && <div>{commandCenter}</div>}

          {/* Sidebar + content row */}
          <div className="flex items-stretch gap-6">
            {/* Desktop sidebar (collapsible — always visible on lg+, just narrower when collapsed) */}
            <aside
              className={`hidden shrink-0 transition-[width] duration-200 lg:block ${
                desktopSidebarCollapsed ? "w-16" : "w-52 xl:w-56"
              }`}
            >
              <div className="relative flex h-full flex-col">
                <ChamferedFrame />
                <button
                  type="button"
                  onClick={() => setDesktopSidebarCollapsed((v) => !v)}
                  className="absolute end-4 top-0 z-10 hidden p-1.5 text-[var(--tott-muted)] transition-colors hover:text-foreground lg:inline-flex"
                  aria-label={desktopSidebarCollapsed ? t("openSidebar") : t("closeSidebar")}
                >
                  <span
                    className={`inline-flex transition-transform duration-200 ${
                      desktopSidebarCollapsed ? "" : "rotate-180"
                    }`}
                  >
                    <ChevronRightIcon />
                  </span>
                </button>
                <DashboardSidebar
                  config={config}
                  badgeOverrides={badgeOverrides}
                  collapsed={desktopSidebarCollapsed}
                />
              </div>
            </aside>

            {/* Main content */}
            <main className="relative min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6">
              <ChamferedFrame />
              <div className="relative">{children}</div>
            </main>
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
          className={`absolute left-0 top-0 h-full w-[min(288px,82vw)] border-r border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            config={config}
            onItemClick={closeMobile}
            badgeOverrides={badgeOverrides}
          />
        </div>
      </div>
    </div>
  );
}
