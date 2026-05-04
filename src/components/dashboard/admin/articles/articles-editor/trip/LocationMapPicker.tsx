"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/** Detect the active theme so the map tiles match (dark vs. light). */
function useIsLightTheme(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const root = document.documentElement;
      // App stores theme on <html data-theme="light|dark"> or via the
      // `prefers-color-scheme` media query as a fallback.
      const attr = root.getAttribute("data-theme");
      if (attr === "light") setLight(true);
      else if (attr === "dark") setLight(false);
      else setLight(window.matchMedia("(prefers-color-scheme: light)").matches);
    };
    update();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => {
      mq.removeEventListener("change", update);
      obs.disconnect();
    };
  }, []);
  return light;
}

/* Fix default marker icon paths (Webpack strips them) */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [31.5, 35.0];
const DEFAULT_ZOOM = 8;
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

type LocationMapPickerProps = {
  latitude: string;
  longitude: string;
  onLocationSelect: (loc: { latitude: string; longitude: string; name?: string }) => void;
  /** Kept for backwards-compat; unused now that the inline search is gone. */
  searchPlaceholder?: string;
  searchingLabel?: string;
};

/* ── Reverse-geocode a lat/lng into a display name ── */
async function reverseGeocode(lat: number, lng: number, acceptLanguage: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=0`,
      { headers: { "Accept-Language": acceptLanguage } }
    );
    const data = await res.json();
    return data?.display_name ?? undefined;
  } catch {
    return undefined;
  }
}

/* ── Sub-component: handles map click events ── */
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ── Sub-component: fly to a position when it changes ── */
function FlyToPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 14, { duration: 1 });
  }, [map, lat, lng]);
  return null;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onLocationSelect,
}: LocationMapPickerProps) {
  const uiLocale = useLocale();
  const acceptLanguage = uiLocale.startsWith("ar") ? "ar" : uiLocale.startsWith("he") ? "he" : "en";
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasPosition = !Number.isNaN(lat) && !Number.isNaN(lng);
  const position: [number, number] = hasPosition ? [lat, lng] : DEFAULT_CENTER;

  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const isLight = useIsLightTheme();
  const tileUrl = isLight
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const mapBg = isLight ? "#f4f4f4" : "#1a1a1a";

  const markerRef = useRef<L.Marker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const pos = marker.getLatLng();
          onLocationSelect({
            latitude: pos.lat.toFixed(6),
            longitude: pos.lng.toFixed(6),
          });
          reverseGeocode(pos.lat, pos.lng, acceptLanguage).then((name) => {
            if (name)
              onLocationSelect({
                latitude: pos.lat.toFixed(6),
                longitude: pos.lng.toFixed(6),
                name,
              });
          });
        }
      },
    }),
    [onLocationSelect, acceptLanguage]
  );

  const handleMapClick = useCallback(
    (clickLat: number, clickLng: number) => {
      onLocationSelect({
        latitude: clickLat.toFixed(6),
        longitude: clickLng.toFixed(6),
      });
      setFlyTarget({ lat: clickLat, lng: clickLng });
      reverseGeocode(clickLat, clickLng, acceptLanguage).then((name) => {
        if (name) {
          onLocationSelect({ latitude: clickLat.toFixed(6), longitude: clickLng.toFixed(6), name });
        }
      });
    },
    [onLocationSelect, acceptLanguage]
  );

  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      <MapContainer
        center={position}
        zoom={hasPosition ? 14 : DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ background: mapBg }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <ClickHandler onClick={handleMapClick} />
        {flyTarget && <FlyToPosition lat={flyTarget.lat} lng={flyTarget.lng} />}
        {hasPosition && (
          <Marker position={[lat, lng]} draggable ref={markerRef} eventHandlers={eventHandlers} />
        )}
      </MapContainer>
    </div>
  );
}
