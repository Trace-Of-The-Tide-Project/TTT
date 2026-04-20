"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useCallback, useEffect, useState } from "react";
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
} from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useStoredAuthUser } from "@/hooks/useStoredAuthUser";
import { clearStoredAuth } from "@/services/auth.service";
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
  const { isDark, toggleScheme } = useTheme();
  const user = useStoredAuthUser();
  const displayName = user?.full_name || user?.username || user?.email || "Username";
  const accountHref = user ? getNavAccountHref(user) : "/profile";

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const handleLogout = useCallback(() => {
    clearStoredAuth();
    closeMobileMenu();
    router.push("/auth/login");
    router.refresh();
  }, [closeMobileMenu, router]);

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

  const navMuted = isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const navRowHover = isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-gray-100 hover:text-gray-900";
  const chipBg = isDark ? theme.cardBorder : "#e5e7eb";
  const iconBtnBg = chipBg;

  return (
    <header
      className={`sticky top-0 z-50 w-full py-2 ${
        isDark ? "bg-black" : "bg-white"
      }`}
    >
      <nav className="flex h-14 w-full items-center justify-between gap-8 px-6">
        {/* Part 1: Brand - left */}
        <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <Image
              src="/images/Logo.png"
              alt={t("brand")}
              width={100}
              height={24}
              className="h-6 w-auto object-contain"
            />

            <span className="font-medium">{t("brand")}</span>
          </Link>
        </div>

        {/* Part 2: Links + auth - right. From 900px down: auth + hamburger only */}
        <div className="flex items-center justify-end gap-2 lg:gap-4">
          {/* Nav links: visible from 901px up */}
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
          <span
            className={`mx-1 hidden h-8 w-px lg:block ${isDark ? "bg-[#333333]" : "bg-gray-200"}`}
          />
          <div className={`hidden items-center gap-2 lg:flex ${navMuted}`}>
            <LanguagesIcon />
            <LanguageSwitcher />
          </div>
          {user ? (
            <>
              {/* 900px and below: avatar button (rounded square) */}
              <Link
                href="/profile"
                className="flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: chipBg }}
                aria-label={t("profile")}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: theme.accentGoldFocus,
                    color: theme.bgDark,
                  }}
                >
                  {getInitial(user.full_name || user.username, user.email)}
                </span>
              </Link>
              {/* 901px and up: full profile button */}
              <Link
                href={accountHref}
                className={`hidden lg:inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                }`}
                style={{
                  backgroundColor: chipBg,
                }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: theme.accentGoldFocus,
                    color: theme.bgDark,
                  }}
                >
                  {getInitial(user.full_name || user.username, user.email)}
                </span>
                <span>{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`hidden lg:inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                style={{
                  backgroundColor: chipBg,
                }}
              >
                <LogOutIcon />
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`hidden lg:inline-flex rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                style={{
                  backgroundColor: chipBg,
                }}
              >
                {t("login")}
              </Link>
              <Link
                href="/auth/register"
                className="hidden lg:inline-flex rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: theme.accentGold,
                  color: theme.bgDark,
                }}
              >
                {t("signUp")}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={toggleScheme}
            className={`hidden lg:flex rounded-md p-2 transition-colors ${
              isDark ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-gray-900"
            }`}
            style={{
              backgroundColor: iconBtnBg,
            }}
            aria-label={isDark ? t("switchToLight") : t("switchToDark")}
            aria-pressed={isDark}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* 900px and below: hamburger menu (nav links + language + auth in drawer) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isDark ? "text-white hover:text-white/90" : "text-gray-800 hover:text-gray-950"
            }`}
            style={{
              backgroundColor: iconBtnBg,
            }}
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
          className={`absolute right-0 top-0 flex h-full w-full max-w-[280px] flex-col border-l transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } ${isDark ? "border-[#333333] bg-black" : "border-gray-200 bg-white"}`}
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
                style={{ backgroundColor: iconBtnBg }}
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
            <div
              className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${navMuted} ${navRowHover}`}
            >
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
                    style={{
                      backgroundColor: theme.accentGoldFocus,
                      color: theme.bgDark,
                    }}
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
                  className="flex items-center justify-center gap-2 rounded-md px-4 py-3 font-medium transition-colors"
                  style={{
                    backgroundColor: theme.accentGold,
                    color: theme.bgDark,
                  }}
                >
                  {t("signUp")}
                </Link>
              </>
            )}
            <span className={`my-2 h-px w-full ${isDark ? "bg-[#333333]" : "bg-gray-200"}`} />
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
