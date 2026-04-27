"use client";

import { useEffect, useState } from "react";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { contributionFileProxyUrl } from "@/services/contributions.service";

type AuthedContributionImageProps = {
  path: string;
  alt?: string;
  className?: string;
};

/**
 * Renders an image whose binary lives on the API host and requires the session cookie.
 * Fetches via `/api/proxy/{path}` (credentials forwarded) and shows the resulting blob.
 * Falls back to the public bucket URL for `https://` refs.
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
      try {
        const proxyUrl = contributionFileProxyUrl(raw);
        if (proxyUrl) {
          const res = await fetch(proxyUrl, {
            signal: ac.signal,
            credentials: "include",
          });
          if (!ac.signal.aborted && res.ok) {
            const blob = await res.blob();
            if (ac.signal.aborted) return;
            objectUrl = URL.createObjectURL(blob);
            setSrc(objectUrl);
            setStatus("ready");
            return;
          }
        }
      } catch {
        /* fall through to public URL */
      }

      const abs = resolveArticleMediaSrc(raw);
      if (!abs) {
        if (!ac.signal.aborted) {
          setSrc(null);
          setStatus("error");
        }
        return;
      }
      if (!ac.signal.aborted) {
        setSrc(abs);
        setStatus("ready");
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
