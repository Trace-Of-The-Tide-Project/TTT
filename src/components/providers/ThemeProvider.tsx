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

export type ThemeScheme = "light" | "dark" | "tide";

/** Order the toggle cycles through: dark → light → tide → dark. */
const CYCLE: ThemeScheme[] = ["dark", "light", "tide"];

function isScheme(v: unknown): v is ThemeScheme {
  return v === "light" || v === "dark" || v === "tide";
}

function readStored(): ThemeScheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (isScheme(v)) return v;
  } catch {
    /* ignore */
  }
  return null;
}

function applyDomTheme(scheme: ThemeScheme) {
  document.documentElement.dataset.theme = scheme;
  /* tide is a light-family theme (sand surface), so only `dark` uses the dark UA scheme. */
  document.documentElement.style.colorScheme = scheme === "dark" ? "dark" : "light";
}

type ThemeContextValue = {
  scheme: ThemeScheme;
  /** True only for the dark theme; light and tide (sand) are both light-family. */
  isDark: boolean;
  /** Cycle dark → light → tide → dark. */
  toggleScheme: () => void;
  /** Jump directly to a specific theme. */
  setScheme: (scheme: ThemeScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /** No `localStorage` value → dark (see root layout inline bootstrap). */
  const [scheme, setSchemeState] = useState<ThemeScheme>(() => readStored() ?? "dark");

  useEffect(() => {
    applyDomTheme(scheme);
  }, [scheme]);

  const setScheme = useCallback((next: ThemeScheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setSchemeState(next);
    applyDomTheme(next);
  }, []);

  const toggleScheme = useCallback(() => {
    const i = CYCLE.indexOf(scheme);
    setScheme(CYCLE[(i + 1) % CYCLE.length]);
  }, [scheme, setScheme]);

  const value = useMemo(
    () => ({
      scheme,
      isDark: scheme === "dark",
      toggleScheme,
      setScheme,
    }),
    [scheme, toggleScheme, setScheme],
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
