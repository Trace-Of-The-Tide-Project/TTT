"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
 * Mobile-only bottom bar that appears once the inline purchase module
 * (identified by `anchorId`) scrolls out of view. Free/owned issues download
 * rather than buy, so the bar stays hidden for them — the download button
 * already lives inline and doesn't need re-surfacing on scroll.
 */
export function IssueStickyBuyBar({
  anchorId,
  issueId,
  slug,
  price,
  currency,
  isFree,
  isOwned,
}: {
  anchorId: string;
  issueId: string;
  slug: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
}) {
  const t = useTranslations("MagazineIssueDetail");
  const [visible, setVisible] = useState(false);
  const observed = useRef(false);

  useEffect(() => {
    if (isFree || isOwned || observed.current) return;
    const el = document.getElementById(anchorId);
    if (!el) return;
    observed.current = true;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [anchorId, isFree, isOwned]);

  if (isFree || isOwned || !visible) return null;

  const label = priceLabel(price, currency);

  return (
    <div
      role="region"
      aria-label={t("buyThisIssue")}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t px-4 py-3 lg:hidden"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        borderColor: "var(--tott-card-border)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
      }}
    >
      {label ? (
        <span className="text-sm font-medium" style={{ color: "var(--tott-home-text-strong)" }}>
          {label}
        </span>
      ) : null}
      <div className="flex flex-1 items-center justify-end gap-2">
        <IssuePurchaseActions
          issueId={issueId}
          slug={slug}
          price={price}
          currency={currency}
          isFree={isFree}
          isOwned={isOwned}
          variant="compact"
        />
      </div>
    </div>
  );
}
