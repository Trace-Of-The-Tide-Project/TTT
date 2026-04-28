"use client";

import { useTranslations } from "next-intl";
import { LogoAnimated } from "@/components/layout/LogoAnimated";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GridIcon,
  PersonPlusIcon,
  GiftIcon,
  PenLineIcon,
  LanguagesIcon,
  MoonIcon,
  SunIcon,
  MenuIcon,
  LogOutIcon,
  XIcon,
  ChevronDownSmallIcon,
} from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getNavAccountHref } from "@/lib/auth/nav-account-href";
import { theme } from "@/lib/theme";

const navLinks = [
  { href: "/fields", messageKey: "fields" as const, icon: GridIcon },
  { href: "/be-a-neighbor", messageKey: "beANeighbor" as const, icon: PersonPlusIcon },
  { href: "/gift-a-trace", messageKey: "giftATrace" as const, icon: GiftIcon },
  { href: "/contribute", messageKey: "traceAStory" as const, icon: PenLineIcon },
];

function getInitial(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) return name.trim()[0].toUpperCase();
  if (email?.trim()) return email.trim()[0].toUpperCase();
  return "A";
}

export function Navbar() {
  const t = useTranslations("Navbar");
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleScheme } = useTheme();
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.username || user?.email || "Username";
  const accountHref = user ? getNavAccountHref(user) : "/profile";

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const handleLogout = useCallback(async () => {
    closeMobileMenu();
    setIsUserDropdownOpen(false);
    await logout();
    router.push("/auth/login");
    router.refresh();
  }, [closeMobileMenu, logout, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    if (isUserDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);

  useEffect(() => {
    if (pathname) closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close menu on route change
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navMuted = isDark ? "text-gray-400 hover:text-white" : "text-[color:var(--tott-muted)] hover:text-[color:var(--tott-accent-tide)]";
  const navRowHover = isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-[color:var(--tott-accent-tide-subtle)] hover:text-[color:var(--tott-accent-tide)]";
  const chipBg = isDark ? theme.cardBorder : "var(--tott-well-bg)";
  const borderColor = isDark ? "#333333" : "var(--tott-card-border)";

  return (
    <header
      className={`sticky top-0 z-50 w-full py-2 ${isDark ? "bg-[#171717]" : "bg-[var(--background)]"}`}
    >
      <nav className="flex h-14 w-full items-center justify-between gap-8 px-6">

        {/* Brand — left */}
        <Link
          href="/"
          className={`flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <LogoAnimated className="h-6 w-auto" />
          <span className="font-medium">{t("brand")}</span>
        </Link>

        {/* Right section */}
        <div className="flex items-center justify-end gap-2 lg:gap-4">

          {/* Desktop nav links */}
          {navLinks.map(({ href, messageKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`hidden lg:flex items-center gap-2 transition-colors ${navMuted}`}
            >
              <Icon />
              <span>{t(messageKey)}</span>
            </Link>
          ))}

          {/* Divider */}
          <span className={`mx-1 hidden h-8 w-px lg:block`} style={{ backgroundColor: borderColor }} />

          {/* Language switcher */}
          <div className={`hidden items-center gap-2 lg:flex ${navMuted}`}>
            <LanguagesIcon />
            <LanguageSwitcher />
          </div>

          {/* Desktop theme toggle */}
          <button
            type="button"
            onClick={toggleScheme}
            className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              isDark
                ? "border-[#333333] text-gray-400 hover:text-white"
                : "border-gray-200 text-gray-500 hover:text-gray-900"
            }`}
            style={{ backgroundColor: chipBg }}
            aria-label={isDark ? t("switchToLight") : t("switchToDark")}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <>
              {/* Mobile: avatar link */}
              <Link
                href={accountHref}
                className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accentGoldFocus }}
                aria-label={t("profile")}
              >
                <span className="text-sm font-semibold" style={{ color: theme.bgDark }}>
                  {getInitial(user.full_name || user.username, user.email)}
                </span>
              </Link>

              {/* Desktop: user dropdown button */}
              <div ref={dropdownRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isDark
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  style={{ borderColor }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
                  >
                    {getInitial(user.full_name || user.username, user.email)}
                  </span>
                  <span>{displayName}</span>
                  <ChevronDownSmallIcon />
                </button>

                {isUserDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border py-1 shadow-lg ${
                      isDark ? "border-[#333333] bg-[#1a1a1a]" : "border-gray-200 bg-white"
                    }`}
                  >
                    <Link
                      href={accountHref}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        isDark
                          ? "text-gray-300 hover:bg-white/5 hover:text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {t("profile")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        isDark
                          ? "text-gray-300 hover:bg-white/5 hover:text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <LogOutIcon />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login — bordered dark button */}
              <Link
                href="/auth/login"
                className={`hidden lg:inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-white hover:text-white/90" : "text-gray-900 hover:text-gray-700"
                }`}
                style={{ borderColor, backgroundColor: chipBg }}
              >
                {t("login")}
              </Link>

              {/* Sign up — gold fill */}
              <Link
                href="/auth/register"
                className="hidden lg:inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accentGold, color: theme.bgDark }}
              >
                {t("signUp")}
              </Link>
            </>
          )}

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex lg:hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              isDark ? "text-white hover:text-white/90" : "text-gray-800 hover:text-gray-950"
            }`}
            style={{ borderColor, backgroundColor: chipBg }}
            aria-label={t("openMenu")}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay & panel */}
      <div
        className={`fixed inset-0 z-60 lg:hidden ${isMobileMenuOpen ? "visible" : "invisible"}`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={closeMobileMenu}
          className={`absolute inset-0 transition-opacity ${
            isMobileMenuOpen ? "bg-black/60 opacity-100" : "bg-transparent opacity-0"
          }`}
          aria-label={t("closeMenu")}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 flex h-full w-[min(280px,85vw)] flex-col border-l transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } ${isDark ? "border-[#333333] bg-[#171717]" : "border-[var(--tott-card-border)] bg-[var(--background)]"}`}
        >
          <div
            className={`flex flex-col gap-1 border-b p-4 ${isDark ? "border-[#333333]" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{t("menu")}</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className={`rounded-md p-2 transition-colors ${
                  isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ backgroundColor: chipBg }}
                aria-label={t("closeMenu")}
              >
                <XIcon />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {navLinks.map(({ href, messageKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${navMuted} ${navRowHover}`}
              >
                <Icon />
                <span>{t(messageKey)}</span>
              </Link>
            ))}

            <span className={`my-2 h-px w-full ${isDark ? "bg-[#333333]" : "bg-gray-200"}`} />

            <div className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${navMuted} ${navRowHover}`}>
              <LanguagesIcon />
              <LanguageSwitcher />
            </div>

            {user ? (
              <>
                <Link
                  href={accountHref}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${navMuted} ${navRowHover}`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                    style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
                  >
                    {getInitial(user.full_name || user.username, user.email)}
                  </span>
                  <span>{displayName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ backgroundColor: chipBg }}
                >
                  <LogOutIcon />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ backgroundColor: chipBg }}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-md px-4 py-3 font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: theme.accentGold, color: theme.bgDark }}
                >
                  {t("signUp")}
                </Link>
              </>
            )}

            <span className={`my-2 h-px w-full ${isDark ? "bg-[#333333]" : "bg-gray-200"}`} />

            {/* Theme toggle — kept in mobile drawer */}
            <button
              type="button"
              onClick={toggleScheme}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${navMuted} ${navRowHover}`}
              aria-label={isDark ? t("switchToLight") : t("switchToDark")}
              aria-pressed={isDark}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              <span>{isDark ? t("lightMode") : t("darkMode")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
