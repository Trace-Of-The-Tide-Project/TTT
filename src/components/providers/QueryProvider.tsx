"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

function isSilentMeta(meta: Record<string, unknown> | undefined): boolean {
  return Boolean(meta && (meta as { silent?: unknown }).silent);
}

/**
 * Track the app's own theme (`html[data-theme]`, default dark) rather
 * than the OS. QueryProvider sits above ThemeProvider, so we read the
 * DOM attribute directly and watch it instead of using `useTheme()`.
 */
function useDomTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark",
      );
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const dir = RTL_LOCALES.has(locale.split("-")[0]) ? "rtl" : "ltr";
  const theme = useDomTheme();

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (isSilentMeta(query.meta)) return;
            toast.error(formatApiError(error, "Something went wrong"));
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (isSilentMeta(mutation.meta)) return;
            toast.error(formatApiError(error, "Something went wrong"));
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        dir={dir}
        position="bottom-right"
        closeButton
        theme={theme}
        toastOptions={{
          style: { zIndex: 100 },
          // Style the toast with the app's design tokens (theme-aware via
          // `html[data-theme]`) instead of sonner's hardcoded richColors.
          // Type meaning is carried by the icon color, not a loud fill.
          classNames: {
            toast:
              "!rounded-xl !border !border-[var(--tott-card-border)] !bg-[var(--tott-dash-surface)] !text-foreground !shadow-xl",
            title: "!text-sm !font-medium !text-foreground",
            description: "!text-[var(--tott-muted)]",
            actionButton:
              "!rounded-lg !bg-[var(--tott-accent-gold)] !text-[var(--tott-auth-btn-text)]",
            cancelButton:
              "!rounded-lg !bg-[var(--tott-dash-surface-inset)] !text-foreground",
            closeButton:
              "!border-[var(--tott-card-border)] !bg-[var(--tott-dash-surface)] !text-[var(--tott-muted)] hover:!text-foreground",
            success: "[&_[data-icon]]:!text-[var(--tott-status-emerald)]",
            error: "[&_[data-icon]]:!text-[var(--tott-status-coral)]",
            warning: "[&_[data-icon]]:!text-[var(--tott-status-amber)]",
            info: "[&_[data-icon]]:!text-[var(--tott-accent-gold)]",
          },
        }}
      />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
