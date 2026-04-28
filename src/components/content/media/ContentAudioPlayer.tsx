"use client";
/* eslint-disable react-hooks/set-state-in-effect -- reset transport when resolved blob URL changes */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { PlayIcon, PauseIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { formatTime } from "./mediaUtils";
import { useArticleMediaPlaybackUrl } from "@/hooks/useArticleMediaPlaybackUrl";

type ContentAudioPlayerProps = {
  src: string;
  thumbnail?: string;
  title?: string;
  duration?: string;
};

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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTotalTime =
    duration > 0 && isFinite(duration)
      ? formatTime(duration)
      : durationLabel ?? "0:00";

  const waveformHeights = useMemo(
    () =>
      Array.from(
        { length: 200 },
        (_, i) => 0.35 + (Math.sin(i * 0.7) * 0.3 + Math.cos(i * 0.4) * 0.35)
      ),
    []
  );

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [playbackUrl]);

  const showLoading = status === "loading" || (status === "ready" && !playbackUrl);

  return (
    <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 md:p-8 lg:p-10">
      {showLoading ? (
        <div
          className="absolute inset-0 z-[1] animate-pulse rounded-xl bg-[var(--tott-well-bg)]"
          aria-busy="true"
          aria-label="Loading audio"
        />
      ) : null}
      <div className="flex gap-4 sm:gap-6 md:gap-8">
        {thumbnail && (
          <div className="relative h-24 w-24 shrink-0 self-center overflow-hidden rounded-lg sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48">
            <Image src={thumbnail} alt="" fill className="object-cover" sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 sm:gap-4 md:gap-5">
          {/* Upper section: play, name + time */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tott-well-bg)] text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)] sm:h-12 sm:w-12 md:h-14 md:w-14"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="min-w-0 flex-1">
              {title && (
                <p className="text-sm font-semibold text-foreground sm:text-base md:text-lg">{title}</p>
              )}
              <p className="mt-0.5 text-xs text-[var(--tott-muted)] sm:text-sm">
                Audio time: <span className="tabular-nums">{displayTotalTime}</span>
              </p>
            </div>
          </div>

          {/* Waveform with mirrored bottom (curved, reflection effect) */}
          <div
            className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            onClick={handleSeek}
          >
            <span
              className="absolute right-2 top-2 z-10 whitespace-nowrap rounded-full bg-[var(--tott-well-bg)] px-3 py-1 tabular-nums text-sm text-foreground"
            >
              {formatTime(currentTime)}
            </span>
            {/* Main waveform */}
            <div className="relative flex h-12 w-full items-end gap-0.5 pr-16 sm:h-14">
              <div className="relative flex h-full w-full items-end gap-0.5">
                <div className="flex h-full w-full items-end gap-0.5">
                  {waveformHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 shrink-0 rounded-sm"
                      style={{ height: `${h * 100}%`, backgroundColor: "#CCCCCC" }}
                    />
                  ))}
                </div>
                <div
                  className="absolute left-0 top-0 flex h-full items-end gap-0.5 overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {waveformHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 shrink-0 rounded-sm"
                      style={{ height: `${h * 100}%`, backgroundColor: theme.accentGold }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Mirrored waveform (reflection) */}
            <div
              className="relative flex h-12 w-full items-end gap-0.5 pr-16 sm:h-14"
              style={{ transform: "scaleY(-1)" }}
              aria-hidden
            >
              <div className="relative flex h-full w-full items-end gap-0.5">
                <div className="flex h-full w-full items-end gap-0.5">
                  {waveformHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 shrink-0 rounded-sm"
                      style={{ height: `${h * 100}%`, backgroundColor: "#CCCCCC" }}
                    />
                  ))}
                </div>
                <div
                  className="absolute left-0 top-0 flex h-full items-end gap-0.5 overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {waveformHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 shrink-0 rounded-sm"
                      style={{ height: `${h * 100}%`, backgroundColor: theme.accentGold }}
                    />
                  ))}
                </div>
              </div>
            </div>
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
