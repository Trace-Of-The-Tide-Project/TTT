"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

type LocationMapPickerProps = {
  latitude: string;
  longitude: string;
  onLocationSelect: (loc: { latitude: string; longitude: string; name?: string }) => void;
  searchPlaceholder: string;
  searchingLabel: string;
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

/* ── Forward-geocode a search query into results ── */
async function forwardGeocode(
  query: string,
  acceptLanguage: string,
): Promise<{ lat: number; lng: number; name: string }[]> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      { headers: { "Accept-Language": acceptLanguage } }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: { lat: string; lon: string; display_name: string }) => ({
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
      name: d.display_name,
    }));
  } catch {
    return [];
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
  searchPlaceholder,
  searchingLabel,
}: LocationMapPickerProps) {
  const uiLocale = useLocale();
  const acceptLanguage = uiLocale.startsWith("ar") ? "ar" : uiLocale.startsWith("he") ? "he" : "en";
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasPosition = !Number.isNaN(lat) && !Number.isNaN(lng);
  const position: [number, number] = hasPosition ? [lat, lng] : DEFAULT_CENTER;

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) return;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await forwardGeocode(q, acceptLanguage);
      setResults(r);
      setSearching(false);
    }, 500);
  }, [acceptLanguage]);

  const selectResult = useCallback(
    (r: { lat: number; lng: number; name: string }) => {
      onLocationSelect({
        latitude: r.lat.toFixed(6),
        longitude: r.lng.toFixed(6),
        name: r.name,
      });
      setFlyTarget({ lat: r.lat, lng: r.lng });
      setSearchQuery("");
      setResults([]);
    },
    [onLocationSelect]
  );

  return (
    <div className="space-y-2">
      {/* Search box — z above Leaflet panes (~400–800) so results aren’t covered by the map */}
      <div className="relative z-1100">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className={inputClass}
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {searchingLabel}
          </span>
        )}
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-1 mt-1 max-h-40 overflow-y-auto rounded-lg border border-[var(--tott-card-border)] bg-[#222222]">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-[var(--tott-dash-control-bg)] hover:text-foreground"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative z-0 h-[200px] overflow-hidden rounded-lg border border-[var(--tott-card-border)]">
        <MapContainer
          center={position}
          zoom={hasPosition ? 14 : DEFAULT_ZOOM}
          className="h-full w-full"
          style={{ background: "#1a1a1a" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          {flyTarget && <FlyToPosition lat={flyTarget.lat} lng={flyTarget.lng} />}
          {hasPosition && (
            <Marker position={[lat, lng]} draggable ref={markerRef} eventHandlers={eventHandlers} />
          )}
        </MapContainer>
      </div>

      {/* Lat/Lng readout */}
      {hasPosition && (
        <p className="text-xs text-gray-500">
          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
