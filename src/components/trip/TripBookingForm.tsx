"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DynamicOpenCallForm } from "@/components/open-call/DynamicOpenCallForm";
import type { ApplicationFormField } from "@/services/open-calls.service";
import { theme } from "@/lib/theme";
import {
  DEFAULT_TRIP_BOOKING_FORM_FIELDS,
  formatTripPriceAmount,
  sliderUiMaxForMinPrice,
  tripDisplayPriceLabel,
  tripHasMinimumContribution,
} from "@/services/trips.service";

type TripBookingFormProps = {
  /** Minimum contribution (API `price`). Join form scales from here with no stored maximum. */
  minPrice: string;
  currency?: string;
  fields?: ApplicationFormField[] | null;
};

export function TripBookingForm({
  minPrice,
  currency = "USD",
  fields,
}: TripBookingFormProps) {
  const tt = useTranslations("Dashboard.applicationForm.tripBooking");
  const resolvedFields =
    fields && fields.length > 0 ? fields : DEFAULT_TRIP_BOOKING_FORM_FIELDS;

  const minNum = parseFloat(minPrice);
  const hasSlider = tripHasMinimumContribution(minPrice);
  const uiMax = useMemo(() => sliderUiMaxForMinPrice(minNum), [minNum]);

  const step = useMemo(() => {
    if (!hasSlider || !Number.isFinite(minNum) || !Number.isFinite(uiMax)) return 1;
    if (minNum % 1 !== 0 || uiMax % 1 !== 0) return 0.01;
    return 1;
  }, [hasSlider, minNum, uiMax]);

  const [selected, setSelected] = useState(() =>
    Number.isFinite(minNum) && minNum > 0 ? minNum : 0,
  );

  useEffect(() => {
    const lo = parseFloat(minPrice);
    if (!tripHasMinimumContribution(minPrice) || !Number.isFinite(lo)) return;
    const hi = sliderUiMaxForMinPrice(lo);
    setSelected((prev) => {
      const p = Number.isFinite(prev) ? prev : lo;
      return Math.min(hi, Math.max(lo, p));
    });
  }, [minPrice]);

  const summaryLabel = tripDisplayPriceLabel({
    price: minPrice,
    currency,
  });

  const wellStyle = {
    backgroundColor: theme.panelWellBackground,
    borderColor: theme.cardBorder,
  } as const;

  const priceSlot = hasSlider && Number.isFinite(uiMax) && uiMax > minNum ? (
    <div className="space-y-4 rounded-lg border px-4 py-4" style={wellStyle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[color:var(--tott-panel-text)]">
            {tt("chooseContribution")}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold tabular-nums text-[color:var(--tott-panel-text)]">
          {formatTripPriceAmount(selected, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
        <span className="tabular-nums">{formatTripPriceAmount(minNum, currency)}</span>
        <span className="text-gray-400">{tt("more")}</span>
      </div>
      <input
        type="range"
        name="selected_trip_price"
        min={minNum}
        max={uiMax}
        step={step}
        value={selected}
        onChange={(e) => setSelected(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--tott-card-border)] accent-[#CBA158]"
        aria-valuemin={minNum}
        aria-valuemax={uiMax}
        aria-valuenow={selected}
        aria-label={tt("ariaContribution")}
      />
    </div>
  ) : (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3" style={wellStyle}>
      <span className="text-sm text-gray-400">{tt("tripPrice")}</span>
      <span className="text-lg font-bold text-[color:var(--tott-panel-text)]">{summaryLabel}</span>
    </div>
  );

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: theme.panelBackground,
        borderColor: theme.cardBorder,
        color: theme.panelForeground,
      }}
    >
      <h3 className="text-lg font-semibold text-[color:var(--tott-panel-text)]">{tt("joinTitle")}</h3>
      <p className="mt-1 text-xs text-gray-400">{tt("joinSubtitle")}</p>

      <div className="mt-5">
        <DynamicOpenCallForm
          fields={resolvedFields}
          submitLabel={tt("bookNow")}
          showHomeLink={false}
          beforeSubmitSlot={priceSlot}
          afterSubmitSlot={
            <p className="text-center text-xs text-gray-500">{tt("termsNote")}</p>
          }
        />
      </div>
    </div>
  );
}
