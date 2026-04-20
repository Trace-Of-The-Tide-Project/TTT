"use client";

import { useLocale, useTranslations } from "next-intl";
import { tripDisplayPriceLabel } from "@/services/trips.service";
import type { EditorStop } from "./ItineraryBuilder";

function DocIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

type SummaryRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <p className="mt-0.5 pl-6 text-xs text-gray-500">{value}</p>
    </div>
  );
}

type TripSummaryProps = {
  title: string;
  startDate: string;
  durationHours: number;
  price: string;
  currency: string;
  stops: EditorStop[];
};

export function TripSummary({
  title,
  startDate,
  durationHours,
  price,
  currency,
  stops,
}: TripSummaryProps) {
  const t = useTranslations("Dashboard.trips.editor.summary");
  const locale = useLocale();
  const namedStops = stops
    .map((s) => (s.title.trim() || s.locationName.trim()))
    .filter(Boolean);

  const shortNames = namedStops.map((n) => n.split(",")[0]!.trim());

  const routeDisplay = shortNames.length > 0
    ? shortNames.join(" \u2192 ")
    : t("placeholder");

  const dateDisplay = startDate
    ? new Date(startDate).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : t("placeholder");

  const lastStop = namedStops.length > 0
    ? namedStops[namedStops.length - 1]!
    : t("placeholder");

  const priceNum = parseFloat(price);
  const priceDisplay =
    priceNum > 0
      ? tripDisplayPriceLabel({
          price,
          currency,
        })
      : t("placeholder");

  return (
    <div className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-4">
      <h3 className="mb-4 text-base font-bold italic text-foreground">{t("heading")}</h3>

      <div className="flex flex-col gap-3">
        <SummaryRow
          icon={<DocIcon />}
          label={t("title")}
          value={title.trim() || t("untitled")}
        />
        <SummaryRow
          icon={<RouteIcon />}
          label={t("route")}
          value={routeDisplay}
        />
        <SummaryRow
          icon={<CalendarIcon />}
          label={t("startDate")}
          value={dateDisplay}
        />
        <SummaryRow
          icon={<ClockIcon />}
          label={t("duration")}
          value={t("durationHours", { hours: durationHours })}
        />
        <SummaryRow
          icon={<LocationIcon />}
          label={t("lastStop")}
          value={lastStop}
        />
        <SummaryRow
          icon={<DollarIcon />}
          label={t("price")}
          value={priceDisplay}
        />
      </div>
    </div>
  );
}
