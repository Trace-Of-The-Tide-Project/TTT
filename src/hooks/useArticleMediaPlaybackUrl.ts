"use client";
/* eslint-disable react-hooks/set-state-in-effect -- effect owns sync URL + async blob + cleanup */

import { useEffect, useState, useRef } from "react";
import { getArticleApiBaseUrl } from "@/lib/content/article-media-url";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function apiMediaOrigin(): string | null {
  const base = getArticleApiBaseUrl().replace(/\/+$/, "");
  return safeOrigin(`${base}/`);
}

/**
 * `<video src>` / `<audio src>` / `<img src>` cannot send credentials cross-origin without
 * CORS-permissible cookies. When the file lives on the API host we fetch through Next.js's
 * cookie-backed `/api/proxy/...` and hand the resulting blob URL to the element.
 */
export function useArticleMediaPlaybackUrl(src: string): {
  playbackUrl: string;
  status: "loading" | "ready" | "error";
} {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = src.trim();
    if (!trimmed) {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      setPlaybackUrl("");
      setStatus("error");
      return;
    }

    const apiOrigin = apiMediaOrigin();
    const mediaOrigin = safeOrigin(trimmed);
    const isApiHosted = Boolean(apiOrigin && mediaOrigin && mediaOrigin === apiOrigin);

    if (!isApiHosted) {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      setPlaybackUrl(trimmed);
      setStatus("ready");
      return;
    }

    const proxyPath = trimmed.replace(apiOrigin ?? "", "");
    const proxyUrl = `/api/proxy${proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`}`;

    setPlaybackUrl("");
    setStatus("loading");
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(proxyUrl, {
          signal: ac.signal,
          credentials: "include",
        });
        if (cancelled || ac.signal.aborted) return;
        if (!res.ok) {
          if (!cancelled) {
            setPlaybackUrl(trimmed);
            setStatus("ready");
          }
          return;
        }
        const ct = res.headers.get("content-type")?.split(";")[0]?.trim() || "";
        const buf = await res.arrayBuffer();
        if (cancelled || ac.signal.aborted) return;
        let mime = "application/octet-stream";
        if (ct.startsWith("video/")) mime = ct;
        else if (ct.startsWith("audio/")) mime = ct;
        else if (isLikelyAudioUrl(trimmed)) mime = "audio/mpeg";
        else if (isLikelyVideoUrl(trimmed)) mime = "video/mp4";
        const blob = new Blob([buf], { type: mime });
        const url = URL.createObjectURL(blob);
        if (cancelled || ac.signal.aborted) {
          URL.revokeObjectURL(url);
          return;
        }
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = url;
        setPlaybackUrl(url);
        setStatus("ready");
      } catch {
        if (!cancelled && !ac.signal.aborted) {
          setPlaybackUrl(trimmed);
          setStatus("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [src]);

  return { playbackUrl, status };
}
