"use client";
/* eslint-disable react-hooks/set-state-in-effect -- player resets when resolved blob URL changes */

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  PlayIcon,
  PauseIcon,
  VolumeIcon,
  VolumeMutedIcon,
  FullscreenIcon,
} from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { formatTime } from "./mediaUtils";
import { useArticleMediaPlaybackUrl } from "@/hooks/useArticleMediaPlaybackUrl";

type ContentVideoPlayerProps = {
  src: string;
  thumbnail?: string;
};

export function ContentVideoPlayer({ src, thumbnail }: ContentVideoPlayerProps) {
  const { playbackUrl, status } = useArticleMediaPlaybackUrl(src);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [volumeSliderOpen, setVolumeSliderOpen] = useState(false);

  const syncTimeFromVideo = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      setCurrentTime(v.currentTime);
      if (isFinite(v.duration)) setDuration(v.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => {
          setPlaying(true);
          syncTimeFromVideo();
          requestAnimationFrame(() => syncTimeFromVideo());
          setTimeout(syncTimeFromVideo, 50);
        })
        .catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [syncTimeFromVideo]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) setCurrentTime(v.currentTime);
  }, []);

  useEffect(() => {
    const syncTime = () => {
      const el = videoRef.current;
      if (el) {
        if (!el.paused) setCurrentTime(el.currentTime);
        if (isFinite(el.duration)) setDuration(el.duration);
      }
    };
    const id = setInterval(syncTime, 100);
    return () => clearInterval(id);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      if (Number.isFinite(v.duration)) setDuration(v.duration);
      setCurrentTime(v.currentTime);
      setVolume(v.volume);
      setMuted(v.muted);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      if (Number.isFinite(v.duration)) setDuration(v.duration);
      setCurrentTime(v.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = e.currentTarget;
    if (!v || !bar) return;
    // Duration is NaN until metadata loads, and Infinity for live
    // streams — seeking with either makes currentTime non-finite and
    // throws. Bail out until we have a real, finite duration.
    if (!Number.isFinite(v.duration) || v.duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) setVolume(v.volume);
  }, []);

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = e.currentTarget;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    v.volume = pct;
    v.muted = pct === 0;
    setVolume(pct);
    setMuted(pct === 0);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePct = muted ? 0 : volume;

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [playbackUrl]);

  const showLoading = status === "loading" || (status === "ready" && !playbackUrl);

  return (
    <div ref={containerRef} className="relative aspect-[21/9] overflow-hidden rounded-xl bg-[var(--tott-panel-bg)]">
      {showLoading ? (
        <div
          className="absolute inset-0 z-[1] animate-pulse bg-[var(--tott-well-bg)]"
          aria-busy="true"
          aria-label="Loading video"
        />
      ) : null}
      <video
        key={playbackUrl || "pending"}
        ref={videoRef}
        src={playbackUrl || undefined}
        poster={thumbnail}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={togglePlay}
        onPlay={syncTimeFromVideo}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        playsInline
      />
      {!playing && thumbnail && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover opacity-60"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      )}
      <div
        className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-4 sm:p-6"
        onClick={togglePlay}
      >
        <div
          className="flex items-center justify-between gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors mt-2 hover:bg-white/20"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div
            className="group flex flex-1 flex-col gap-2 pt-6"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            onClick={handleSeek}
          >
            <div className="relative h-1.5 w-full cursor-pointer rounded-full bg-gray-700">
              <div
                className="absolute left-0 top-0 h-full min-w-[2px] rounded-full bg-[var(--tott-dash-gold-label)] transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-white opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
              />
            </div>
            <span className="shrink-0 rounded  px-1.5 py-0.5 text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="flex items-center gap-2 text-gray-300">
              <div
                className="group/vol relative inline-flex"
                onMouseEnter={() => setVolumeSliderOpen(true)}
                onMouseLeave={() => setVolumeSliderOpen(false)}
              >
                <div
                  className="absolute bottom-2 left-1/2 z-0 h-28 w-10 -translate-x-1/2"
                  aria-hidden
                />
                <div
                  className={`absolute bottom-full left-1/2 z-10 mb-1 flex h-16 w-1.5 -translate-x-1/2 cursor-pointer flex-col justify-end overflow-hidden rounded-full bg-gray-700 ${volumeSliderOpen ? "flex" : "hidden"}`}
                  role="slider"
                  tabIndex={0}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={volumePct}
                  onClick={handleVolumeChange}
                >
                  <div
                    className="w-full rounded-full transition-all"
                    style={{
                      height: `${volumePct * 100}%`,
                      backgroundColor: theme.accentGold,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="relative z-10 hover:text-white"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeMutedIcon /> : <VolumeIcon />}
                </button>
              </div>
              <button type="button" onClick={toggleFullscreen} className="hover:text-white">
                <FullscreenIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
