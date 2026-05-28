"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DARK_TILE =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export type RouteMapPoint = {
  order: number;
  lat: number;
  lng: number;
};

function isValidCoord(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Numbered marker styled to match the mockup:
 * gold fill + dark numeral, ringed by a white outer halo.
 */
function numberedDivIcon(n: number) {
  return L.divIcon({
    className: "!m-0 !bg-transparent !border-0",
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:#cba158;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);color:#332217;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;font-family:system-ui,sans-serif;">${n}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/**
 * Watch html[data-theme] + prefers-color-scheme so the tile layer
 * matches the active theme. Returns "light" or "dark".
 */
function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const compute = (): "light" | "dark" => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
      return window.matchMedia?.("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    };

    // External system (DOM attribute + media query) — setState is the
    // bridge. No render-phase alternative.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(compute());

    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    const onMq = () => setMode(compute());
    mq?.addEventListener?.("change", onMq);

    const obs = new MutationObserver(() => setMode(compute()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      mq?.removeEventListener?.("change", onMq);
      obs.disconnect();
    };
  }, []);

  return mode;
}

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0]!, 11);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 14 });
  }, [map, points]);
  return null;
}

type TripPreviewRouteMapProps = {
  points: RouteMapPoint[];
  className?: string;
};

export default function TripPreviewRouteMap({ points, className = "" }: TripPreviewRouteMapProps) {
  const themeMode = useThemeMode();
  const tileUrl = themeMode === "light" ? LIGHT_TILE : DARK_TILE;

  const positions = useMemo(() => {
    return points
      .filter((p) => isValidCoord(p.lat, p.lng))
      .map((p) => ({ ...p, pos: [p.lat, p.lng] as [number, number] }));
  }, [points]);

  const linePositions = useMemo(
    () => positions.map((p) => p.pos),
    [positions],
  );

  const center: [number, number] = positions[0]?.pos ?? [46.6863, 7.8632];

  if (positions.length === 0) {
    return (
      <div
        className={`flex h-full min-h-[280px] items-center justify-center rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-center text-xs text-gray-500 ${className}`}
      >
        Add latitude and longitude to itinerary stops to show the route on the map.
      </div>
    );
  }

  return (
    <div className={`h-full w-full overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={11}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        attributionControl
      >
        <TileLayer key={tileUrl} attribution={TILE_ATTRIB} url={tileUrl} />
        {linePositions.length >= 2 && (
          <Polyline
            positions={linePositions}
            pathOptions={{
              color: "#CBA158",
              weight: 5,
              opacity: 0.95,
            }}
          />
        )}
        {positions.map((p) => (
          <Marker key={p.order} position={p.pos} icon={numberedDivIcon(p.order)} />
        ))}
        <FitRoute points={linePositions} />
      </MapContainer>
    </div>
  );
}
