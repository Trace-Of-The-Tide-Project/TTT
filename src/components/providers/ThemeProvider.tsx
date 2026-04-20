"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "tott-color-scheme";

function readStored(): "light" | "dark" | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function applyDomTheme(scheme: "light" | "dark") {
  document.documentElement.dataset.theme = scheme;
  document.documentElement.style.colorScheme = scheme === "dark" ? "dark" : "light";
}

export type ThemeScheme = "light" | "dark";

type ThemeContextValue = {
  scheme: ThemeScheme;
  isDark: boolean;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /** No `localStorage` value → dark (see root layout inline bootstrap). */
  const [scheme, setSchemeState] = useState<ThemeScheme>(() => readStored() ?? "dark");

  useEffect(() => {
    applyDomTheme(scheme);
  }, [scheme]);

  const toggleScheme = useCallback(() => {
    const next = scheme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setSchemeState(next);
    applyDomTheme(next);
  }, [scheme]);

  const value = useMemo(
    () => ({
      scheme,
      isDark: scheme === "dark",
      toggleScheme,
    }),
    [scheme, toggleScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
