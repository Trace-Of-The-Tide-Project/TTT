"use client";

import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]";

const selectClass =
  "w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 pr-9 text-sm text-foreground outline-none focus:border-[var(--tott-card-border)]";

const CURRENCIES = ["USD", "EUR", "GBP", "ILS", "JOD", "EGP", "AED", "SAR"] as const;

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ILS: "₪",
  JOD: "د.أ",
  EGP: "£",
  AED: "د.إ",
  SAR: "﷼",
};

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DollarHeadingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

type TripPricingProps = {
  minPrice: string;
  onMinPriceChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  maxPrice: string;
  onMaxPriceChange: (v: string) => void;
  discount: string;
  onDiscountChange: (v: string) => void;
};

export function TripPricing({
  minPrice,
  onMinPriceChange,
  currency,
  onCurrencyChange,
  maxPrice,
  onMaxPriceChange,
  discount,
  onDiscountChange,
}: TripPricingProps) {
  const t = useTranslations("Dashboard.trips.editor.pricing");

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-[var(--tott-muted)]">
          <DollarHeadingIcon />
        </span>
        {t("heading")}
      </h3>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
            {t("price")}
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
            {t("currency")}
          </label>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className={selectClass}
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                backgroundImage: "none",
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCY_SYMBOL[c] ?? ""})
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
              <ChevronDown />
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
            {t("pricePerPerson")}{" "}
            <span className="text-[var(--tott-muted)]">{t("optional")}</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
            {t("discountPercent")}{" "}
            <span className="text-[var(--tott-muted)]">{t("optional")}</span>
          </label>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => onDiscountChange(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>
    </ChamferedPanel>
  );
}
