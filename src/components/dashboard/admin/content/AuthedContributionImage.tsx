"use client";

import { useEffect, useState } from "react";
import { getArticleApiBaseUrl, resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { contributionFileApiUrl } from "@/services/contributions.service";
import { getStoredToken } from "@/services/auth.service";

type AuthedContributionImageProps = {
  path: string;
  alt?: string;
  className?: string;
};

/** True when the resolved URL is on the API host (Bearer may be required). */
function isApiOriginUrl(resolvedUrl: string): boolean {
  try {
    const u = new URL(resolvedUrl);
    const api = new URL(getArticleApiBaseUrl());
    return u.origin === api.origin;
  } catch {
    return false;
  }
}

/**
 * Prefer signed/public `https` refs as-is. For relative keys, try **Bearer fetch on the API**
 * (`{api}/{path}`) first so private GCS buckets work when the backend proxies the file; then fall
 * back to {@link resolveArticleMediaSrc} (public GCS / CDN) as a plain {@code <img>} src.
 */
export function AuthedContributionImage({ path, alt = "", className }: AuthedContributionImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  /* eslint-disable react-hooks/set-state-in-effect -- resolve `path` to blob/https for <img> */
  useEffect(() => {
    const raw = path.trim();
    if (!raw) {
      setSrc(null);
      setStatus("error");
      return;
    }

    if (/^https?:\/\//i.test(raw)) {
      setSrc(raw);
      setStatus("ready");
      return;
    }

    let objectUrl: string | null = null;
    const ac = new AbortController();
    setStatus("loading");

    (async () => {
      const token = getStoredToken();

      const fetchInit = (): RequestInit => {
        const init: RequestInit = { signal: ac.signal };
        if (token) {
          init.headers = { Authorization: `Bearer ${token}` };
        }
        return init;
      };

      if (token) {
        try {
          const apiUrl = contributionFileApiUrl(raw);
          const res = await fetch(apiUrl, fetchInit());
          if (!ac.signal.aborted && res.ok) {
            const blob = await res.blob();
            if (ac.signal.aborted) return;
            objectUrl = URL.createObjectURL(blob);
            setSrc(objectUrl);
            setStatus("ready");
            return;
          }
        } catch {
          /* fall through */
        }
      }

      const abs = resolveArticleMediaSrc(raw);
      if (!abs) {
        if (!ac.signal.aborted) {
          setSrc(null);
          setStatus("error");
        }
        return;
      }

      if (!isApiOriginUrl(abs)) {
        if (!ac.signal.aborted) {
          setSrc(abs);
          setStatus("ready");
        }
        return;
      }

      try {
        const res = await fetch(abs, fetchInit());
        if (ac.signal.aborted) return;
        if (!res.ok) {
          setSrc(null);
          setStatus("error");
          return;
        }
        const blob = await res.blob();
        if (ac.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setStatus("ready");
      } catch {
        if (!ac.signal.aborted) {
          setSrc(null);
          setStatus("error");
        }
      }
    })();

    return () => {
      ac.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  /* eslint-enable react-hooks/set-state-in-effect */
  if (status === "loading" || status === "idle") {
    return (
      <div
        className={`animate-pulse bg-[var(--tott-dash-surface-inset)] ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  if (status === "error" || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--tott-dash-input-bg)] text-[10px] text-gray-600 ${className ?? ""}`}
        title="Could not load image"
      >
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob: URL or public https URL
    <img src={src} alt={alt} className={className} loading="lazy" />
  );
}
