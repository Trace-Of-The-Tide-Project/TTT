"use client";

import { useTranslations } from "next-intl";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { IssuePurchaseActions } from "./IssuePurchaseActions";

function priceLabel(price: number | null, currency: string): string {
  if (price == null) return "";
  const nf = new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD" });
  try {
    return nf.format(price);
  } catch {
    return currency + " " + String(price.toFixed(2));
  }
}

/**
 * Framed purchase panel around the existing buy/cart/download logic in
 * `IssuePurchaseActions`. `formats` is unused today (single digital SKU) but
 * kept so print/bundle/subscription can render as extra rows later without
 * another redesign.
 */
export function IssuePurchaseModule({
  issueId,
  slug,
  price,
  currency,
  isFree,
  isOwned,
  formats,
}: {
  issueId: string;
  slug: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
  formats?: { label: string }[];
}) {
  const t = useTranslations("MagazineIssueDetail");
  const label = priceLabel(price, currency);

  return (
    <ChamferedSurface
      chamfer={20}
      borderColor="var(--tott-card-border)"
      innerFill="var(--tott-elevated)"
      className="inline-block w-full max-w-sm p-5"
    >
      {!isFree && !isOwned && label ? (
        <p className="font-display text-3xl" style={{ color: "var(--tott-home-text-strong)" }}>
          {label}
        </p>
      ) : null}
      <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
        {t("format.digital")}
      </p>
      {formats?.length ? (
        <ul className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: "var(--tott-home-text-muted)" }}>
          {formats.map((f) => (
            <li
              key={f.label}
              className="rounded-full border px-2.5 py-1"
              style={{ borderColor: "var(--tott-card-border)" }}
            >
              {f.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <IssuePurchaseActions
          issueId={issueId}
          slug={slug}
          price={price}
          currency={currency}
          isFree={isFree}
          isOwned={isOwned}
        />
      </div>
    </ChamferedSurface>
  );
}
