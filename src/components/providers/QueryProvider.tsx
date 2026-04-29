"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

function isSilentMeta(meta: Record<string, unknown> | undefined): boolean {
  return Boolean(meta && (meta as { silent?: unknown }).silent);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const dir = RTL_LOCALES.has(locale.split("-")[0]) ? "rtl" : "ltr";

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
        position="top-right"
        richColors
        closeButton
        theme="system"
      />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
