"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AniMaps, type AniMapsStop } from "animaps-react";
import "animaps-react/style.css";
import { isValidCoord, type RouteMapPoint } from "./TripPreviewRouteMap";

type TripPreviewAnimatedRouteMapProps = {
  points: RouteMapPoint[];
  /** Stop label, parallel to `points` — "title || locationName" from the editor. */
  labels: string[];
  className?: string;
};

/** Split "City, Country" (the geocoded locationName) into AniMaps' city/country pair. */
function splitLocation(label: string): { city: string; country: string } {
  const idx = label.lastIndexOf(",");
  if (idx === -1) return { city: label.trim(), country: "" };
  return {
    city: label.slice(0, idx).trim(),
    country: label.slice(idx + 1).trim(),
  };
}

export default function TripPreviewAnimatedRouteMap({
  points,
  labels,
  className = "",
}: TripPreviewAnimatedRouteMapProps) {
  const t = useTranslations("Dashboard.trips.editor.preview");
  const containerRef = useRef<HTMLDivElement>(null);
  const [gold, setGold] = useState("#cba158");

  // routeColor needs a resolved color, not the CSS var reference theme.accentGold holds.
  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue("--tott-accent-gold")
      .trim();
    // External system (CSS custom property) — setState is the bridge.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resolved) setGold(resolved);
  }, []);

  const stops = useMemo<AniMapsStop[]>(() => {
    return points
      .map((p, i) => ({ p, label: labels[i] ?? "" }))
      .filter(({ p }) => isValidCoord(p.lat, p.lng))
      .map(({ p, label }) => ({ ...splitLocation(label), lat: p.lat, lng: p.lng }));
  }, [points, labels]);

  // AniMaps copies initialStops into state once at mount and never re-reads
  // the prop — force a remount whenever the stop set changes.
  const stopsKey = stops.map((s) => `${s.lat},${s.lng},${s.city}`).join("|");

  // The play control is hidden via CSS (chrome fully hidden per design); trigger
  // it once on mount so the route still animates instead of sitting static.
  useEffect(() => {
    if (stops.length < 2) return;
    const id = window.setTimeout(() => {
      containerRef.current
        ?.querySelector<HTMLButtonElement>(".animaps-play")
        ?.click();
    }, 50);
    return () => window.clearTimeout(id);
  }, [stopsKey, stops.length]);

  if (stops.length === 0) {
    return (
      <div
        className={`flex h-full min-h-[280px] items-center justify-center rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-center text-xs text-[var(--tott-muted)] ${className}`}
      >
        {t("noRoute")}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-full w-full overflow-hidden ${className}`}>
      <AniMaps key={stopsKey} initialStops={stops} routeColor={gold} className="ttt-animaps" />
    </div>
  );
}
