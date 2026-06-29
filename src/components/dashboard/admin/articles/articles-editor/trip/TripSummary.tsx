"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
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
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-[var(--tott-muted)]">{icon}</span>
        {label}
      </div>
      <p className="mt-0.5 pl-6 text-xs text-[var(--tott-muted)]">{value || "---"}</p>
    </div>
  );
}

type TripSummaryProps = {
  title: string;
  startDate: string;
  /** Trip duration in days (preferred). Falls back to `durationHours / 24` if omitted. */
  durationDays?: number;
  durationHours: number;
  price: string;
  currency: string;
  stops: EditorStop[];
  /** Start/end location overrides (new Trip Details model). */
  startLocation?: string;
  endLocation?: string;
  /** Action buttons rendered below a divider, inside the same chamfered card. */
  actions?: ReactNode;
};

export function TripSummary({
  title,
  startDate,
  durationDays,
  durationHours,
  price,
  currency,
  stops,
  startLocation,
  endLocation,
  actions,
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

  // The design renders empty values as "---" so the row spacing stays
  // consistent before the user has entered anything.
  const titleValue = title.trim() || t("untitled");
  // Prefer the new start/end location pair; fall back to itinerary stop names.
  const routeFromLocations =
    [startLocation?.trim(), endLocation?.trim()]
      .filter((s): s is string => Boolean(s))
      .join(" → ") || "";
  const routeValue = routeFromLocations || (shortNames.length > 0 ? shortNames.join(" → ") : "");
  const dateValue = startDate ? dateDisplay : "";
  const locationValue =
    (endLocation?.trim() || "") ||
    (namedStops.length > 0 ? lastStop : "");
  const priceValue = priceNum > 0 ? priceDisplay : "";
  // Duration display: show days when available, otherwise convert hours.
  const days = durationDays ?? Math.round(durationHours / 24);
  const durationValue = days > 0 ? t("durationDays", { count: days }) : "";
  // routeDisplay is computed for backward-compat with the previous prop
  // signature but we now key off the empty-checks above.
  void routeDisplay;
  void lastStop;


  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-4">
      <h3 className="mb-4 text-base font-bold text-foreground">{t("heading")}</h3>

      <div className="flex flex-col gap-3">
        <SummaryRow icon={<DocIcon />} label={t("title")} value={titleValue} />
        <SummaryRow icon={<RouteIcon />} label={t("route")} value={routeValue} />
        <SummaryRow icon={<CalendarIcon />} label={t("startDate")} value={dateValue} />
        <SummaryRow icon={<ClockIcon />} label={t("duration")} value={durationValue} />
        <SummaryRow icon={<LocationIcon />} label={t("location")} value={locationValue} />
        <SummaryRow icon={<DollarIcon />} label={t("price")} value={priceValue} />
      </div>

      {actions ? (
        <>
          <hr className="my-4 border-[var(--tott-card-border)]" />
          <div className="flex flex-col gap-2">{actions}</div>
        </>
      ) : null}
    </ChamferedPanel>
  );
}
