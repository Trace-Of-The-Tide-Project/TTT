"use client";
/* eslint-disable react-hooks/set-state-in-effect -- reset transport when resolved blob URL changes */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { PlayIcon, PauseIcon } from "@/components/ui/icons";
import { formatTime } from "./mediaUtils";
import { useArticleMediaPlaybackUrl } from "@/hooks/useArticleMediaPlaybackUrl";

type ContentAudioPlayerProps = {
  src: string;
  thumbnail?: string;
  title?: string;
  duration?: string;
};

/** Discrete bar heights (px) the Figma waveform draws within an 88px track. */
const BAR_HEIGHTS = [16, 24, 32, 40, 56, 72, 88];
const BAR_COUNT = 180;
/** Bars just ahead of the playhead stay bright before fading to the far tint. */
const NEAR_BAND = 44;

export function ContentAudioPlayer({
  src,
  thumbnail,
  title,
  duration: durationLabel,
}: ContentAudioPlayerProps) {
  const { playbackUrl, status } = useArticleMediaPlaybackUrl(src);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const syncTime = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      setCurrentTime(a.currentTime);
      if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => {
          setPlaying(true);
          syncTime();
          requestAnimationFrame(() => syncTime());
          setTimeout(syncTime, 50);
        })
        .catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [syncTime]);

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (a) setCurrentTime(a.currentTime);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current;
      if (a) {
        if (!a.paused) setCurrentTime(a.currentTime);
        if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const updateDuration = useCallback(() => {
    const a = audioRef.current;
    if (a && isFinite(a.duration) && a.duration > 0) {
      setDuration(a.duration);
    }
  }, []);

  const handleLoadedMetadata = updateDuration;
  const handleDurationChange = updateDuration;

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = e.currentTarget;
    if (!a || !bar) return;
    const d = a.duration;
    if (!isFinite(d) || d <= 0) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * d;
    if (!isFinite(t)) return;
    a.currentTime = t;
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayTotalTime =
    duration > 0 && isFinite(duration)
      ? formatTime(duration)
      : durationLabel ?? "0:00";

  // Stable, seeded bar heights so the waveform shape doesn't reshuffle on render.
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const r = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
        return BAR_HEIGHTS[Math.floor(r * BAR_HEIGHTS.length)];
      }),
    [],
  );
  const playedCount = Math.round(progress * BAR_COUNT);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [playbackUrl]);

  const showLoading = status === "loading" || (status === "ready" && !playbackUrl);

  return (
    <div className="relative">
      {showLoading ? (
        <div
          className="absolute inset-0 z-[1] animate-pulse rounded-2xl bg-[var(--tott-well-bg)]"
          aria-busy="true"
          aria-label="Loading audio"
        />
      ) : null}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
        {thumbnail && (
          <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-2xl border border-[var(--tott-card-border)] sm:w-52 lg:w-64">
            <Image
              src={thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 256px"
            />
          </div>
        )}

        <div className="flex w-full min-w-0 flex-1 flex-col gap-8 sm:gap-10">
          {/* Play button + title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground backdrop-blur-sm transition-opacity hover:opacity-90 [&>svg]:h-6 [&>svg]:w-6"
              style={{
                backgroundColor: "var(--tott-glass-bg)",
                boxShadow: "inset 0px 1px 0px var(--tott-glass-highlight)",
              }}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="flex min-w-0 flex-col gap-1">
              {title && (
                <p
                  className="truncate text-2xl font-medium leading-8 text-foreground"
                  style={{ textShadow: "var(--tott-home-text-shadow)" }}
                >
                  {title}
                </p>
              )}
              <p
                className="text-xs font-medium leading-4 text-[var(--tott-muted)]"
                style={{ textShadow: "var(--tott-home-text-shadow)" }}
              >
                Audio time: <span className="tabular-nums">{displayTotalTime}</span>
              </p>
            </div>
          </div>

          {/* Waveform */}
          <div
            className="relative flex h-[88px] cursor-pointer items-center gap-[3px] overflow-hidden"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            onClick={handleSeek}
          >
            {bars.map((h, i) => {
              const color =
                i < playedCount
                  ? "var(--tott-dash-gold-label)"
                  : i < playedCount + NEAR_BAND
                    ? "var(--tott-wave-near)"
                    : "var(--tott-wave-far)";
              return (
                <div
                  key={i}
                  className="w-[1.5px] shrink-0 rounded-full"
                  style={{ height: `${h}px`, backgroundColor: color }}
                />
              );
            })}
            <span
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-1 text-[11px] font-medium uppercase tracking-[0.02em] tabular-nums text-foreground backdrop-blur-[1px]"
              style={{
                backgroundColor: "var(--tott-glass-bg)",
                boxShadow: "inset 0px 1px 0px var(--tott-glass-highlight)",
              }}
            >
              {currentTime > 0 ? formatTime(currentTime) : displayTotalTime}
            </span>
          </div>
        </div>
      </div>

      <audio
        key={playbackUrl || "pending"}
        ref={audioRef}
        src={playbackUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onCanPlay={updateDuration}
        onEnded={handleEnded}
      />
    </div>
  );
}
